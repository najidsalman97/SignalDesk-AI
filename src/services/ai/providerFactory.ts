import type { SourceItem } from "@/shared/types/source";

import { getActiveProvider } from "./provider";

import { analyzeWithGemini } from "./providers/gemini";
import { analyzeWithOpenAI } from "./providers/openai";
import { analyzeWithOpenRouter } from "./providers/openrouter";

export async function analyzeReviews(
  reviews: SourceItem[]
) {
  const provider = getActiveProvider();

  switch (provider.provider) {
    case "gemini":
      return analyzeWithGemini(
        reviews,
        provider.apiKey,
        provider.model || "gemini-2.5-flash"
      );

    case "openai":
      return analyzeWithOpenAI(
        reviews,
        provider.apiKey,
        provider.model || "gpt-4.1-mini"
      );

    case "openrouter":
      return analyzeWithOpenRouter(
        reviews,
        provider.apiKey,
        provider.model ||
          "openai/gpt-4.1-mini"
      );

    default:
      throw new Error(
        "No AI provider configured."
      );
  }
}