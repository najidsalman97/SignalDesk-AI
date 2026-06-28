export type AIProvider =
  | "gemini"
  | "openai"
  | "openrouter"
  | "groq"
  | "ollama";

export type ConnectionStatus =
  | "idle"
  | "testing"
  | "connected"
  | "invalid"
  | "unreachable";

export interface ProviderModel {
  id: string;
  name: string;
  description?: string;
  contextLength?: number;
  isDefault?: boolean;
}

export interface ProviderConfig {
  id: AIProvider;
  name: string;
  description: string;
  baseUrl: string;
  requiresApiKey: boolean;
  defaultModel: string;
  docsUrl: string;
}

export interface ProviderSettings {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string; // For Ollama custom URL
  model: string;
  enabled: boolean;
  priority: number;
  connectionStatus: ConnectionStatus;
  lastTested?: string;
  responseTime?: number;
  errorMessage?: string;
  availableModels: ProviderModel[];
}

export interface TestConnectionResult {
  success: boolean;
  status: ConnectionStatus;
  responseTime?: number;
  errorMessage?: string;
  models?: ProviderModel[];
}

// Provider configurations
export const PROVIDER_CONFIGS: Record<AIProvider, ProviderConfig> = {
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    description: "Google's latest AI models with advanced reasoning",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    requiresApiKey: true,
    defaultModel: "gemini-2.0-flash",
    docsUrl: "https://ai.google.dev/",
  },
  openai: {
    id: "openai",
    name: "OpenAI",
    description: "GPT models with industry-leading capabilities",
    baseUrl: "https://api.openai.com/v1",
    requiresApiKey: true,
    defaultModel: "gpt-4o-mini",
    docsUrl: "https://platform.openai.com/",
  },
  openrouter: {
    id: "openrouter",
    name: "OpenRouter",
    description: "Access multiple AI models through one API",
    baseUrl: "https://openrouter.ai/api/v1",
    requiresApiKey: true,
    defaultModel: "deepseek/deepseek-chat-v3-0324:free", // Free tier model
    docsUrl: "https://openrouter.ai/",
  },
  groq: {
    id: "groq",
    name: "Groq",
    description: "Ultra-fast inference with LPU technology",
    baseUrl: "https://api.groq.com/openai/v1",
    requiresApiKey: true,
    defaultModel: "llama-3.1-8b-instant", // Free tier with higher daily limits (14,400 RPD)
    docsUrl: "https://console.groq.com/",
  },
  ollama: {
    id: "ollama",
    name: "Ollama (Local)",
    description: "Run open-source models on your local machine",
    baseUrl: "http://localhost:11434",
    requiresApiKey: false,
    defaultModel: "llama3.2",
    docsUrl: "https://ollama.com/",
  },
};
