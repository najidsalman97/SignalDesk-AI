export type ReviewSource =
  | "google_play"
  | "app_store"
  | "trustpilot"
  | "g2"
  | "google_reviews"
  | "manual"

export interface Review {
  id: string
  source: ReviewSource
  author: string
  rating: number
  title: string
  content: string
  date: string
  language: string
  translated?: string
}

export interface ReviewAggregation {
  total: number
  averageRating: number
  distribution: Record<number, number>
  trend: "up" | "down" | "stable"
}