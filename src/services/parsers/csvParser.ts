import Papa, { type ParseResult } from "papaparse";

import type { SourceItem } from "@/shared/types/source";

import { normalizeRows } from "./normalize";

export async function parseCSV(
  file: File
): Promise<SourceItem[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(file, {
  header: true,

  skipEmptyLines: "greedy",

  dynamicTyping: false,

  delimiter: "",

  transformHeader(header) {
    return header.trim();
  },

  complete(
    results: ParseResult<Record<string, unknown>>
  ) {
    try {
      if (results.errors.length > 0) {
        console.warn(
          "CSV parsing warnings",
          results.errors
        );
      }

      const rows = results.data.filter(
        (row) =>
          row &&
          Object.keys(row).length > 0
      );

      resolve(
        normalizeRows(rows, "csv")
      );
    } catch (error) {
      reject(error);
    }
  },

  error(error) {
    reject(error);
  },
});
  });
}