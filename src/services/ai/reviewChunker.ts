import type { SourceItem } from "@/shared/types/source";

export interface ReviewChunk {
  id: string;

  reviews: SourceItem[];

  estimatedCharacters: number;
}

const MAX_CHARACTERS = 25000;

export function chunkReviews(
  reviews: SourceItem[]
): ReviewChunk[] {
  const chunks: ReviewChunk[] = [];

  let current: SourceItem[] = [];

  let currentCharacters = 0;

  for (const review of reviews) {
    const length =
      review.content.length +
      (review.title?.length ?? 0) +
      200;

    if (
      current.length > 0 &&
      currentCharacters + length >
        MAX_CHARACTERS
    ) {
      chunks.push({
        id: crypto.randomUUID(),

        reviews: current,

        estimatedCharacters:
          currentCharacters,
      });

      current = [];

      currentCharacters = 0;
    }

    current.push(review);

    currentCharacters += length;
  }

  if (current.length > 0) {
    chunks.push({
      id: crypto.randomUUID(),

      reviews: current,

      estimatedCharacters:
        currentCharacters,
    });
  }

  return chunks;
}