export type IntakeSource =
  | "csv"
  | "excel"
  | "json"
  | "txt"
  | "docx"
  | "url"
  | "google-play"
  | "app-store"
  | "reddit"
  | "github"
  | "trustpilot"
  | "g2"
  | "google-sheets"
  | "manual";

export interface IntakeRequest {
  source: IntakeSource;

  payload: File | string;

  startDate?: Date;

  endDate?: Date;
}