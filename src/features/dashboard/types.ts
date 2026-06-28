export interface DashboardStats {
  totalReviews: number
  averageRating: number
  reviewsToday: number
  activeSources: number
}

export interface RecentActivity {
  id: string
  source: string
  action: string
  timestamp: string
  status: "success" | "pending" | "failed"
}