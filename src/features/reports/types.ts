export type ReportFormat = "pdf" | "docx" | "xlsx" | "csv"

export interface ReportConfig {
  id: string
  name: string
  format: ReportFormat
  includeCharts: boolean
  dateRange: [string, string]
  sections: string[]
}

export interface GeneratedReport {
  id: string
  configId: string
  url: string
  createdAt: string
  size: number
}