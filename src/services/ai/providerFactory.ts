import type { SourceItem } from "@/shared/types/source";
import type { ProviderSettings, AIProvider } from "@/shared/types/provider";

import { useSettingsStore } from "@/store/settings.store";

import { analyzeWithGemini } from "./providers/gemini";
import { analyzeWithOpenAI } from "./providers/openai";
import { analyzeWithOpenRouter } from "./providers/openrouter";
import { analyzeWithGroq } from "./providers/groq";
import { analyzeWithOllama } from "./providers/ollama";

export class ProviderError extends Error {
  constructor(
    message: string,
    public provider: AIProvider,
    public isRetryable: boolean = true
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

async function analyzeWithProvider(
  reviews: SourceItem[],
  provider: ProviderSettings
) {
  switch (provider.provider) {
    case "gemini":
      return analyzeWithGemini(
        reviews,
        provider.apiKey,
        provider.model || "gemini-2.0-flash"
      );

    case "openai":
      return analyzeWithOpenAI(
        reviews,
        provider.apiKey,
        provider.model || "gpt-4o-mini"
      );

    case "openrouter":
      return analyzeWithOpenRouter(
        reviews,
        provider.apiKey,
        provider.model || "anthropic/claude-3.5-sonnet"
      );

    case "groq":
      return analyzeWithGroq(
        reviews,
        provider.apiKey,
        provider.model || "llama-3.3-70b-versatile"
      );

    case "ollama":
      return analyzeWithOllama(
        reviews,
        provider.model || "llama3.2",
        provider.baseUrl || "http://localhost:11434"
      );

    default:
      throw new ProviderError(
        `Unknown provider: ${provider.provider}`,
        provider.provider,
        false
      );
  }
}

export async function analyzeReviews(reviews: SourceItem[]) {
  const state = useSettingsStore.getState();
  const { providers, autoSelectProvider } = state;

  // Get enabled and connected providers sorted by priority
  const availableProviders = providers
    .filter((p) => p.enabled && p.connectionStatus === "connected")
    .sort((a, b) => a.priority - b.priority);

  if (availableProviders.length === 0) {
    throw new Error(
      "No AI provider configured. Please add and test a provider in Settings."
    );
  }

  const errors: { provider: AIProvider; error: string }[] = [];

  // If auto-select is enabled, try providers in priority order
  if (autoSelectProvider) {
    for (const provider of availableProviders) {
      try {
        console.log(`[AI] Trying provider: ${provider.provider} (${provider.model})`);
        return await analyzeWithProvider(reviews, provider);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.warn(`[AI] Provider ${provider.provider} failed:`, errorMessage);
        errors.push({ provider: provider.provider, error: errorMessage });
        
        // Continue to next provider
        continue;
      }
    }

    // All providers failed
    const errorDetails = errors
      .map((e) => `${e.provider}: ${e.error}`)
      .join("\n");
    throw new Error(
      `All providers failed.\n\n${errorDetails}`
    );
  } else {
    // Use only the first enabled provider (no fallback)
    const provider = availableProviders[0];
    return await analyzeWithProvider(reviews, provider);
  }
}

// Get the currently active provider for display purposes
export function getActiveProvider(): ProviderSettings | null {
  return useSettingsStore.getState().getActiveProvider();
}
