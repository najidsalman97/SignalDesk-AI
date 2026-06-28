import type { SourceItem } from "@/shared/types/source";

const SEPARATORS = [
  /\n\s*\n/g,           // blank line
  /\n-{3,}\n/g,         // ---
  /\n={3,}\n/g,         // ===
  /\n\*{3,}\n/g,        // ***
];

function splitReviews(text: string): string[] {
  let reviews = [text];

  for (const separator of SEPARATORS) {
    if (separator.test(text)) {
      reviews = text.split(separator);
      break;
    }
  }

  return reviews
    .map((review) =>
      review
        .replace(/\r/g, "")
        .replace(/\u0000/g, "")
        .replace(/[ \t]+/g, " ")
        .trim()
    )
    .filter((review) => review.length > 0);
}

export async function parseText(
  file: File
): Promise<SourceItem[]> {
  const text = await file.text();

  const reviews = splitReviews(text);

  return reviews.map(
    (review, index): SourceItem => ({
      id: crypto.randomUUID(),

      source: "txt",

      title: `${file.name} #${index + 1}`,

      content: review,

      createdAt: new Date().toISOString(),

      metadata: {
        fileName: file.name,
        reviewNumber: index + 1,
        totalReviews: reviews.length,
      },
    })
  );
}