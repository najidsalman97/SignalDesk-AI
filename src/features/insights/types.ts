export type InsightCategory = "trend" | "anomaly" | "pattern" | "recommendation"

export interface Insight {
  id: string
  category: InsightCategory
  title: string
  description: string
  confidence: number
  metric?: number
  change?: number
  source: string
  createdAt: string
}

export interface InsightsDashboard {
  topIssues: Insight[]
  sentimentTrend: Insight[]
  volumeAnomalies: Insight[]
  recommendations: Insight[]
}