import type { NormalizedReview } from "./normalizer"

export interface DeduplicationResult {
  unique: NormalizedReview[]
  duplicates: NormalizedReview[]
  stats: {
    total: number
    unique: number
    removed: number
  }
}

export interface DeduplicationStrategy {
  field: string
  threshold: number
}

export interface Deduplicator {
  name: string
  deduplicate(
    reviews: NormalizedReview[],
    strategies?: DeduplicationStrategy[],
  ): Promise<DeduplicationResult>
}