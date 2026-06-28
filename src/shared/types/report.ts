export type ExportFormat = "pdf" | "docx" | "xlsx" | "csv"

export interface ReportTemplate {
  id: string
  name: string
  description: string
  format: ExportFormat
  sections: ReportSection[]
}

export interface ReportSection {
  id: string
  title: string
  type: "summary" | "chart" | "table" | "text"
  config: Record<string, unknown>
}