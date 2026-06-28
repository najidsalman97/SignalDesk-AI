/**
 * Partial Result Schema and Types
 * 
 * Each chunk produces a partial analysis that gets merged later
 */

import { z } from "zod";

// Partial result from analyzing a single chunk
export const PartialResultSchema = z.object({
  // Summary of issues found in this chunk
  chunkSummary: z.string(),
  
  // Sentiment overview
  sentimentBreakdown: z.object({
    positive: z.number(),
    neutral: z.number(),
    negative: z.number(),
  }),
  
  // Issues discovered in this chunk
  issues: z.array(z.object({
    title: z.string(),
    description: z.string(),
    severity: z.enum(["Low", "Medium", "High", "Critical"]),
    mentionCount: z.number(),
    sampleQuotes: z.array(z.string()),
    rootCause: z.string().optional(),
  })),
  
  // Key themes/topics
  themes: z.array(z.string()),
  
  // Overall severity assessment for this chunk
  chunkSeverity: z.enum(["Low", "Medium", "High", "Critical"]),
  
  // Review count processed
  reviewCount: z.number(),
});

export type PartialResult = z.infer<typeof PartialResultSchema>;

// Merged intermediate result before final report generation
export interface MergedPartialResults {
  totalReviews: number;
  totalChunks: number;
  
  // Aggregated sentiment
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    percentages: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };
  
  // All issues collected and deduplicated
  allIssues: Array<{
    title: string;
    description: string;
    severity: "Low" | "Medium" | "High" | "Critical";
    totalMentions: number;
    sampleQuotes: string[];
    rootCause?: string;
  }>;
  
  // All themes collected
  allThemes: string[];
  
  // Chunk summaries for context
  chunkSummaries: string[];
  
  // Highest severity found
  overallSeverity: "Low" | "Medium" | "High" | "Critical";
}

/**
 * Merge multiple partial results into one intermediate structure
 */
export function mergePartialResults(partials: PartialResult[]): MergedPartialResults {
  const totalReviews = partials.reduce((sum, p) => sum + p.reviewCount, 0);
  
  // Aggregate sentiment
  const sentiment = {
    positive: partials.reduce((sum, p) => sum + p.sentimentBreakdown.positive, 0),
    neutral: partials.reduce((sum, p) => sum + p.sentimentBreakdown.neutral, 0),
    negative: partials.reduce((sum, p) => sum + p.sentimentBreakdown.negative, 0),
  };
  const totalSentiment = sentiment.positive + sentiment.neutral + sentiment.negative || 1;
  
  // Deduplicate and merge issues
  const issueMap = new Map<string, {
    title: string;
    description: string;
    severity: "Low" | "Medium" | "High" | "Critical";
    totalMentions: number;
    sampleQuotes: string[];
    rootCause?: string;
  }>();
  
  for (const partial of partials) {
    for (const issue of partial.issues) {
      const key = issue.title.toLowerCase().trim();
      const existing = issueMap.get(key);
      
      if (existing) {
        // Merge with existing issue
        existing.totalMentions += issue.mentionCount;
        existing.sampleQuotes.push(...issue.sampleQuotes.slice(0, 2));
        // Keep highest severity
        const severityOrder = { Low: 1, Medium: 2, High: 3, Critical: 4 };
        if (severityOrder[issue.severity] > severityOrder[existing.severity]) {
          existing.severity = issue.severity;
        }
        if (issue.rootCause && !existing.rootCause) {
          existing.rootCause = issue.rootCause;
        }
      } else {
        issueMap.set(key, {
          title: issue.title,
          description: issue.description,
          severity: issue.severity,
          totalMentions: issue.mentionCount,
          sampleQuotes: issue.sampleQuotes.slice(0, 3),
          rootCause: issue.rootCause,
        });
      }
    }
  }
  
  // Sort issues by severity and mention count
  const allIssues = Array.from(issueMap.values())
    .sort((a, b) => {
      const severityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.totalMentions - a.totalMentions;
    })
    .slice(0, 10); // Top 10 issues
  
  // Deduplicate themes
  const themeSet = new Set<string>();
  for (const partial of partials) {
    for (const theme of partial.themes) {
      themeSet.add(theme.toLowerCase().trim());
    }
  }
  
  // Determine overall severity
  const severityOrder = { Low: 1, Medium: 2, High: 3, Critical: 4 };
  const overallSeverity = partials.reduce((max, p) => {
    return severityOrder[p.chunkSeverity] > severityOrder[max] ? p.chunkSeverity : max;
  }, "Low" as "Low" | "Medium" | "High" | "Critical");
  
  return {
    totalReviews,
    totalChunks: partials.length,
    sentiment: {
      ...sentiment,
      percentages: {
        positive: Math.round((sentiment.positive / totalSentiment) * 100),
        neutral: Math.round((sentiment.neutral / totalSentiment) * 100),
        negative: Math.round((sentiment.negative / totalSentiment) * 100),
      },
    },
    allIssues,
    allThemes: Array.from(themeSet).slice(0, 15),
    chunkSummaries: partials.map(p => p.chunkSummary),
    overallSeverity,
  };
}
