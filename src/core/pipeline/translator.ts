export interface TranslationResult {
  originalText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  confidence: number
}

export interface TranslatorConfig {
  targetLanguage: string
  autoDetect: boolean
}

export interface Translator {
  name: string
  translate(text: string, config: TranslatorConfig): Promise<TranslationResult>
  batchTranslate(
    texts: string[],
    config: TranslatorConfig,
  ): Promise<TranslationResult[]>
}