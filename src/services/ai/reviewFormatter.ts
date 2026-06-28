import type { SourceItem } from "@/shared/types/source";

export function formatReviewsForAI(
  reviews: SourceItem[]
): string {
  return reviews
    .map((review, index) => {
      const metadata =
        Object.entries(review.metadata)
          .map(
            ([key, value]) =>
              `${key}: ${String(value)}`
          )
          .join("\n");

      return `
==============================

Review #${index + 1}

Source: ${review.source}

Title: ${review.title ?? "N/A"}

Rating: ${review.rating ?? "N/A"}

Language: ${review.language ?? "Unknown"}

Author: ${review.author ?? "Unknown"}

Created At: ${review.createdAt}

${metadata ? `Metadata:\n${metadata}\n` : ""}

Content:

${review.content}
`;
    })
    .join("\n");
}