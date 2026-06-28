import type { SourceItem } from "@/shared/types/source";
import { formatReviewsForAI } from "../reviewFormatter";
import { AnalysisSchema } from "../schema";
import { SYSTEM_PROMPT } from "../prompts";

export async function analyzeWithGemini(
  reviews: SourceItem[],
  apiKey: string,
  model: string
) {
  const formattedReviews =
    formatReviewsForAI(reviews);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: SYSTEM_PROMPT,
            },
          ],
        },

        contents: [
          {
            parts: [
              {
                text: `
Return ONLY valid JSON.

Analyze the following customer feedback.

${formattedReviews}
`,
              },
            ],
          },
        ],

        generationConfig: {
          responseMimeType:
            "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      await response.text()
    );
  }

  const json = await response.json();

  const text =
    json.candidates?.[0]?.content?.parts?.[0]
      ?.text;

  if (!text) {
    throw new Error(
      "Gemini returned no content."
    );
  }

  return AnalysisSchema.parse(
    JSON.parse(text)
  );
}