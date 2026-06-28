export type IssueSeverity = "critical" | "major" | "minor" | "suggestion"
export type IssueStatus = "open" | "in_progress" | "resolved" | "dismissed"

export interface Issue {
  id: string
  title: string
  description: string
  severity: IssueSeverity
  status: IssueStatus
  source: string
  reviewId?: string
  createdAt: string
  resolvedAt?: string
}

export interface IssueSummary {
  total: number
  critical: number
  major: number
  minor: number
  suggestion: number
  resolved: number
}