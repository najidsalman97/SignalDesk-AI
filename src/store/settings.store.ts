import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProviderSettings, AIProvider, ConnectionStatus, ProviderModel } from "@/shared/types/provider";
import { PROVIDER_CONFIGS } from "@/shared/types/provider";

interface SettingsStore {
  project: string;
  providers: ProviderSettings[];
  autoSelectProvider: boolean;

  setProject(project: string): void;
  setAutoSelectProvider(enabled: boolean): void;

  addProvider(provider: Omit<ProviderSettings, "priority" | "connectionStatus" | "availableModels">): void;
  updateProvider(providerId: AIProvider, updates: Partial<ProviderSettings>): void;
  removeProvider(providerId: AIProvider): void;
  
  setProviderConnectionStatus(
    providerId: AIProvider,
    status: ConnectionStatus,
    responseTime?: number,
    errorMessage?: string
  ): void;
  
  setProviderModels(providerId: AIProvider, models: ProviderModel[]): void;
  setProviderModel(providerId: AIProvider, model: string): void;
  
  reorderProviders(fromIndex: number, toIndex: number): void;
  toggleProviderEnabled(providerId: AIProvider): void;
  
  getEnabledProviders(): ProviderSettings[];
  getConnectedProviders(): ProviderSettings[];
  getActiveProvider(): ProviderSettings | null;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      project: "Default Project",
      providers: [],
      autoSelectProvider: true,

      setProject(project) {
        set({ project });
      },

      setAutoSelectProvider(enabled) {
        set({ autoSelectProvider: enabled });
      },

      addProvider(provider) {
        set((state) => {
          // Remove existing provider with same ID
          const filtered = state.providers.filter(p => p.provider !== provider.provider);
          
          // Calculate new priority (last position)
          const maxPriority = filtered.reduce((max, p) => Math.max(max, p.priority), 0);
          
          const newProvider: ProviderSettings = {
            ...provider,
            priority: maxPriority + 1,
            connectionStatus: "idle",
            availableModels: [],
          };

          return {
            providers: [...filtered, newProvider],
          };
        });
      },

      updateProvider(providerId, updates) {
        set((state) => ({
          providers: state.providers.map(p =>
            p.provider === providerId ? { ...p, ...updates } : p
          ),
        }));
      },

      removeProvider(providerId) {
        set((state) => ({
          providers: state.providers.filter(p => p.provider !== providerId),
        }));
      },

      setProviderConnectionStatus(providerId, status, responseTime, errorMessage) {
        set((state) => ({
          providers: state.providers.map(p =>
            p.provider === providerId
              ? {
                  ...p,
                  connectionStatus: status,
                  responseTime,
                  errorMessage,
                  lastTested: new Date().toISOString(),
                }
              : p
          ),
        }));
      },

      setProviderModels(providerId, models) {
        set((state) => ({
          providers: state.providers.map(p => {
            if (p.provider !== providerId) return p;
            
            // If current model is not in new models list, select default
            const hasCurrentModel = models.some(m => m.id === p.model);
            const defaultModel = models.find(m => m.isDefault)?.id || models[0]?.id || p.model;
            
            return {
              ...p,
              availableModels: models,
              model: hasCurrentModel ? p.model : defaultModel,
            };
          }),
        }));
      },

      setProviderModel(providerId, model) {
        set((state) => ({
          providers: state.providers.map(p =>
            p.provider === providerId ? { ...p, model } : p
          ),
        }));
      },

      reorderProviders(fromIndex, toIndex) {
        set((state) => {
          const providers = [...state.providers];
          const [removed] = providers.splice(fromIndex, 1);
          providers.splice(toIndex, 0, removed);
          
          // Reassign priorities
          return {
            providers: providers.map((p, i) => ({ ...p, priority: i + 1 })),
          };
        });
      },

      toggleProviderEnabled(providerId) {
        set((state) => ({
          providers: state.providers.map(p =>
            p.provider === providerId ? { ...p, enabled: !p.enabled } : p
          ),
        }));
      },

      getEnabledProviders() {
        return get().providers
          .filter(p => p.enabled)
          .sort((a, b) => a.priority - b.priority);
      },

      getConnectedProviders() {
        return get().providers
          .filter(p => p.enabled && p.connectionStatus === "connected")
          .sort((a, b) => a.priority - b.priority);
      },

      getActiveProvider() {
        const state = get();
        const connectedProviders = state.providers
          .filter(p => p.enabled && p.connectionStatus === "connected")
          .sort((a, b) => a.priority - b.priority);

        return connectedProviders[0] || null;
      },
    }),
    {
      name: "signaldesk-settings",
      // Migrate old data to ensure all required fields exist
      migrate: (persistedState: any, version: number) => {
        if (persistedState?.providers) {
          persistedState.providers = persistedState.providers.map((p: any) => ({
            ...p,
            availableModels: p.availableModels ?? [],
            connectionStatus: p.connectionStatus ?? "idle",
            enabled: p.enabled ?? true,
            priority: p.priority ?? 1,
          }));
        }
        return persistedState;
      },
      version: 2,
    }
  )
);
