export type AIProvider =
  | "gemini"
  | "openai"
  | "openrouter";

export interface ProviderSettings {
  provider: AIProvider;

  apiKey: string;

  model: string;

  enabled: boolean;
}