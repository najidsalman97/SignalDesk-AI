/**
 * Provider Adapter - Unified interface for all AI providers
 * Handles chunk analysis and merge requests
 */

import type { SourceItem } from "@/shared/types/source";
import type { ProviderSettings } from "@/shared/types/provider";
import type { AnalysisResult } from "@/shared/types/analysis";
import { PartialResultSchema, type PartialResult } from "./partialResult";
import { AnalysisSchema } from "../schema";
import { CHUNK_ANALYSIS_PROMPT, MERGE_REPORT_PROMPT, getChunkUserPrompt, getMergeUserPrompt } from "./prompts";
import type { MergedPartialResults } from "./partialResult";

// Simplified review formatter for chunks (optimized for token efficiency)
function formatReviewsCompact(reviews: SourceItem[]): string {
  return reviews
    .map((r, i) => {
      const rating = r.rating ? `[${r.rating}★]` : "";
      const title = r.title ? `"${r.title}"` : "";
      return `#${i + 1} ${rating} ${title}\n${r.content}`;
    })
    .join("\n---\n");
}

/**
 * Analyze a chunk with Gemini
 */
async function analyzeChunkWithGemini(
  reviews: SourceItem[],
  apiKey: string,
  model: string,
  chunkIndex: number,
  totalChunks: number,
  signal?: AbortSignal
): Promise<PartialResult> {
  const reviewsText = formatReviewsCompact(reviews);
  const userPrompt = getChunkUserPrompt(reviewsText, chunkIndex, totalChunks);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: CHUNK_ANALYSIS_PROMPT }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const json = await response.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) {
    throw new Error("Gemini returned no content");
  }

  return PartialResultSchema.parse(JSON.parse(text));
}

/**
 * Analyze a chunk with OpenAI-compatible API (OpenAI, Groq, OpenRouter)
 */
async function analyzeChunkWithOpenAI(
  reviews: SourceItem[],
  apiKey: string,
  model: string,
  baseUrl: string,
  chunkIndex: number,
  totalChunks: number,
  signal?: AbortSignal,
  extraHeaders?: Record<string, string>
): Promise<PartialResult> {
  const reviewsText = formatReviewsCompact(reviews);
  const userPrompt = getChunkUserPrompt(reviewsText, chunkIndex, totalChunks);

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    signal,
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: CHUNK_ANALYSIS_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const json = await response.json();
  const text = json.choices?.[0]?.message?.content;
  
  if (!text) {
    throw new Error("Provider returned no content");
  }

  return PartialResultSchema.parse(JSON.parse(text));
}

/**
 * Analyze a chunk with Ollama (local)
 */
async function analyzeChunkWithOllama(
  reviews: SourceItem[],
  model: string,
  baseUrl: string,
  chunkIndex: number,
  totalChunks: number,
  signal?: AbortSignal
): Promise<PartialResult> {
  const reviewsText = formatReviewsCompact(reviews);
  const userPrompt = getChunkUserPrompt(reviewsText, chunkIndex, totalChunks);

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      model,
      prompt: `${CHUNK_ANALYSIS_PROMPT}\n\n${userPrompt}`,
      format: "json",
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const json = await response.json();
  
  if (!json.response) {
    throw new Error("Ollama returned no content");
  }

  return PartialResultSchema.parse(JSON.parse(json.response));
}

/**
 * Generate final report with Gemini
 */
async function generateReportWithGemini(
  mergedData: MergedPartialResults,
  apiKey: string,
  model: string,
  signal?: AbortSignal
): Promise<AnalysisResult> {
  const userPrompt = getMergeUserPrompt(mergedData);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: MERGE_REPORT_PROMPT }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const json = await response.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) {
    throw new Error("Gemini returned no content");
  }

  return AnalysisSchema.parse(JSON.parse(text));
}

/**
 * Generate final report with OpenAI-compatible API
 */
