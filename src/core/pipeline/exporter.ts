import type { AnalysisResult } from "@/features/analysis/types"
import type { ExportFormat } from "@/shared/types/report"

export interface ExportConfig {
  format: ExportFormat
  includeCharts: boolean
  includeRawData: boolean
  dateRange?: [string, string]
}

export interface ExportResult {
  url: string
  filename: string
  size: number
  format: ExportFormat
}

export interface Exporter {
  name: string
  supportedFormats: ExportFormat[]
  export(
    data: AnalysisResult,
    config: ExportConfig,
  ): Promise<ExportResult>
}