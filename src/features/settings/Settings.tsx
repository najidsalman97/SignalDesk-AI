import { useState } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  Globe,
  GripVertical,
  Key,
  Loader2,
  Plus,
  RefreshCw,
  Server,
  Settings as SettingsIcon,
  Shield,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Wifi,
  WifiOff,
  X,
  Zap,
} from "lucide-react";

import PageHeader from "@/shared/components/PageHeader";
import { useSettingsStore } from "@/store/settings.store";
import { testProviderConnection } from "@/services/ai/providerService";
import type { AIProvider, ProviderSettings, ConnectionStatus } from "@/shared/types/provider";
import { PROVIDER_CONFIGS } from "@/shared/types/provider";

// Glass card component
function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx(
      "rounded-2xl border border-white/[0.08] bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl",
      className
    )}>
      {children}
    </div>
  );
}

// Connection status badge
function StatusBadge({ status, responseTime }: { status: ConnectionStatus; responseTime?: number }) {
  const config = {
    idle: { icon: Clock, label: "Not tested", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
    testing: { icon: Loader2, label: "Testing...", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    connected: { icon: CheckCircle2, label: "Connected", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    invalid: { icon: X, label: "Invalid Key", color: "text-red-400 bg-red-500/10 border-red-500/20" },
    unreachable: { icon: WifiOff, label: "Unreachable", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  };

  // Default to 'idle' if status is undefined or not in config
  const statusConfig = config[status] ?? config.idle;
  const { icon: Icon, label, color } = statusConfig;

  return (
    <div className={clsx("flex items-center gap-2 rounded-lg border px-3 py-1.5", color)}>
      <Icon size={14} className={status === "testing" ? "animate-spin" : ""} />
      <span className="text-xs font-medium">{label}</span>
      {status === "connected" && responseTime && (
        <span className="text-xs opacity-70">{responseTime}ms</span>
      )}
    </div>
  );
}

// Provider icon component
function ProviderIcon({ provider }: { provider: AIProvider }) {
  const iconMap: Record<AIProvider, { bg: string; icon: React.ElementType }> = {
    gemini: { bg: "from-blue-500/20 to-cyan-500/10 border-blue-500/20", icon: Sparkles },
    openai: { bg: "from-emerald-500/20 to-green-500/10 border-emerald-500/20", icon: BrainCircuit },
    openrouter: { bg: "from-purple-500/20 to-violet-500/10 border-purple-500/20", icon: Globe },
    groq: { bg: "from-orange-500/20 to-amber-500/10 border-orange-500/20", icon: Zap },
    ollama: { bg: "from-slate-500/20 to-gray-500/10 border-slate-500/20", icon: Server },
  };

  // Default to gemini style if provider is unknown/corrupted
  const iconConfig = iconMap[provider] ?? iconMap.gemini;
  const { bg, icon: Icon } = iconConfig;

  return (
    <div className={clsx("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br border", bg)}>
      <Icon size={22} className="text-white" />
    </div>
  );
}

// Add Provider Modal
function AddProviderModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const { providers, addProvider, setProviderConnectionStatus, setProviderModels } = useSettingsStore();
  
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>("gemini");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    responseTime?: number;
  } | null>(null);

  const config = PROVIDER_CONFIGS[selectedProvider];
  const existingProvider = providers.find(p => p.provider === selectedProvider);

  async function handleTestAndAdd() {
    if (config.requiresApiKey && !apiKey.trim()) {
      toast.error("API key is required");
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testProviderConnection(
        selectedProvider,
        apiKey,
        selectedProvider === "ollama" ? (baseUrl || config.baseUrl) : undefined
      );

      if (result.success) {
        // Add the provider
        addProvider({
          provider: selectedProvider,
          apiKey,
          baseUrl: selectedProvider === "ollama" ? (baseUrl || config.baseUrl) : undefined,
          model: result.models?.find(m => m.isDefault)?.id || config.defaultModel,
          enabled: true,
        });

        // Update connection status and models
        setProviderConnectionStatus(
          selectedProvider,
          "connected",
          result.responseTime
        );

        if (result.models) {
          setProviderModels(selectedProvider, result.models);
        }

        setTestResult({
          success: true,
          message: `Connected! Found ${result.models?.length || 0} models.`,
          responseTime: result.responseTime,
        });

        toast.success(`${config.name} connected successfully`);
        
        // Close modal after short delay
        setTimeout(() => {
          onClose();
          setApiKey("");
          setBaseUrl("");
          setTestResult(null);
        }, 1500);
      } else {
        setTestResult({
          success: false,
          message: result.errorMessage || "Connection failed",
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "Connection failed",
      });
    } finally {
      setIsTesting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <GlassCard className="relative z-10 w-full max-w-lg p-6 m-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500/20 p-2.5 border border-indigo-500/20">
              <Plus size={20} className="text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Add AI Provider</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-white/5 transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Provider Selection */}
          <div>
            <label className="text-sm font-medium text-slate-300">Provider</label>
            <div className="grid grid-cols-5 gap-2 mt-3">
              {(Object.keys(PROVIDER_CONFIGS) as AIProvider[]).map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    setSelectedProvider(id);
                    setTestResult(null);
                  }}
                  className={clsx(
                    "flex flex-col items-center gap-2 rounded-xl border p-3 transition-all",
                    selectedProvider === id
                      ? "border-indigo-500/50 bg-indigo-500/10"
                      : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]"
                  )}
                >
                  <ProviderIcon provider={id} />
                  <span className="text-xs font-medium text-slate-300">
                    {PROVIDER_CONFIGS[id].name.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Provider Info */}
          <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <ProviderIcon provider={selectedProvider} />
            <div className="flex-1">
              <h3 className="font-semibold text-white">{config.name}</h3>
              <p className="mt-1 text-sm text-slate-400">{config.description}</p>
              <a
                href={config.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
              >
                Get API Key <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* API Key Input */}
          {config.requiresApiKey && (
            <div>
              <label className="text-sm font-medium text-slate-300">API Key</label>
              <div className="relative mt-2">
                <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  placeholder={`Enter your ${config.name} API key`}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setTestResult(null);
                  }}
                  className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] p-3 pl-10 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                  data-testid="provider-api-key-input"
                />
              </div>
            </div>
          )}

          {/* Base URL for Ollama */}
          {selectedProvider === "ollama" && (
            <div>
              <label className="text-sm font-medium text-slate-300">Server URL (Optional)</label>
              <div className="relative mt-2">
                <Server size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="https://ollama.com/api (default)"
                  value={baseUrl}
                  onChange={(e) => {
                    setBaseUrl(e.target.value);
                    setTestResult(null);
                  }}
                  className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] p-3 pl-10 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                  data-testid="provider-base-url-input"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">Leave empty for Ollama Cloud. Use http://localhost:11434 for local server.</p>
            </div>
          )}

          {/* Test Result */}
          {testResult && (
            <div className={clsx(
              "flex items-start gap-3 rounded-xl border p-4",
              testResult.success
                ? "border-emerald-500/20 bg-emerald-500/5"
                : "border-red-500/20 bg-red-500/5"
            )}>
              {testResult.success ? (
                <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className={clsx(
                  "font-medium",
                  testResult.success ? "text-emerald-300" : "text-red-300"
                )}>
                  {testResult.success ? "Connection Successful" : "Connection Failed"}
                </p>
                <p className="mt-1 text-sm text-slate-400 break-words">{testResult.message}</p>
                {testResult.responseTime && (
                  <p className="mt-1 text-xs text-slate-500">Response time: {testResult.responseTime}ms</p>
                )}
              </div>
            </div>
          )}

          {/* Existing Provider Warning */}
          {existingProvider && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-300">
                This will replace your existing {config.name} configuration.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 font-medium text-slate-300 transition-all hover:bg-white/[0.08]"
            >
              Cancel
            </button>
            <button
              onClick={handleTestAndAdd}
              disabled={isTesting || (config.requiresApiKey && !apiKey.trim())}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="test-and-add-provider-btn"
            >
              {isTesting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Wifi size={18} />
                  Test & Add
                </>
              )}
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// Provider Card Component
function ProviderCard({ 
  provider, 
  index, 
  total,
  onMoveUp,
  onMoveDown,
}: { 
  provider: ProviderSettings; 
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const { 
    removeProvider, 
    toggleProviderEnabled, 
    setProviderConnectionStatus,
    setProviderModels,
    setProviderModel,
  } = useSettingsStore();
  
  const [isTesting, setIsTesting] = useState(false);
  const [showModels, setShowModels] = useState(false);

  const config = PROVIDER_CONFIGS[provider.provider];

  async function handleTestConnection() {
    setIsTesting(true);
    setProviderConnectionStatus(provider.provider, "testing");

    try {
      const result = await testProviderConnection(
        provider.provider,
        provider.apiKey,
        provider.baseUrl
      );

      setProviderConnectionStatus(
        provider.provider,
        result.status,
        result.responseTime,
        result.errorMessage
      );

      if (result.success && result.models) {
        setProviderModels(provider.provider, result.models);
        toast.success(`${config.name} connected - ${result.models.length} models available`);
      } else {
        toast.error(result.errorMessage || "Connection failed");
      }
    } catch (error) {
      setProviderConnectionStatus(
        provider.provider,
        "unreachable",
        undefined,
        error instanceof Error ? error.message : "Connection failed"
      );
      toast.error("Connection failed");
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <GlassCard className={clsx(
      "transition-all duration-200",
      !provider.enabled && "opacity-60"
    )}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Drag Handle & Priority */}
          <div className="flex flex-col items-center gap-1 pt-1">
            <button
              onClick={onMoveUp}
              disabled={index === 0}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowUp size={14} />
            </button>
            <span className="text-xs font-bold text-slate-500">#{index + 1}</span>
            <button
              onClick={onMoveDown}
              disabled={index === total - 1}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowDown size={14} />
            </button>
          </div>

          {/* Provider Info */}
          <ProviderIcon provider={provider.provider} />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-white">{config.name}</h3>
              <StatusBadge 
                status={isTesting ? "testing" : provider.connectionStatus} 
                responseTime={provider.responseTime} 
              />
            </div>
            
            <div className="mt-2 flex items-center gap-3 text-sm text-slate-400">
              <span className="font-mono text-xs bg-white/5 px-2 py-0.5 rounded">
                {provider.model}
              </span>
              {(provider.availableModels?.length ?? 0) > 0 && (
                <button
                  onClick={() => setShowModels(!showModels)}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {provider.availableModels?.length ?? 0} models
                  <ChevronDown size={14} className={clsx("transition-transform", showModels && "rotate-180")} />
                </button>
              )}
            </div>

            {/* Error Message */}
            {provider.errorMessage && provider.connectionStatus !== "connected" && (
              <p className="mt-2 text-xs text-red-400 line-clamp-2">
                {provider.errorMessage}
              </p>
            )}

            {/* Last Tested */}
            {provider.lastTested && (
              <p className="mt-2 text-xs text-slate-500">
                Last tested: {new Date(provider.lastTested).toLocaleString()}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="rounded-lg p-2.5 text-slate-400 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50"
              title="Test Connection"
              data-testid={`test-connection-${provider.provider}`}
            >
              <RefreshCw size={18} className={isTesting ? "animate-spin" : ""} />
            </button>
            
            <button
              onClick={() => toggleProviderEnabled(provider.provider)}
              className={clsx(
                "rounded-lg p-2.5 transition-colors",
                provider.enabled 
                  ? "text-emerald-400 hover:bg-emerald-500/10" 
                  : "text-slate-500 hover:bg-white/5"
              )}
              title={provider.enabled ? "Disable" : "Enable"}
              data-testid={`toggle-provider-${provider.provider}`}
            >
              {provider.enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            </button>

            <button
              onClick={() => {
                removeProvider(provider.provider);
                toast.success(`${config.name} removed`);
              }}
              className="rounded-lg p-2.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
              title="Remove"
              data-testid={`remove-provider-${provider.provider}`}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Model Selector */}
        {showModels && (provider.availableModels?.length ?? 0) > 0 && (
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <label className="text-sm font-medium text-slate-300">Select Model</label>
            <div className="mt-2 grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
              {(provider.availableModels ?? []).map((model) => (
                <button
                  key={model.id}
                  onClick={() => setProviderModel(provider.provider, model.id)}
                  className={clsx(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all",
                    provider.model === model.id
                      ? "border-indigo-500/50 bg-indigo-500/10 text-white"
                      : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:bg-white/[0.04]"
                  )}
                >
                  {provider.model === model.id && <Check size={14} className="text-indigo-400 flex-shrink-0" />}
                  <span className="truncate">{model.name}</span>
                  {model.isDefault && (
                    <span className="ml-auto text-xs text-indigo-400">default</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

export default function Settings() {
  const { providers, autoSelectProvider, setAutoSelectProvider, reorderProviders } = useSettingsStore();
  const [showAddModal, setShowAddModal] = useState(false);

  const connectedCount = providers.filter(p => p.connectionStatus === "connected" && p.enabled).length;

  return (
    <div className="mx-auto max-w-4xl space-y-8" data-testid="settings-page">
      <PageHeader
        title="AI Provider Manager"
        description="Configure and manage multiple AI providers with automatic fallback support."
      />

      {/* Security Notice */}
      <GlassCard className="border-emerald-500/20">
        <div className="flex items-start gap-4 p-5">
          <div className="rounded-xl bg-emerald-500/10 p-2.5 border border-emerald-500/20">
            <Shield size={20} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-emerald-300">Local Storage Only</h3>
            <p className="mt-1 text-sm text-slate-400">
              Your API keys are stored securely in your browser&apos;s local storage and never sent to any server.
              They are used only for direct API calls to AI providers.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-500/10 p-2 border border-indigo-500/20">
              <BrainCircuit size={18} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{providers.length}</p>
              <p className="text-xs text-slate-500">Configured</p>
            </div>
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2 border border-emerald-500/20">
              <CheckCircle2 size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{connectedCount}</p>
              <p className="text-xs text-slate-500">Connected</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <button
            onClick={() => setAutoSelectProvider(!autoSelectProvider)}
            className="flex items-center gap-3 w-full text-left"
            data-testid="toggle-auto-select"
          >
            <div className={clsx(
              "rounded-lg p-2 border transition-colors",
              autoSelectProvider 
                ? "bg-cyan-500/10 border-cyan-500/20" 
                : "bg-slate-500/10 border-slate-500/20"
            )}>
              <Activity size={18} className={autoSelectProvider ? "text-cyan-400" : "text-slate-400"} />
            </div>
            <div>
              <p className={clsx("font-semibold", autoSelectProvider ? "text-cyan-400" : "text-slate-400")}>
                {autoSelectProvider ? "Auto" : "Manual"}
              </p>
              <p className="text-xs text-slate-500">Fallback Mode</p>
            </div>
          </button>
        </GlassCard>
      </div>

      {/* Auto-Select Info */}
      {autoSelectProvider && (
        <GlassCard className="border-cyan-500/20">
          <div className="flex items-start gap-4 p-5">
            <div className="rounded-xl bg-cyan-500/10 p-2.5 border border-cyan-500/20">
              <Zap size={20} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="font-semibold text-cyan-300">Auto-Fallback Enabled</h3>
              <p className="mt-1 text-sm text-slate-400">
                Providers will be tried in priority order (top to bottom). If one fails, the next one will automatically be used.
                Drag providers to reorder priority.
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Add Provider Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/[0.1] bg-white/[0.02] p-6 text-slate-400 transition-all hover:border-indigo-500/30 hover:bg-indigo-500/5 hover:text-indigo-400"
        data-testid="add-provider-btn"
      >
        <Plus size={24} />
        <span className="font-medium">Add AI Provider</span>
      </button>

      {/* Provider List */}
      {providers.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Configured Providers</h2>
            <span className="text-sm text-slate-500">
              {autoSelectProvider ? "Priority order (drag to reorder)" : "Select one to use"}
            </span>
          </div>
          
          <div className="space-y-3">
            {providers
              .sort((a, b) => a.priority - b.priority)
              .map((provider, index) => (
                <ProviderCard
                  key={provider.provider}
                  provider={provider}
                  index={index}
                  total={providers.length}
                  onMoveUp={() => {
                    if (index > 0) {
                      reorderProviders(index, index - 1);
                    }
                  }}
                  onMoveDown={() => {
                    if (index < providers.length - 1) {
                      reorderProviders(index, index + 1);
                    }
                  }}
                />
              ))}
          </div>
        </div>
      ) : (
        <GlassCard className="flex flex-col items-center justify-center py-16">
          <div className="rounded-2xl bg-slate-800/50 p-6 border border-white/[0.06]">
            <SettingsIcon size={40} className="text-slate-500" />
          </div>
          <h3 className="mt-6 text-xl font-semibold text-white">No Providers Configured</h3>
          <p className="mt-2 text-sm text-slate-400 text-center max-w-sm">
            Add an AI provider to start analyzing customer feedback with powerful AI models.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl"
          >
            <Plus size={18} />
            Add Your First Provider
          </button>
        </GlassCard>
      )}

      {/* Add Provider Modal */}
      <AddProviderModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
    </div>
  );
}
