export type AnalysisStatus = "idle" | "running" | "completed" | "failed"

export interface AnalysisResult {
  id: string
  sourceId: string
  status: AnalysisStatus
  sentiment?: SentimentAnalysis
  topics?: TopicSummary[]
  summary?: string
  createdAt: string
}

export interface SentimentAnalysis {
  positive: number
  negative: number
  neutral: number
  score: number
}

export interface TopicSummary {
  topic: string
  frequency: number
  sentiment: number
}