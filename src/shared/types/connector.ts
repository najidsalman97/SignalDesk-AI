export type ConnectorType =
  | "google_play"
  | "app_store"
  | "github"
  | "reddit"
  | "trustpilot"
  | "g2"
  | "website"
  | "youtube"
  | "twitter"

export interface ConnectorConfig {
  id: string
  type: ConnectorType
  name: string
  credentials?: Record<string, string>
  schedule?: "manual" | "hourly" | "daily" | "weekly"
  lastRun?: string
  active: boolean
}