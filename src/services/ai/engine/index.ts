/**
 * Analysis Engine - Production-grade AI analysis pipeline
 * 
 * Features:
 * - Intelligent chunking based on provider context limits
 * - Parallel chunk processing with configurable concurrency
 * - Automatic retry with exponential backoff
 * - Provider failover on errors
 * - Live progress reporting
 * - Cancellation support
 * - Fast Mode (sample) vs Deep Mode (full analysis)
 */

import type { SourceItem } from "@/shared/types/source";
import type { ProviderSettings } from "@/shared/types/provider";
import type { AnalysisResult } from "@/shared/types/analysis";

import { createChunks, sampleReviews, type ReviewChunk } from "./chunkManager";
import { estimateTokens } from "./tokenEstimator";
import { withRetry, parseProviderError } from "./retryHandler";
import { ProgressReporter, type ProgressCallback } from "./progressReporter";
export type { AnalysisProgress } from "./progressReporter";
import { mergePartialResults, type PartialResult } from "./partialResult";
import { analyzeChunk, generateReport } from "./providerAdapter";

export type AnalysisMode = "fast" | "deep";

export interface AnalysisConfig {
  mode: AnalysisMode;
  maxConcurrency: number;
  maxRetries: number;
  fastModeSampleSize: number;
}

export const DEFAULT_CONFIG: AnalysisConfig = {
  mode: "deep",
  maxConcurrency: 2,
  maxRetries: 3,
  fastModeSampleSize: 100,
};

export interface AnalysisEngineResult {
  success: boolean;
  result?: AnalysisResult;
  error?: string;
  stats: {
    totalReviews: number;
    processedReviews: number;
    totalChunks: number;
    providersUsed: string[];
    elapsedMs: number;
    mode: AnalysisMode;
  };
}

/**
 * Process chunks in parallel with concurrency limit
 */
async function processChunksParallel(
  chunks: ReviewChunk[],
  providers: ProviderSettings[],
  config: AnalysisConfig,
  progress: ProgressReporter,
  signal?: AbortSignal
): Promise<{ results: PartialResult[]; providersUsed: Set<string> }> {
  const results: PartialResult[] = new Array(chunks.length);
  const providersUsed = new Set<string>();
  let currentProviderIndex = 0;
  
  // Process chunks with concurrency limit
  const processing: Promise<void>[] = [];
  let nextChunkIndex = 0;
  
  const processNextChunk = async (): Promise<void> => {
    while (nextChunkIndex < chunks.length) {
      if (signal?.aborted) return;
      
      const chunkIndex = nextChunkIndex++;
      const chunk = chunks[chunkIndex];
      let success = false;
      let lastError = "";
      
      // Try each provider until one succeeds
      for (let providerIdx = currentProviderIndex; providerIdx < providers.length && !success; providerIdx++) {
        if (signal?.aborted) return;
        
        const provider = providers[providerIdx];
        progress.analyzingChunk(chunkIndex, provider.provider);
        
        const retryResult = await withRetry(
          () => analyzeChunk(chunk.reviews, provider, chunkIndex, chunks.length, signal),
          { maxRetries: config.maxRetries },
          (attempt, delay, error) => progress.retrying(attempt, delay, error),
          signal
        );
        
        if (retryResult.success && retryResult.data) {
          results[chunkIndex] = retryResult.data;
          providersUsed.add(provider.provider);
          progress.chunkCompleted(chunkIndex);
          success = true;
        } else {
          lastError = retryResult.error || "Unknown error";
          const parsed = parseProviderError(lastError);
          
          // If quota/invalid key, try next provider
          if (parsed.isQuotaError || parsed.isInvalidKey) {
            if (providerIdx < providers.length - 1) {
              progress.switchingProvider(provider.provider, providers[providerIdx + 1].provider, parsed.humanMessage);
              currentProviderIndex = providerIdx + 1;
            }
          }
        }
      }
      
      if (!success) {
        throw new Error(`Chunk ${chunkIndex + 1} failed: ${lastError}`);
      }
    }
  };
  
  // Start concurrent workers
  for (let i = 0; i < Math.min(config.maxConcurrency, chunks.length); i++) {
    processing.push(processNextChunk());
  }
  
  await Promise.all(processing);
  
  return { results, providersUsed };
}

/**
 * Main analysis function
 */
