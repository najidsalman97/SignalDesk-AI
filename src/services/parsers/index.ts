import { parseCSV } from "./csvParser";
import { parseExcel } from "./excelParser";
import { parseJSON } from "./jsonParser";
import { parseText } from "./textParser";
import { parseDOCX } from "./docxParser";

export async function parseFile(
  file: File
) {
  const ext =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase();

  switch (ext) {
    case "csv":
      return parseCSV(file);

    case "xls":
    case "xlsx":
      return parseExcel(file);

    case "json":
      return parseJSON(file);

    case "txt":
      return parseText(file);

    case "docx":
      return parseDOCX(file);

    default:
      throw new Error(
        `Unsupported file type: ${ext}`
      );
  }
}