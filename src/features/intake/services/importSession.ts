import type {
  SourceItem,
  SourceType,
} from "@/shared/types/source";

export interface ImportColumnDetection {
  content?: string;
  title?: string;
  author?: string;
  rating?: string;
}

export interface ImportPreview {
  items: SourceItem[];

  totalItems: number;

  estimatedDuplicates: number;

  detectedLanguage: string;

  detectedSource: SourceType;

  detectedColumns: ImportColumnDetection;
}

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
];

const TITLE_KEYS = [
  "title",
  "subject",
  "headline",
];

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
];

const RATING_KEYS = [
  "rating",
  "stars",
  "score",
  "rank",
  "review_rating",
  "reviewrating",
];

function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function detectColumn(
  items: SourceItem[],
  candidates: string[]
): string | undefined {
  if (items.length === 0) {
    return undefined;
  }

  const metadata = items[0].metadata;

  for (const key of Object.keys(metadata)) {
    const normalized = normalizeKey(key);

    if (
      candidates.some(
        (candidate) =>
          normalizeKey(candidate) === normalized
      )
    ) {
      return key;
    }
  }

  return undefined;
}

function estimateDuplicates(
  items: SourceItem[]
): number {
  const seen = new Set<string>();

  let duplicates = 0;

  for (const item of items) {
    const hash = item.content
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

    if (seen.has(hash)) {
      duplicates++;
      continue;
    }

    seen.add(hash);
  }

  return duplicates;
}

function detectLanguage(
  items: SourceItem[]
): string {
  const sample = items
    .slice(0, 20)
    .map((item) => item.content)
    .join(" ");

  if (!sample.trim()) {
    return "Unknown";
  }

  const ascii =
    sample.match(/[A-Za-z]/g)?.length ?? 0;

  const total = sample.length;

  if (total === 0) {
    return "Unknown";
  }

  if (ascii / total > 0.5) {
    return "English";
  }

  return "Unknown";
}

export async function buildImportPreview(
  items: SourceItem[]
): Promise<ImportPreview> {
  const detectedSource =
    items[0]?.source ?? "manual";

  return {
    items,

    totalItems: items.length,

    estimatedDuplicates:
      estimateDuplicates(items),

    detectedLanguage:
      detectLanguage(items),

    detectedSource,

    detectedColumns: {
      content: detectColumn(
        items,
        CONTENT_KEYS
      ),

      title: detectColumn(
        items,
        TITLE_KEYS
      ),

      author: detectColumn(
        items,
        AUTHOR_KEYS
      ),

      rating: detectColumn(
        items,
        RATING_KEYS
      ),
    },
  };
}