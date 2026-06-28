import type { NormalizedReview } from "./normalizer"
import type { AnalysisResult } from "@/features/analysis/types"

export interface AnalyzerConfig {
  sentimentEnabled: boolean
  topicExtraction: boolean
  keywordAnalysis: boolean
  language: string
}

export interface Analyzer {
  name: string
  analyze(
    reviews: NormalizedReview[],
    config: AnalyzerConfig,
  ): Promise<AnalysisResult>
}