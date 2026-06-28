import { AnalysisSchema } from "./schema";

export async function mergeAnalysisResults(
  results: unknown[]
) {
  if (results.length === 0) {
    throw new Error(
      "No analysis results to merge."
    );
  }

  if (results.length === 1) {
    return AnalysisSchema.parse(
      results[0]
    );
  }

  const executiveSummary = results
    .map(
      (result: any) =>
        result.executiveSummary
    )
    .join("\n\n");

  const topIssues = results
    .flatMap(
      (result: any) =>
        result.topIssues
    )
    .sort(
      (a: any, b: any) =>
        b.affectedCount -
        a.affectedCount
    )
    .slice(0, 10);

  const jiraTickets = results
    .flatMap(
      (result: any) =>
        result.jiraTickets
    )
    .slice(0, 10);

  const severityScore =
    Math.max(
      ...results.map(
        (result: any) =>
          result.severityScore
      )
    );

  const matchingResult =
    results.find(
      (result: any) =>
        result.severityScore ===
        severityScore
    ) as any;

  const severity = matchingResult?.severity ?? "Low";

  const firstResult = results[0] as any;

  return AnalysisSchema.parse({
    executiveSummary,

    severity,

    severityScore,

    topIssues,

    jiraTickets,

    customerEmail:
      firstResult.customerEmail,

    statusPageUpdate:
      firstResult.statusPageUpdate,

    socialMediaUpdate:
      firstResult.socialMediaUpdate,
  });
}