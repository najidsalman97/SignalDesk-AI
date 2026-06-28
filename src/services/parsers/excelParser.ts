import * as XLSX from "xlsx";

import type { SourceItem } from "@/shared/types/source";

import { normalizeRows } from "./normalize";

export async function parseExcel(
  file: File
): Promise<SourceItem[]> {
  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer);

  const items: SourceItem[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      continue;
    }

    const rows = XLSX.utils.sheet_to_json<
      Record<string, unknown>
    >(sheet, {
      defval: "",
    });

    if (rows.length === 0) {
      continue;
    }

    const normalized = normalizeRows(
      rows,
      "excel"
    ).map((item, index) => ({
      ...item,

      metadata: {
        ...item.metadata,

        sheet: sheetName,

        rowNumber: index + 2,

        workbookSheets:
          workbook.SheetNames.length,

        importedFrom: file.name,
      },
    }));

    items.push(...normalized);
  }

  return items;
}