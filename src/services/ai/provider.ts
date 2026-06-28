import { useSettingsStore } from "@/store/settings.store";

export function getActiveProvider() {
  const providers =
    useSettingsStore.getState().providers;

  const active =
    providers.find((p) => p.enabled);

  if (!active)
    throw new Error(
      "No AI Provider Configured"
    );

  return active;
}