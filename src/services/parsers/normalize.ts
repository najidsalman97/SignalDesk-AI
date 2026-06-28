import type { SourceItem } from "@/shared/types/source";

const CONTENT_KEYS = [
  "review",
  "reviews",
  "comment",
  "comments",
  "feedback",
  "message",
  "messages",
  "description",
  "body",
  "content",
  "text",
  "issue",
  "summary",
  "ticket",
  "tickets",
  "note",
  "notes",
  "review_text",
  "reviewtext",
  "customer_feedback",
  "customerfeedback",
] as const;

const TITLE_KEYS = [
  "title",
  "subject",
  "headline",
] as const;

const AUTHOR_KEYS = [
  "author",
  "user",
  "username",
  "customer",
  "customer_name",
  "customername",
  "name",
  "email",
  "creator",
  "reporter",
  "owner",
] as const;

const RATING_KEYS = [
  "rating",
  "stars",
  "score",
  "rank",
  "review_rating",
  "reviewrating",
] as const;

function normalizeKey(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function findValue(
  row: Record<string, unknown>,
  candidates: readonly string[]
): unknown {
  const normalizedMap = new Map<string, unknown>();

  for (const [key, value] of Object.entries(row)) {
    normalizedMap.set(normalizeKey(key), value);
  }

  for (const candidate of candidates) {
    const value = normalizedMap.get(normalizeKey(candidate));

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return undefined;
}

function normalizeWhitespace(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : undefined;
}

function buildFallbackContent(
  row: Record<string, unknown>
): string {
  return normalizeWhitespace(
    Object.values(row)
      .filter(
        (value) =>
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
      )
      .map(String)
      .join(" ")
  );
}

export function normalizeRows(
  rows: Record<string, unknown>[],
  source: SourceItem["source"]
): SourceItem[] {
  const items: SourceItem[] = [];

  const seen = new Set<string>();

  for (const row of rows) {
    const rawContent =
      findValue(row, CONTENT_KEYS) ??
      buildFallbackContent(row);

    const content = normalizeWhitespace(
      String(rawContent ?? "")
    )
      .replace(/\u0000/g, "")
      .trim();

    if (content.length === 0) {
      continue;
    }

    const fingerprint = content
      .toLowerCase()
      .replace(/\s+/g, " ");

    if (seen.has(fingerprint)) {
      continue;
    }

    seen.add(fingerprint);

    const title = findValue(
      row,
      TITLE_KEYS
    );

    const author = findValue(
      row,
      AUTHOR_KEYS
    );

    const rating = findValue(
      row,
      RATING_KEYS
    );

    items.push({
      id: crypto.randomUUID(),

      source,

      title:
        title !== undefined &&
        String(title).trim() !== ""
          ? String(title).trim()
          : undefined,

      content,

      author:
        author !== undefined &&
        String(author).trim() !== ""
          ? String(author).trim()
          : undefined,

      rating:
        toNumber(rating),

      createdAt:
        new Date().toISOString(),

      metadata: row,
    });
  }

  return items;
}