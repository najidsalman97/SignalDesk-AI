export type SourceType =
  | "csv"
  | "excel"
  | "json"
  | "txt"
  | "docx"
  | "reddit"
  | "github"
  | "appstore"
  | "googleplay"
  | "trustpilot"
  | "g2"
  | "website"
  | "manual"
  | "demo";

export interface SourceItem {
  id: string;

  source: SourceType;

  title?: string;

  content: string;

  author?: string;

  rating?: number;

  language?: string;

  version?: string;

  createdAt: string;

  metadata: Record<string, unknown>;
}