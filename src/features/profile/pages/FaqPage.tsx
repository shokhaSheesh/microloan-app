import { ChevronDown, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FAQ } from '@/entities/support/faq'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { PageHeader } from '@/shared/ui/PageHeader'

/** Savol-javoblar: the questions, each opening its answer; the chat for anything else. */
export function FaqPage() {
  const { t, tl } = useI18n()
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="flex h-full flex-col bg-page">
      <PageHeader title={t('profile.faq')} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-2 pb-6">
        <ul className="rounded-card border border-line bg-canvas px-4">
          {FAQ.map((item, i) => (
            <li key={i} className="border-b border-line last:border-b-0">
              <button
                type="button"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center gap-3 py-4 text-left font-semibold"
              >
                <span className="flex-1">{tl(item.q)}</span>
                <ChevronDown
                  size={20}
                  className={cn(
                    'shrink-0 text-ink-subtle transition-transform',
                    open === i && 'rotate-180',
                  )}
                />
              </button>
              {open === i && <p className="-mt-1 pb-4 text-ink-muted">{tl(item.a)}</p>}
            </li>
          ))}
        </ul>
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
