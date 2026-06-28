import { useState } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  Plug,
  RefreshCw,
  Trash2,
  X,
  Zap,
} from "lucide-react";

import PageHeader from "@/shared/components/PageHeader";
import { useConnectorStore } from "@/store/connector.store";
import { useReviewStore } from "@/store/review.store";
import { fetchConnectorReviews } from "@/services/connectors/connectorService";
import type { Connector, ConnectorType, ConnectorStatus } from "@/shared/types/connector";
import { CONNECTOR_CONFIGS } from "@/shared/types/connector";

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

// Status badge
function StatusBadge({ status }: { status: ConnectorStatus }) {
  const config = {
    idle: { icon: Clock, label: "Not synced", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
    connecting: { icon: Loader2, label: "Connecting...", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    connected: { icon: CheckCircle2, label: "Connected", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    syncing: { icon: RefreshCw, label: "Syncing...", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
    error: { icon: AlertTriangle, label: "Error", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  };

  const { icon: Icon, label, color } = config[status];

  return (
    <div className={clsx("flex items-center gap-2 rounded-lg border px-3 py-1.5", color)}>
      <Icon size={14} className={status === "connecting" || status === "syncing" ? "animate-spin" : ""} />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

// Add Connector Modal
function AddConnectorModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addConnector } = useConnectorStore();
  const [selectedType, setSelectedType] = useState<ConnectorType>("app_store");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [connectorName, setConnectorName] = useState("");

  const config = CONNECTOR_CONFIGS[selectedType];

  function handleTypeChange(type: ConnectorType) {
    setSelectedType(type);
    setFormData({});
    setConnectorName("");
  }

  function handleSubmit() {
    // Validate required fields
    for (const field of config.fields) {
      if (field.required && !formData[field.key]?.trim()) {
        toast.error(`${field.label} is required`);
        return;
      }
    }

    addConnector({
      type: selectedType,
      name: connectorName || config.name,
      config: formData,
    });

    toast.success(`${config.name} connector added`);
    onClose();
    setFormData({});
    setConnectorName("");
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <GlassCard className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 m-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500/20 p-2.5 border border-indigo-500/20">
              <Plug size={20} className="text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Add Data Connector</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-white/5 transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Connector Type Selection */}
        <div className="mb-6">
          <label className="text-sm font-medium text-slate-300 mb-3 block">Select Source</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(CONNECTOR_CONFIGS) as ConnectorType[]).map((type) => {
              const cfg = CONNECTOR_CONFIGS[type];
              return (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={clsx(
                    "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                    selectedType === type
                      ? "border-indigo-500/50 bg-indigo-500/10"
                      : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]"
                  )}
                >
                  <span className="text-2xl">{cfg.icon}</span>
                  <span className="text-xs font-medium text-slate-300">{cfg.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Connector Info */}
        <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 mb-6">
          <span className="text-3xl">{config.icon}</span>
          <div>
            <h3 className="font-semibold text-white">{config.name}</h3>
            <p className="mt-1 text-sm text-slate-400">{config.description}</p>
          </div>
        </div>

        {/* Connector Name */}
        <div className="mb-4">
          <label className="text-sm font-medium text-slate-300">Connector Name</label>
          <input
            type="text"
            placeholder={`My ${config.name} Connector`}
            value={connectorName}
            onChange={(e) => setConnectorName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/[0.1] bg-white/[0.04] p-3 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
        </div>

        {/* Dynamic Fields */}
        <div className="space-y-4 mb-6">
          {config.fields.map((field) => (
            <div key={field.key}>
              <label className="text-sm font-medium text-slate-300">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              
{field.type === "select" ? (
                <select
                  value={formData[field.key] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-white/[0.1] bg-white/[0.04] p-3 text-white focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                >
                  <option value="" className="bg-slate-800 text-white">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-slate-800 text-white">{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type === "password" ? "password" : field.type === "number" ? "number" : "text"}
                  placeholder={field.placeholder}
                  value={formData[field.key] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-white/[0.1] bg-white/[0.04] p-3 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                />
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 font-medium text-slate-300 transition-all hover:bg-white/[0.08]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl"
            data-testid="add-connector-submit"
          >
            <Plus size={18} />
            Add Connector
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

// Connector Card
function ConnectorCard({ connector }: { connector: Connector }) {
  const { removeConnector, setConnectorStatus, updateSyncInfo } = useConnectorStore();
  const { addItems, addFile } = useReviewStore();
  const [isSyncing, setIsSyncing] = useState(false);

  const config = CONNECTOR_CONFIGS[connector.type];

  async function handleSync() {
    setIsSyncing(true);
    setConnectorStatus(connector.id, "syncing");

    try {
      const result = await fetchConnectorReviews(connector);

      if (result.success) {
        addItems(result.reviews);
        addFile();
        updateSyncInfo(connector.id, result.reviews.length);
        toast.success(`Imported ${result.reviews.length} reviews from ${config.name}`);
      } else {
        setConnectorStatus(connector.id, "error", result.errorMessage);
        toast.error(result.errorMessage || "Sync failed");
      }
    } catch (error) {
      setConnectorStatus(connector.id, "error", "Sync failed");
      toast.error("Failed to sync reviews");
    } finally {
      setIsSyncing(false);
    }
  }

  function handleRemove() {
    removeConnector(connector.id);
    toast.success("Connector removed");
  }

  return (
    <GlassCard className="p-5">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={clsx(
          "flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br border text-2xl",
          config.color
        )}>
          {config.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-white">{connector.name}</h3>
            <StatusBadge status={isSyncing ? "syncing" : connector.status} />
          </div>
          
          <p className="mt-1 text-sm text-slate-400">{config.name}</p>
          
          {connector.reviewCount !== undefined && connector.reviewCount > 0 && (
            <p className="mt-1 text-xs text-slate-500">
              {connector.reviewCount} reviews imported
            </p>
          )}

          {connector.lastSync && (
            <p className="mt-1 text-xs text-slate-500">
              Last synced: {new Date(connector.lastSync).toLocaleString()}
            </p>
          )}

          {connector.errorMessage && connector.status === "error" && (
            <p className="mt-2 text-xs text-red-400">{connector.errorMessage}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl disabled:opacity-50"
            data-testid={`sync-connector-${connector.id}`}
          >
            {isSyncing ? (
              <><Loader2 size={16} className="animate-spin" /> Syncing...</>
            ) : (
              <><RefreshCw size={16} /> Sync</>
            )}
          </button>
          
          <button
            onClick={handleRemove}
            className="rounded-lg p-2.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            data-testid={`remove-connector-${connector.id}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

export default function Connectors() {
  const { connectors } = useConnectorStore();
  const [showAddModal, setShowAddModal] = useState(false);

  const totalReviews = connectors.reduce((sum, c) => sum + (c.reviewCount || 0), 0);
  const connectedCount = connectors.filter((c) => c.status === "connected").length;

  return (
    <div className="mx-auto max-w-4xl space-y-8" data-testid="connectors-page">
      <PageHeader
        title="Data Connectors"
        description="Connect to external data sources to automatically import customer feedback."
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-500/10 p-2 border border-indigo-500/20">
              <Plug size={18} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{connectors.length}</p>
              <p className="text-xs text-slate-500">Connectors</p>
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
              <p className="text-xs text-slate-500">Synced</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-cyan-500/10 p-2 border border-cyan-500/20">
              <Zap size={18} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalReviews}</p>
              <p className="text-xs text-slate-500">Reviews Imported</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Add Connector Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/[0.1] bg-white/[0.02] p-6 text-slate-400 transition-all hover:border-indigo-500/30 hover:bg-indigo-500/5 hover:text-indigo-400"
        data-testid="add-connector-btn"
      >
        <Plus size={24} />
        <span className="font-medium">Add Data Connector</span>
      </button>

      {/* Connector List */}
      {connectors.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Your Connectors</h2>
          {connectors.map((connector) => (
            <ConnectorCard key={connector.id} connector={connector} />
          ))}
        </div>
      ) : (
        <GlassCard className="flex flex-col items-center justify-center py-16">
          <div className="rounded-2xl bg-slate-800/50 p-6 border border-white/[0.06]">
            <Plug size={40} className="text-slate-500" />
          </div>
          <h3 className="mt-6 text-xl font-semibold text-white">No Connectors Yet</h3>
          <p className="mt-2 text-sm text-slate-400 text-center max-w-sm">
            Connect to App Store, Google Play, Reddit, or your own data sources to import customer feedback automatically.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl"
          >
            <Plus size={18} />
            Add Your First Connector
          </button>
        </GlassCard>
      )}

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
<p className="mt-1 text-sm text-slate-400">
                Import reviews using app IDs. App Store needs no API key — Google Play requires a free SerpApi key.
              </p>

        <GlassCard className="p-5 border-purple-500/20">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2 border border-purple-500/20">
              <Zap size={18} className="text-purple-400" />
            </div>
            <div>
              <h4 className="font-medium text-white">Custom APIs &amp; CSV</h4>
              <p className="mt-1 text-sm text-slate-400">
                Connect to any REST API or import from public CSV files with flexible column mapping.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Add Connector Modal */}
      <AddConnectorModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}
