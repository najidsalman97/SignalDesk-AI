import type { SourceItem } from "@/shared/types/source";
import { formatReviewsForAI } from "../reviewFormatter";
import { AnalysisSchema } from "../schema";
import { SYSTEM_PROMPT } from "../prompts";

export async function analyzeWithOllama(
  reviews: SourceItem[],
  apiKey: string,
  model: string,
  baseUrl: string = "https://ollama.com/api"
) {
  const formattedReviews = formatReviewsForAI(reviews);
  
  // Determine if using cloud API or local
  const isCloudApi = baseUrl.includes("ollama.com") || (apiKey && apiKey.length > 0);
  const apiUrl = isCloudApi ? "https://ollama.com/api/chat" : `${baseUrl}/api/chat`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  // Add auth header for cloud API
  if (isCloudApi && apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
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
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.error?.message || errorJson.error || `HTTP ${response.status}`);
    } catch {
      throw new Error(errorText || `HTTP ${response.status}`);
    }
  }

  const json = await response.json();
  const content = json.message?.content;

  if (!content) {
    throw new Error("Ollama returned no content.");
  }

  return AnalysisSchema.parse(JSON.parse(content));
}
