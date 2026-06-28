import type { SourceItem } from "@/shared/types/source";

import { normalizeRows } from "./normalize";

export async function parseJSON(
  file: File
): Promise<SourceItem[]> {
  const text = await file.text();

  const parsed: unknown = JSON.parse(text);

  const rows = Array.isArray(parsed)
    ? parsed
    : [parsed];

  const normalizedRows = rows.filter(
    (
      row
    ): row is Record<string, unknown> =>
      typeof row === "object" &&
      row !== null &&
      !Array.isArray(row)
  );

  return normalizeRows(
    normalizedRows,
    "json"
  );
}