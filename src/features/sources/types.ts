export type SourceType =
  | "csv"
  | "excel"
  | "google_sheets"
  | "google_play"
  | "app_store"
  | "github"
  | "reddit"
  | "trustpilot"
  | "g2"
  | "website"
  | "youtube"
  | "twitter"
  | "manual"

export interface SourceConfig {
  id: string
  type: SourceType
  name: string
  active: boolean
  lastSync?: string
  config: Record<string, unknown>
}