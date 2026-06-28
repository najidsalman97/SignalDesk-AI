import type { Review } from "@/shared/types/review"

export type RawData = Record<string, unknown>[]

export interface ParseResult {
  reviews: Review[]
  errors: Array<{ row: number; message: string }>
  metadata: {
    totalRows: number
    parsedRows: number
    failedRows: number
  }
}

export interface Parser {
  name: string
  supportedTypes: string[]
  parse(data: RawData, sourceType: string): Promise<ParseResult>
}