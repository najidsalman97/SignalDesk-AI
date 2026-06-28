import type { SourceItem } from "@/shared/types/source";

export async function parseDOCX(
  file: File
): Promise<SourceItem[]> {

  const mammoth =
    await import("mammoth");

  const arrayBuffer =
    await file.arrayBuffer();

  const result =
    await mammoth.extractRawText({
      arrayBuffer,
    });

  return [
    {
      id: crypto.randomUUID(),

      source: "docx",

      title: file.name,

      content: result.value,

      createdAt:
        new Date().toISOString(),

      metadata: {},
    },
  ];
}