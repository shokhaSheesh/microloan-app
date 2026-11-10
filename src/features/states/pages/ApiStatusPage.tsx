import { useState } from 'react'
import { apiGet, APP_CODE, ApiError, chatHeaders } from '@/shared/api/client'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { PageHeader } from '@/shared/ui/PageHeader'
import { SampleBadge } from '@/shared/ui/SampleBadge'

type Row = { page: string; route?: string; endpoint?: string; note?: string }

// Every screen, and the endpoint it reads (birzum-mobile-api.md §2). No client login exists yet.
const ROWS: Row[] = [
  { page: 'Asosiy: tezkor amallar, plitkalar, bannerlar', endpoint: '/client/home' },
  { page: 'Tab bar (tartib, nomlar, koʻrinish)', endpoint: '/client/home' },
  { page: 'Kirish slaydlari', route: '/welcome', endpoint: '/client/slides' },
  { page: 'Savol-javoblar', route: ROUTES.faq, endpoint: '/client/faq' },
  { page: 'Kontaktlar va filiallar', route: ROUTES.contacts, endpoint: '/client/contacts' },
  { page: 'Hujjatlar, kirishdagi oferta/maxfiylik', endpoint: '/client/documents' },
  { page: 'Xarita kalitlari (ilovada xarita yoʻq, faqat tekshiruv)', endpoint: '/client/geo/keys' },
  { page: 'Kalkulyator: toʻlov kuni tugmalari', route: ROUTES.apply, endpoint: '/client/pay-days' },
  { page: 'Yordam chati: mavzular', route: ROUTES.chat, endpoint: '/client/chat/topics' },
  {
    page: 'Yordam chati: chatlarim (X-Client-Id)',
    route: ROUTES.chat,
    endpoint: '/client/chats',
    note: 'Yozish: POST /client/chats, POST /client/chats/{id}/messages (≤ 5 rasm), POST .../read, 5 soniyada bir GET /client/chats/{id}',
  },
  { page: 'Kirish, SMS, MyID, PIN', note: 'Mijoz logini yoʻq, namuna' },
  {
    page: 'Qarzlar, toʻlovlar, kartalar, arizalar, bildirishnomalar, profil',
    note: 'Endpoint yoʻq, namuna',
  },
]

type Result = { ok: boolean; text: string }

/** Which screens read the backend, with a button that calls each endpoint and shows the answer. */
export function ApiStatusPage() {
  const { t } = useI18n()
  const [results, setResults] = useState<Record<string, Result | 'running'>>({})

  const run = async (endpoint: string) => {
    setResults((r) => ({ ...r, [endpoint]: 'running' }))
    try {
      const res = await apiGet<unknown>(endpoint, {
        headers: endpoint.startsWith('/client/chats') ? chatHeaders() : undefined,
      })
      setResults((r) => ({
        ...r,
        [endpoint]: {
          ok: true,
          text: `${res.status} · ${Math.round(res.ms)} ms · ${res.requestId}`,
        },
      }))
    } catch (error) {
      const e = error instanceof ApiError ? error : new ApiError(String(error), 'unknown', 0, 0)
      setResults((r) => ({
        ...r,
        [endpoint]: {
          ok: false,
          text: `${e.status} ${e.slug} · ${e.message} · ${e.requestId ?? ''}`,
        },
      }))
    }
  }

  return (
    <div className="flex h-full flex-col bg-page">
      <PageHeader title={t('api.status.title')} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-2 pb-6">
        <p className="text-sm text-ink-muted">
          {t('api.status.hint')} X-App: <b>{APP_CODE}</b>
        </p>
        <ul className="rounded-card border border-line bg-canvas px-4">
          {ROWS.map((row) => {
            const result = row.endpoint ? results[row.endpoint] : undefined
            return (
              <li
                key={row.page}
                className="flex flex-col gap-1.5 border-b border-line py-3 last:border-b-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-medium">{row.page}</span>
                  {row.endpoint ? (
                    <span className="shrink-0 rounded-full bg-accent-200 px-2 py-0.5 text-[11px] font-semibold text-brand">
                      {t('api.status.wired')}
                    </span>
                  ) : (
                    <SampleBadge />
                  )}
                </div>
                {row.endpoint && (
                  <div className="flex items-center gap-3">
                    <code className="min-w-0 flex-1 truncate text-xs text-ink-muted">
                      GET {row.endpoint}
                    </code>
                    <button
                      type="button"
                      disabled={result === 'running'}
                      onClick={() => void run(row.endpoint!)}
                      className="shrink-0 text-sm font-semibold text-brand"
                    >
                      {t(result === 'running' ? 'api.status.running' : 'api.status.run')}
                    </button>
                  </div>
                )}
                {row.note && <span className="text-xs text-ink-muted">{row.note}</span>}
                {result && result !== 'running' && (
                  <span
                    className={cn('text-xs break-all', result.ok ? 'text-success' : 'text-danger')}
                  >
                    {result.text}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
