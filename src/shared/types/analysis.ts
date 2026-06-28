export interface Issue {

  title: string;

  description: string;

  severity: "Low" | "Medium" | "High" | "Critical";

  affectedCount: number;

  rootCause: string;

  recommendedFix: string;

}

export interface JiraTicket {

  title: string;

  priority: "Low" | "Medium" | "High" | "Critical";

  description: string;

  acceptanceCriteria: string[];

}

export interface AnalysisResult {

  executiveSummary: string;

  severity: "Low" | "Medium" | "High" | "Critical";

  severityScore: number;

  topIssues: Issue[];

  jiraTickets: JiraTicket[];

  customerEmail: string;

  statusPageUpdate: string;

  socialMediaUpdate: string;

}