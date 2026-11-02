import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { productOf, progressOf, type Loan } from '@/entities/loans/loans'
import { loanPath, payPath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatDate, formatSum } from '@/shared/lib/format'
import { OverdueNotice } from './OverdueNotice'

/**
 * The running loan on a dark card, at the top of Qarzlarim → Faol: what is left, how far along,
 * and the next payment with «Toʻlash». A late loan has the overdue card above it.
 */
export function ActiveLoanCard({ loan }: { loan: Loan }) {
  const { t } = useI18n()
  const { next, principalLeft, paid, total } = progressOf(loan)
  const product = productOf(loan)
  const late = !!loan.overdueSince

  return (
    <section className="flex flex-col gap-3">
      {late && <OverdueNotice loan={loan} />}
      {/* Compact, about a third of the screen (client, 31.10) */}
      <div className="relative flex flex-col gap-3 overflow-hidden rounded-3xl bg-tile p-4 text-on-tile">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold">
            {product?.name} <span className="font-normal opacity-80">· № {loan.number}</span>
          </span>
          <Link
            to={loanPath(loan.id)}
            className="flex items-center gap-0.5 text-sm font-semibold opacity-90"
          >
            {t('home.loan.details')}
            <ChevronRight size={16} />
          </Link>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs opacity-80">{t('home.loan.left')}</span>
          <span className="text-[26px] leading-none font-bold tracking-tight tabular-nums">
            {formatSum(principalLeft)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${(paid / total) * 100}%` }}
            />
          </div>
          <span className="text-xs opacity-90 tabular-nums">
            {t('home.loan.progress', { paid: String(paid), total: String(total) })}
          </span>
        </div>
        {next && (
          <div className="flex items-center gap-3 rounded-control bg-white/15 px-3 py-2">
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-xs opacity-90">
                {t('home.loan.next', { date: formatDate(next.due) })}
              </span>
              <span className="font-bold tabular-nums">{formatSum(next.amount)}</span>
            </div>
            <Link
              to={payPath(loan.id)}
              className="grid h-9 place-items-center rounded-control bg-white px-4 text-sm font-semibold text-primary-pressed active:bg-neutral-100"
            >
              {t('home.loan.pay')}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