export async function runAnalysis(
  reviews: SourceItem[],
  providers: ProviderSettings[],
  config: Partial<AnalysisConfig> = {},
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<AnalysisEngineResult> {
  const startTime = Date.now();
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Create progress reporter
  const progress = new ProgressReporter(onProgress || (() => {}));
  progress.preparing();
  
  // Validate inputs
  if (!reviews || reviews.length === 0) {
    return {
      success: false,
      error: "No reviews to analyze",
      stats: {
        totalReviews: 0,
        processedReviews: 0,
        totalChunks: 0,
        providersUsed: [],
        elapsedMs: Date.now() - startTime,
        mode: fullConfig.mode,
      },
    };
  }
  
  // Filter valid reviews
  const validReviews = reviews.filter(r => r.content && r.content.trim().length > 0);
  if (validReviews.length === 0) {
    return {
      success: false,
      error: "No reviews with content to analyze",
      stats: {
        totalReviews: reviews.length,
        processedReviews: 0,
        totalChunks: 0,
        providersUsed: [],
        elapsedMs: Date.now() - startTime,
        mode: fullConfig.mode,
      },
    };
  }
  
  // Get available providers
  const availableProviders = providers
    .filter(p => p.enabled && p.connectionStatus === "connected")
    .sort((a, b) => a.priority - b.priority);
  
  if (availableProviders.length === 0) {
    return {
      success: false,
      error: "No AI provider configured. Please add and test a provider in Settings.",
      stats: {
        totalReviews: validReviews.length,
        processedReviews: 0,
        totalChunks: 0,
        providersUsed: [],
        elapsedMs: Date.now() - startTime,
        mode: fullConfig.mode,
      },
    };
  }
  
  const primaryProvider = availableProviders[0];
  
  try {
    // Check for cancellation
    if (signal?.aborted) {
      progress.cancelled();
      return {
        success: false,
        error: "Cancelled",
        stats: {
          totalReviews: validReviews.length,
          processedReviews: 0,
          totalChunks: 0,
          providersUsed: [],
          elapsedMs: Date.now() - startTime,
          mode: fullConfig.mode,
        },
      };
    }
    
    // Fast Mode: Sample reviews
    let reviewsToProcess = validReviews;
    if (fullConfig.mode === "fast" && validReviews.length > fullConfig.fastModeSampleSize) {
      reviewsToProcess = sampleReviews(validReviews, fullConfig.fastModeSampleSize);
    }
    
    // Estimate tokens (for logging/debugging)
    progress.estimating(reviewsToProcess.length);
    estimateTokens(reviewsToProcess, primaryProvider.provider);
    
    // Create chunks
    const chunkResult = createChunks(reviewsToProcess, primaryProvider.provider);
    progress.chunking(chunkResult.totalChunks);
    
    // Process chunks
    let partialResults: PartialResult[];
    let providersUsed: Set<string>;
    
    if (chunkResult.totalChunks === 1) {
      // Single chunk - simple path
      progress.analyzingChunk(0, primaryProvider.provider);
      
      let result: PartialResult | null = null;
      let lastError = "";
      
      for (const provider of availableProviders) {
        if (signal?.aborted) break;
        
        const retryResult = await withRetry(
          () => analyzeChunk(chunkResult.chunks[0].reviews, provider, 0, 1, signal),
          { maxRetries: fullConfig.maxRetries },
          (attempt, delay, error) => progress.retrying(attempt, delay, error),
          signal
        );
        
        if (retryResult.success && retryResult.data) {
          result = retryResult.data;
          providersUsed = new Set([provider.provider]);
          progress.chunkCompleted(0);
          break;
        } else {
          lastError = retryResult.error || "Unknown error";
          const parsed = parseProviderError(lastError);
          
          if (availableProviders.indexOf(provider) < availableProviders.length - 1) {
            const nextProvider = availableProviders[availableProviders.indexOf(provider) + 1];
            progress.switchingProvider(provider.provider, nextProvider.provider, parsed.humanMessage);
          }
        }
      }
      
      if (!result) {
        throw new Error(lastError || "All providers failed");
      }
      
      partialResults = [result];
      providersUsed = providersUsed!;
    } else {
      // Multiple chunks - parallel processing
      const processResult = await processChunksParallel(
        chunkResult.chunks,
        availableProviders,
        fullConfig,
        progress,
        signal
      );
      
      partialResults = processResult.results;
      providersUsed = processResult.providersUsed;
    }
    
    // Check for cancellation
    if (signal?.aborted) {
      progress.cancelled();
      return {
        success: false,
        error: "Cancelled",
        stats: {
          totalReviews: validReviews.length,
          processedReviews: reviewsToProcess.length,
          totalChunks: chunkResult.totalChunks,
          providersUsed: Array.from(providersUsed),
          elapsedMs: Date.now() - startTime,
          mode: fullConfig.mode,
        },
      };
    }
    
    // Merge partial results
    progress.merging();
    const mergedResults = mergePartialResults(partialResults);
    
    // Generate final report
    progress.generating();
    
    let finalResult: AnalysisResult | null = null;
    let lastError = "";
    
    for (const provider of availableProviders) {
      if (signal?.aborted) break;
      
      const retryResult = await withRetry(
        () => generateReport(mergedResults, provider, signal),
        { maxRetries: fullConfig.maxRetries },
        (attempt, delay, error) => progress.retrying(attempt, delay, error),
        signal
      );
      
      if (retryResult.success && retryResult.data) {
        finalResult = retryResult.data;
        providersUsed.add(provider.provider);
        break;
      } else {
        lastError = retryResult.error || "Unknown error";
        const parsed = parseProviderError(lastError);
        
        if (availableProviders.indexOf(provider) < availableProviders.length - 1) {
          const nextProvider = availableProviders[availableProviders.indexOf(provider) + 1];
          progress.switchingProvider(provider.provider, nextProvider.provider, parsed.humanMessage);
        }
      }
    }
    
    if (!finalResult) {
      throw new Error(lastError || "Failed to generate final report");
    }
    
    const elapsedMs = Date.now() - startTime;
    progress.completed(reviewsToProcess.length, elapsedMs / 1000);
    
    return {
      success: true,
      result: finalResult,
      stats: {
        totalReviews: validReviews.length,
        processedReviews: reviewsToProcess.length,
        totalChunks: chunkResult.totalChunks,
        providersUsed: Array.from(providersUsed),
        elapsedMs,
        mode: fullConfig.mode,
      },
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    progress.failed(errorMessage);
    
    return {
      success: false,
      error: errorMessage,
      stats: {
        totalReviews: validReviews.length,
        processedReviews: 0,
        totalChunks: 0,
        providersUsed: [],
        elapsedMs: Date.now() - startTime,
        mode: fullConfig.mode,
      },
    };
  }
}
