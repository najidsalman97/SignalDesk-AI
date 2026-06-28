import type { SourceItem } from "@/shared/types/source";
import { formatReviewsForAI } from "../reviewFormatter";
import { AnalysisSchema } from "../schema";
import { SYSTEM_PROMPT } from "../prompts";

export async function analyzeWithGroq(
  reviews: SourceItem[],
  apiKey: string,
  model: string
) {
  const formattedReviews = formatReviewsForAI(reviews);

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
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
        response_format: {
          type: "json_object",
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const json = await response.json();

  return AnalysisSchema.parse(
    JSON.parse(json.choices[0].message.content)
  );
}
