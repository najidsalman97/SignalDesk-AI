import type { Review } from "@/shared/types/review"

export interface NormalizedReview extends Review {
  normalizedRating: number
  normalizedDate: string
  cleanedContent: string
}

export interface NormalizerConfig {
  trimWhitespace: boolean
  removeHtml: boolean
  normalizeRatings: boolean
  normalizeDates: boolean
  maxContentLength?: number
}

export interface Normalizer {
  name: string
  normalize(reviews: Review[], config?: NormalizerConfig): Promise<NormalizedReview[]>
}