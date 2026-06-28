/**
 * Token Estimator - Estimates prompt size without external tokenizer packages
 * 
 * Approximation: ~4 characters per token (common for English text)
 * This is a conservative estimate that works across providers
 */

import type { SourceItem } from "@/shared/types/source";
import type { AIProvider } from "@/shared/types/provider";

// Provider context limits (in tokens) - conservative estimates
export const PROVIDER_CONTEXT_LIMITS: Record<AIProvider, number> = {
  gemini: 1000000,    // Gemini 2.0 Flash: 1M tokens
  openai: 128000,     // GPT-4o: 128K tokens
  groq: 32000,        // Llama models: 32K-128K, use conservative
  openrouter: 64000,  // Varies by model, use conservative
  ollama: 8000,       // Local models often have smaller context
};

// Safety margin - keep prompts at 70% of max to leave room for response
const SAFETY_MARGIN = 0.7;

// Characters per token approximation
const CHARS_PER_TOKEN = 4;

// Overhead per review (formatting, separators, metadata)
const REVIEW_OVERHEAD_CHARS = 300;

// System prompt overhead (approximate)
const SYSTEM_PROMPT_TOKENS = 500;

// Response reservation (tokens for AI response)
const RESPONSE_RESERVATION_TOKENS = 4000;

export interface TokenEstimate {
  totalTokens: number;
  promptTokens: number;
  reviewTokens: number;
  overheadTokens: number;
  exceedsLimit: boolean;
  recommendedChunkSize: number;
  provider: AIProvider;
  contextLimit: number;
  safeLimit: number;
}

/**
 * Estimate tokens for a single review
 */
export function estimateReviewTokens(review: SourceItem): number {
  const contentLength = review.content?.length || 0;
  const titleLength = review.title?.length || 0;
  const metadataLength = Object.entries(review.metadata || {})
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join("\n").length;
  
  const totalChars = contentLength + titleLength + metadataLength + REVIEW_OVERHEAD_CHARS;
  return Math.ceil(totalChars / CHARS_PER_TOKEN);
}

/**
 * Estimate tokens for an array of reviews
 */
export function estimateReviewsTokens(reviews: SourceItem[]): number {
  return reviews.reduce((sum, review) => sum + estimateReviewTokens(review), 0);
}

/**
 * Get safe context limit for a provider
 */
export function getSafeContextLimit(provider: AIProvider): number {
  const limit = PROVIDER_CONTEXT_LIMITS[provider] || 32000;
  return Math.floor(limit * SAFETY_MARGIN) - SYSTEM_PROMPT_TOKENS - RESPONSE_RESERVATION_TOKENS;
}

/**
 * Calculate optimal chunk size based on provider and total reviews
 */
export function calculateOptimalChunkSize(
  reviews: SourceItem[],
  provider: AIProvider
): number {
  const safeLimit = getSafeContextLimit(provider);
  const totalTokens = estimateReviewsTokens(reviews);
  
  if (totalTokens <= safeLimit) {
    // All reviews fit in one chunk
    return reviews.length;
  }
  
  // Calculate average tokens per review
  const avgTokensPerReview = totalTokens / reviews.length;
  
  // Calculate how many reviews fit safely
  const reviewsPerChunk = Math.floor(safeLimit / avgTokensPerReview);
  
  // Ensure at least 1 review per chunk, max 100 for reasonable processing
  return Math.max(1, Math.min(reviewsPerChunk, 100));
}

/**
 * Full token estimation for a review set
 */
export function estimateTokens(
  reviews: SourceItem[],
  provider: AIProvider
): TokenEstimate {
  const reviewTokens = estimateReviewsTokens(reviews);
  const overheadTokens = SYSTEM_PROMPT_TOKENS;
  const promptTokens = reviewTokens + overheadTokens;
  const totalTokens = promptTokens + RESPONSE_RESERVATION_TOKENS;
  
  const contextLimit = PROVIDER_CONTEXT_LIMITS[provider];
  const safeLimit = getSafeContextLimit(provider);
  
  return {
    totalTokens,
    promptTokens,
    reviewTokens,
    overheadTokens,
    exceedsLimit: promptTokens > safeLimit,
    recommendedChunkSize: calculateOptimalChunkSize(reviews, provider),
    provider,
    contextLimit,
    safeLimit,
  };
}

/**
 * Check if reviews need chunking for a provider
 */
export function needsChunking(reviews: SourceItem[], provider: AIProvider): boolean {
  const estimate = estimateTokens(reviews, provider);
  return estimate.exceedsLimit;
}
