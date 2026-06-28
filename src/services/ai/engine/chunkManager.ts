/**
 * Chunk Manager - Intelligent chunking based on provider context limits
 */

import type { SourceItem } from "@/shared/types/source";
import type { AIProvider } from "@/shared/types/provider";
import { 
  estimateReviewTokens, 
  getSafeContextLimit,
  calculateOptimalChunkSize 
} from "./tokenEstimator";

export interface ReviewChunk {
  id: string;
  index: number;
  reviews: SourceItem[];
  estimatedTokens: number;
}

export interface ChunkingResult {
  chunks: ReviewChunk[];
  totalReviews: number;
  totalChunks: number;
  estimatedTotalTokens: number;
  provider: AIProvider;
  chunkSize: number;
}

/**
 * Deduplicate reviews by content to reduce token usage
 */
function deduplicateReviews(reviews: SourceItem[]): SourceItem[] {
  const seen = new Set<string>();
  return reviews.filter(review => {
    // Create a normalized key from content
    const key = review.content?.trim().toLowerCase().slice(0, 200) || "";
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Optimize reviews by removing excessive whitespace and metadata
 */
function optimizeReview(review: SourceItem): SourceItem {
  return {
    ...review,
    // Normalize whitespace
    content: review.content?.replace(/\s+/g, " ").trim() || "",
    title: review.title?.replace(/\s+/g, " ").trim(),
    // Keep only essential metadata
    metadata: {
      ...((review.metadata?.version !== undefined) && { version: review.metadata.version }),
      ...((review.metadata?.platform !== undefined) && { platform: review.metadata.platform }),
    },
  };
}

/**
 * Create intelligent chunks based on provider context limits
 */
export function createChunks(
  reviews: SourceItem[],
  provider: AIProvider
): ChunkingResult {
  // Step 1: Deduplicate
  const uniqueReviews = deduplicateReviews(reviews);
  
  // Step 2: Optimize each review
  const optimizedReviews = uniqueReviews.map(optimizeReview);
  
  // Step 3: Calculate optimal chunk size
  const safeLimit = getSafeContextLimit(provider);
  const optimalChunkSize = calculateOptimalChunkSize(optimizedReviews, provider);
  
  // Step 4: Create chunks
  const chunks: ReviewChunk[] = [];
  let currentChunk: SourceItem[] = [];
  let currentTokens = 0;
  
  for (const review of optimizedReviews) {
    const reviewTokens = estimateReviewTokens(review);
    
    // Check if adding this review would exceed safe limit
    if (currentChunk.length > 0 && 
        (currentTokens + reviewTokens > safeLimit || currentChunk.length >= optimalChunkSize)) {
      // Save current chunk
      chunks.push({
        id: crypto.randomUUID(),
        index: chunks.length,
        reviews: currentChunk,
        estimatedTokens: currentTokens,
      });
      
      // Start new chunk
      currentChunk = [];
      currentTokens = 0;
    }
    
    currentChunk.push(review);
    currentTokens += reviewTokens;
  }
  
  // Don't forget the last chunk
  if (currentChunk.length > 0) {
    chunks.push({
      id: crypto.randomUUID(),
      index: chunks.length,
      reviews: currentChunk,
      estimatedTokens: currentTokens,
    });
  }
  
  const estimatedTotalTokens = chunks.reduce((sum, chunk) => sum + chunk.estimatedTokens, 0);
  
  return {
    chunks,
    totalReviews: optimizedReviews.length,
    totalChunks: chunks.length,
    estimatedTotalTokens,
    provider,
    chunkSize: optimalChunkSize,
  };
}

/**
 * Sample reviews for Fast Mode analysis
 * Takes a representative sample: first N, last N, and random from middle
 */
export function sampleReviews(
  reviews: SourceItem[],
  maxSamples: number = 100
): SourceItem[] {
  if (reviews.length <= maxSamples) {
    return reviews;
  }
  
  const sampled: SourceItem[] = [];
  const indices = new Set<number>();
  
  // Always include first 20% (recent/important)
  const firstCount = Math.floor(maxSamples * 0.2);
  for (let i = 0; i < firstCount && i < reviews.length; i++) {
    sampled.push(reviews[i]);
    indices.add(i);
  }
  
  // Always include last 20% (oldest context)
  const lastCount = Math.floor(maxSamples * 0.2);
  for (let i = reviews.length - lastCount; i < reviews.length; i++) {
    if (!indices.has(i)) {
      sampled.push(reviews[i]);
      indices.add(i);
    }
  }
  
  // Fill remaining with random samples from middle
  const remaining = maxSamples - sampled.length;
  const middleStart = firstCount;
  const middleEnd = reviews.length - lastCount;
  
  if (middleEnd > middleStart) {
    const middleIndices: number[] = [];
    for (let i = middleStart; i < middleEnd; i++) {
      if (!indices.has(i)) {
        middleIndices.push(i);
      }
    }
    
    // Shuffle and take remaining
    for (let i = middleIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [middleIndices[i], middleIndices[j]] = [middleIndices[j], middleIndices[i]];
    }
    
    for (let i = 0; i < remaining && i < middleIndices.length; i++) {
      sampled.push(reviews[middleIndices[i]]);
    }
  }
  
  return sampled;
}
