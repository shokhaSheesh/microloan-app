import type { DocumentsData } from './types'

/** The PDF URL of a legal document in the UI language, or '' while it is not uploaded. */
export const documentUrl = (data: DocumentsData | undefined, kind: string, lang: 'uz' | 'ru') =>
  data?.items.find((item) => item.kind === kind)?.[lang]?.url ?? ''
