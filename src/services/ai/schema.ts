import { z } from "zod";

export const AnalysisSchema = z.object({

  executiveSummary: z.string(),

  severity: z.enum([
    "Low",
    "Medium",
    "High",
    "Critical",
  ]),

  severityScore: z.number(),

  topIssues: z.array(

    z.object({

      title: z.string(),

      description: z.string(),

      affectedCount: z.number(),

      severity: z.enum([
        "Low",
        "Medium",
        "High",
        "Critical",
      ]),

      rootCause: z.string(),

      recommendedFix: z.string(),

    })

  ),

  jiraTickets: z.array(

    z.object({

      title: z.string(),

      priority: z.enum([
        "Low",
        "Medium",
        "High",
        "Critical",
      ]),

      description: z.string(),

      acceptanceCriteria: z.array(
        z.string()
      ),

    })

  ),

  customerEmail:
    z.string(),

  statusPageUpdate:
    z.string(),

  socialMediaUpdate:
    z.string(),

});