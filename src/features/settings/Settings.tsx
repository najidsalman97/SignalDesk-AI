import { useState } from "react";
import { toast } from "sonner";
import {
  BrainCircuit,
  CheckCircle2,
  Key,
  Plus,
  Settings as SettingsIcon,
  Shield,
  Sparkles,
  Trash2,
} from "lucide-react";

import PageHeader from "@/shared/components/PageHeader";
import { useSettingsStore } from "@/store/settings.store";

const providerOptions = [
  { value: "gemini", label: "Google Gemini", defaultModel: "gemini-2.5-flash" },
  { value: "openai", label: "OpenAI", defaultModel: "gpt-4o" },
  { value: "openrouter", label: "OpenRouter", defaultModel: "anthropic/claude-3.5-sonnet" },
];

export default function Settings() {
  const { providers, addProvider, removeProvider } = useSettingsStore();

  const [provider, setProvider] = useState("gemini");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [key, setKey] = useState("");

  const selectedOption = providerOptions.find((p) => p.value === provider);

  function handleProviderChange(value: string) {
    setProvider(value);
    const option = providerOptions.find((p) => p.value === value);
    if (option) {
      setModel(option.defaultModel);
    }
  }

  function handleSave() {
    if (!key.trim()) {
      toast.error("API key is required");
      return;
    }
    if (!model.trim()) {
      toast.error("Model name is required");
      return;
    }

    addProvider({
      provider: provider as any,
      model,
      apiKey: key,
      enabled: true,
    });

    setKey("");
    toast.success(`${selectedOption?.label} provider configured`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10" data-testid="settings-page">
      <PageHeader
        title="Settings"
        description="Configure AI providers and API keys. Keys are stored locally in your browser."
      />

      {/* Security Notice */}
      <div className="flex items-start gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <div className="rounded-xl bg-emerald-500/10 p-2.5">
          <Shield size={20} className="text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold text-emerald-700">Local Storage Only</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your API keys are stored in your browser's local storage and never sent to any server.
            They are used only for direct API calls to AI providers.
          </p>
        </div>
      </div>

      {/* Add Provider Form */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <Plus size={20} className="text-primary" />
          </div>
          <h2 className="font-semibold">Add AI Provider</h2>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Provider</label>
            <select
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="mt-2 w-full rounded-xl border bg-background p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              data-testid="provider-select"
            >
              {providerOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Model</label>
            <input
              placeholder="e.g., gemini-2.5-flash"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="mt-2 w-full rounded-xl border bg-background p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              data-testid="model-input"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Default: {selectedOption?.defaultModel}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">API Key</label>
            <div className="relative mt-2">
              <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Enter your API key"
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full rounded-xl border bg-background p-3 pl-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                data-testid="api-key-input"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            data-testid="save-provider-btn"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:scale-[1.01] hover:shadow-lg"
          >
            <Sparkles size={18} />
            Save Provider
          </button>
        </div>
      </div>

      {/* Configured Providers */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-500/10 p-2.5">
            <BrainCircuit size={20} className="text-violet-500" />
          </div>
          <h2 className="font-semibold">Configured Providers</h2>
        </div>

        {providers.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed p-8 text-center">
            <SettingsIcon size={32} className="mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              No providers configured yet. Add one above to start analyzing reviews.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {providers.map((p, idx) => (
              <div
                key={`${p.provider}-${idx}`}
                className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <BrainCircuit size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium capitalize">{p.provider}</h3>
                    <p className="text-sm text-muted-foreground">{p.model}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {p.enabled && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">
                      <CheckCircle2 size={14} />
                      Active
                    </span>
                  )}
                  <button
                    onClick={() => {
                      removeProvider(p.provider);
                      toast.success("Provider removed");
                    }}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
