import type { ReactNode } from 'react'
import { documentUrl } from '@/shared/api/documents'
import { useApi } from '@/shared/api/useApi'
import type { DocumentsData } from '@/shared/api/types'
import { useI18n } from '@/shared/i18n/useI18n'
import { toast } from '@/shared/lib/toast'

const CLASS = 'font-semibold text-brand underline underline-offset-2'

/**
 * A link to a legal document from GET /client/documents (never cached: a new version has a new
 * URL). A document with no file for this language says it is being prepared.
 */
export function DocLink({ kind, children }: { kind: string; children: ReactNode }) {
  const { t, lang } = useI18n()
  const docs = useApi<DocumentsData>('/client/documents')
  const url = documentUrl(docs.data, kind, lang)
  if (url)
    return (
      <a href={url} target="_blank" rel="noreferrer" className={CLASS}>
        {children}
      </a>
    )
  return (
    <button type="button" className={CLASS} onClick={() => toast(t('docs.pending'), 'error')}>
      {children}
    </button>
  )
}
