import type { SourceItem } from "@/shared/types/source";
import { formatReviewsForAI } from "../reviewFormatter";
import { AnalysisSchema } from "../schema";
import { SYSTEM_PROMPT } from "../prompts";

export async function analyzeWithOllama(
  reviews: SourceItem[],
  model: string,
  baseUrl: string = "http://localhost:11434"
) {
  const formattedReviews = formatReviewsForAI(reviews);

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      stream: false,
      format: "json",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `
Return ONLY valid JSON.

Analyze the following customer feedback.

${formattedReviews}
`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const json = await response.json();
  const content = json.message?.content;

  if (!content) {
    throw new Error("Ollama returned no content.");
  }

  return AnalysisSchema.parse(JSON.parse(content));
}
