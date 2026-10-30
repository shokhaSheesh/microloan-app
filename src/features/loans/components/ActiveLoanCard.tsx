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
  const { next, remaining, principalLeft, paid, total } = progressOf(loan)
  const product = productOf(loan)
  const late = !!loan.overdueSince

  return (
    <section className="flex flex-col gap-3">
      {late && <OverdueNotice loan={loan} />}
      <div className="relative flex flex-col gap-5 overflow-hidden rounded-[28px] bg-tile p-5 text-on-tile">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <span className="font-semibold">{product?.name}</span>
            <span className="text-xs opacity-60 tabular-nums">№ {loan.number}</span>
          </div>
          <Link
            to={loanPath(loan.id)}
            className="flex items-center gap-0.5 text-sm font-semibold opacity-80"
          >
            {t('home.loan.details')}
            <ChevronRight size={16} />
          </Link>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm opacity-60">{t('home.loan.left')}</span>
          <span className="text-[32px] leading-none font-bold tracking-tight tabular-nums">
            {formatSum(principalLeft)}
          </span>
          <span className="text-xs opacity-60 tabular-nums">
            {t('home.loan.withInterest', { sum: formatSum(remaining) })}
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="h-2 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${(paid / total) * 100}%` }}
            />
          </div>
          <span className="text-xs opacity-60 tabular-nums">
            {t('home.loan.progress', { paid: String(paid), total: String(total) })}
          </span>
        </div>
        {next && (
          <div className="relative flex items-center gap-3 rounded-control bg-white/10 p-3">
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-xs opacity-70">
                {t('home.loan.next', { date: formatDate(next.due) })}
              </span>
              <span className="text-lg font-bold tabular-nums">{formatSum(next.amount)}</span>
            </div>
            <Link
              to={payPath(loan.id)}
              className="grid h-10 place-items-center rounded-control bg-white px-5 text-sm font-semibold text-primary-pressed active:bg-neutral-100"
            >
              {t('home.loan.pay')}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