async function generateReportWithOpenAI(
  mergedData: MergedPartialResults,
  apiKey: string,
  model: string,
  baseUrl: string,
  signal?: AbortSignal,
  extraHeaders?: Record<string, string>
): Promise<AnalysisResult> {
  const userPrompt = getMergeUserPrompt(mergedData);

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    signal,
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: MERGE_REPORT_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const json = await response.json();
  const text = json.choices?.[0]?.message?.content;
  
  if (!text) {
    throw new Error("Provider returned no content");
  }

  return AnalysisSchema.parse(JSON.parse(text));
}

/**
 * Generate final report with Ollama
 */
async function generateReportWithOllama(
  mergedData: MergedPartialResults,
  model: string,
  baseUrl: string,
  signal?: AbortSignal
): Promise<AnalysisResult> {
  const userPrompt = getMergeUserPrompt(mergedData);

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      model,
      prompt: `${MERGE_REPORT_PROMPT}\n\n${userPrompt}`,
      format: "json",
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const json = await response.json();
  
  if (!json.response) {
    throw new Error("Ollama returned no content");
  }

  return AnalysisSchema.parse(JSON.parse(json.response));
}

/**
 * Unified chunk analysis function
 */
export async function analyzeChunk(
  reviews: SourceItem[],
  provider: ProviderSettings,
  chunkIndex: number,
  totalChunks: number,
  signal?: AbortSignal
): Promise<PartialResult> {
  switch (provider.provider) {
    case "gemini":
      return analyzeChunkWithGemini(
        reviews,
        provider.apiKey,
        provider.model || "gemini-2.0-flash",
        chunkIndex,
        totalChunks,
        signal
      );
      
    case "openai":
      return analyzeChunkWithOpenAI(
        reviews,
        provider.apiKey,
        provider.model || "gpt-4o-mini",
        "https://api.openai.com/v1",
        chunkIndex,
        totalChunks,
        signal
      );
      
    case "groq":
      return analyzeChunkWithOpenAI(
        reviews,
        provider.apiKey,
        provider.model || "llama-3.1-8b-instant",
        "https://api.groq.com/openai/v1",
        chunkIndex,
        totalChunks,
        signal
      );
      
    case "openrouter":
      return analyzeChunkWithOpenAI(
        reviews,
        provider.apiKey,
        provider.model || "deepseek/deepseek-chat-v3-0324:free",
        "https://openrouter.ai/api/v1",
        chunkIndex,
        totalChunks,
        signal,
        {
          "HTTP-Referer": window.location.origin,
          "X-Title": "SignalDesk AI",
        }
      );
      
    case "ollama":
      return analyzeChunkWithOllama(
        reviews,
        provider.model || "llama3.2",
        provider.baseUrl || "http://localhost:11434",
        chunkIndex,
        totalChunks,
        signal
      );
      
    default:
      throw new Error(`Unknown provider: ${provider.provider}`);
  }
}

/**
 * Unified report generation function
 */
export async function generateReport(
  mergedData: MergedPartialResults,
  provider: ProviderSettings,
  signal?: AbortSignal
): Promise<AnalysisResult> {
  switch (provider.provider) {
    case "gemini":
      return generateReportWithGemini(
        mergedData,
        provider.apiKey,
        provider.model || "gemini-2.0-flash",
        signal
      );
      
    case "openai":
      return generateReportWithOpenAI(
        mergedData,
        provider.apiKey,
        provider.model || "gpt-4o-mini",
        "https://api.openai.com/v1",
        signal
      );
      
    case "groq":
      return generateReportWithOpenAI(
        mergedData,
        provider.apiKey,
        provider.model || "llama-3.1-8b-instant",
        "https://api.groq.com/openai/v1",
        signal
      );
      
    case "openrouter":
      return generateReportWithOpenAI(
        mergedData,
        provider.apiKey,
        provider.model || "deepseek/deepseek-chat-v3-0324:free",
        "https://openrouter.ai/api/v1",
        signal,
        {
          "HTTP-Referer": window.location.origin,
          "X-Title": "SignalDesk AI",
        }
      );
      
    case "ollama":
      return generateReportWithOllama(
        mergedData,
        provider.model || "llama3.2",
        provider.baseUrl || "http://localhost:11434",
        signal
      );
      
    default:
      throw new Error(`Unknown provider: ${provider.provider}`);
  }
}
