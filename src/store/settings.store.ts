import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProviderSettings } from "@/shared/types/provider";

interface SettingsStore {
  project: string;

  providers: ProviderSettings[];

  setProject(project: string): void;

  addProvider(provider: ProviderSettings): void;

  removeProvider(name: string): void;
}

export const useSettingsStore =
  create<SettingsStore>()(
    persist(
      (set) => ({
        project: "Default Project",

        providers: [],

        setProject(project) {
          set({ project });
        },

        addProvider(provider) {
          set((state) => ({
            providers: [
              ...state.providers.filter(
                (p) => p.provider !== provider.provider
              ),
              provider,
            ],
          }));
        },

        removeProvider(name) {
          set((state) => ({
            providers: state.providers.filter(
              (p) => p.provider !== name
            ),
          }));
        },
      }),
      {
        name: "signaldesk-settings",
      }
    )
  );