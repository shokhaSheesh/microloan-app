import { ChevronDown, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '@/shared/api/useApi'
import type { FaqData } from '@/shared/api/types'
import { ErrorState } from '@/shared/ui/ErrorState'
import { SkeletonRows } from '@/shared/ui/Skeleton'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { PageHeader } from '@/shared/ui/PageHeader'

/** Savol-javoblar: the questions, each opening its answer; the chat for anything else. */
export function FaqPage() {
  const { t, tl } = useI18n()
  const [open, setOpen] = useState<number | null>(0)
  const faq = useApi<FaqData>('/client/faq')
  const items = faq.data?.items ?? []
  return (
    <div className="flex h-full flex-col bg-page">
      <PageHeader title={t('profile.faq')} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-2 pb-6">
        {faq.error && <ErrorState kind="server" onAction={faq.reload} />}
        {faq.loading && !faq.data && <SkeletonRows count={5} avatar={false} />}
        {faq.data && items.length === 0 && <p className="text-ink-muted">{t('faq.empty')}</p>}
        {items.length > 0 && (
          <ul className="rounded-card border border-line bg-canvas px-4">
            {items.map((item, i) => (
              <li key={item.id} className="border-b border-line last:border-b-0">
                <button
                  type="button"
                  aria-expanded={open === i}
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center gap-3 py-4 text-left font-semibold"
                >
                  <span className="flex-1">{tl(item.question)}</span>
                  <ChevronDown
                    size={20}
                    className={cn(
                      'shrink-0 text-ink-subtle transition-transform',
                      open === i && 'rotate-180',
                    )}
                  />
                </button>
                {open === i && <p className="-mt-1 pb-4 text-ink-muted">{tl(item.answer)}</p>}
              </li>
            ))}
          </ul>
        )}
        <Link
          to={ROUTES.chat}
          className="flex items-center gap-3 rounded-card border border-line bg-canvas p-4 active:bg-neutral-100"
        >
          <MessageCircle size={22} className="text-brand" />
          <span className="flex-1 font-medium">{t('faq.ask')}</span>
        </Link>
      </div>
    </div>
  )
}
