/**
 * Prompts for the chunked analysis pipeline
 */

// System prompt for chunk analysis (partial result)
export const CHUNK_ANALYSIS_PROMPT = `You are an expert Product Crisis Manager analyzing customer feedback.

For this CHUNK of reviews, extract:
1. A brief summary of the main issues found
2. Sentiment breakdown (count of positive/neutral/negative)
3. Specific issues with severity ratings
4. Key themes mentioned
5. Overall severity for this chunk

Return ONLY valid JSON matching the schema provided.
Be concise but thorough. Focus on actionable insights.`;

// User prompt template for chunk analysis
export function getChunkUserPrompt(reviewsText: string, chunkIndex: number, totalChunks: number): string {
  return `Analyze chunk ${chunkIndex + 1} of ${totalChunks}.

Return JSON with this exact structure:
{
  "chunkSummary": "Brief summary of main issues in this chunk",
  "sentimentBreakdown": {
    "positive": <number of positive reviews>,
    "neutral": <number of neutral reviews>,
    "negative": <number of negative reviews>
  },
  "issues": [
    {
      "title": "Issue title",
      "description": "Brief description",
      "severity": "Low|Medium|High|Critical",
      "mentionCount": <number>,
      "sampleQuotes": ["quote1", "quote2"],
      "rootCause": "Suspected root cause"
    }
  ],
  "themes": ["theme1", "theme2"],
  "chunkSeverity": "Low|Medium|High|Critical",
  "reviewCount": <number of reviews analyzed>
}

REVIEWS TO ANALYZE:
${reviewsText}`;
}

// System prompt for final merge/report generation
export const MERGE_REPORT_PROMPT = `You are an expert Product Crisis Manager generating an executive crisis report.

You have received aggregated analysis from multiple review chunks.
Your job is to synthesize this into a comprehensive executive report.

Generate:
1. Executive summary (2-3 paragraphs)
2. Overall severity assessment with score
3. Top 5-7 prioritized issues with details
4. Jira tickets for engineering team
5. Customer communication templates

Be professional, actionable, and empathetic.
Return ONLY valid JSON matching the schema provided.`;

// User prompt template for merge/final report
export function getMergeUserPrompt(mergedData: {
  totalReviews: number;
  sentiment: { percentages: { positive: number; neutral: number; negative: number } };
  allIssues: Array<{ title: string; description: string; severity: string; totalMentions: number; sampleQuotes: string[]; rootCause?: string }>;
  allThemes: string[];
  chunkSummaries: string[];
  overallSeverity: string;
}): string {
  const issuesText = mergedData.allIssues
    .map((issue, i) => `${i + 1}. [${issue.severity}] ${issue.title}: ${issue.description} (${issue.totalMentions} mentions)${issue.rootCause ? ` - Root cause: ${issue.rootCause}` : ""}`)
    .join("\n");

  const summariesText = mergedData.chunkSummaries
    .map((s, i) => `Chunk ${i + 1}: ${s}`)
    .join("\n");

  return `Generate the final executive crisis report.

AGGREGATED DATA:
- Total Reviews Analyzed: ${mergedData.totalReviews}
- Sentiment: ${mergedData.sentiment.percentages.positive}% positive, ${mergedData.sentiment.percentages.neutral}% neutral, ${mergedData.sentiment.percentages.negative}% negative
- Overall Severity: ${mergedData.overallSeverity}
- Key Themes: ${mergedData.allThemes.join(", ")}

CHUNK SUMMARIES:
${summariesText}

TOP ISSUES IDENTIFIED:
${issuesText}

Return JSON with this exact structure:
{
  "executiveSummary": "2-3 paragraph executive summary",
  "severity": "Low|Medium|High|Critical",
  "severityScore": <0-100>,
  "topIssues": [
    {
      "title": "Issue title",
      "description": "Detailed description",
      "affectedCount": <number>,
      "severity": "Low|Medium|High|Critical",
      "rootCause": "Root cause analysis",
      "recommendedFix": "Recommended solution"
    }
  ],
  "jiraTickets": [
    {
      "title": "Ticket title",
      "priority": "Low|Medium|High|Critical",
      "description": "Ticket description",
      "acceptanceCriteria": ["criterion1", "criterion2"]
    }
  ],
  "customerEmail": "Professional customer communication email",
  "statusPageUpdate": "Status page update text",
  "socialMediaUpdate": "Social media response"
}`;
}
