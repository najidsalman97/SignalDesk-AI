import { useSettingsStore } from "@/store/settings.store";
import type { ProviderSettings } from "@/shared/types/provider";

export function getActiveProvider(): ProviderSettings | null {
  return useSettingsStore.getState().getActiveProvider();
}
