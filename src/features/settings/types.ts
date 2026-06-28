export interface AppSettings {
  theme: "light" | "dark" | "system"
  language: string
  notifications: NotificationSettings
  exportDefaults: ExportDefaults
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  digests: "daily" | "weekly" | "never"
}

export interface ExportDefaults {
  format: "pdf" | "docx" | "xlsx"
  includeCharts: boolean
}