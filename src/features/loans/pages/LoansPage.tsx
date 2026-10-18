import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { productOf, progressOf, useLoans, type Loan } from '@/entities/loans/loans'
import { useBorrower } from '@/entities/session/session'
import { loanPath, ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { formatDate, formatSum } from '@/shared/lib/format'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { SegmentedTabs } from '@/shared/ui/SegmentedTabs'

type Tab = 'active' | 'closed'

/** Qarzlarim: the running loans, or the closed ones, each opening its own page. */
export function LoansPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const borrower = useBorrower()
  const loans = useLoans(borrower?.passport)
  const active = loans.filter((loan) => !loan.closedAt)
  const closed = loans.filter((loan) => loan.closedAt)
  const [tab, setTab] = useState<Tab>(active.length || !closed.length ? 'active' : 'closed')
  const shown = tab === 'active' ? active : closed

  return (
    <div className="flex min-h-full flex-col gap-5 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-tabbar">
      <h1 className="text-2xl font-bold">{t('nav.loans')}</h1>
      <SegmentedTabs
        label={t('nav.loans')}
        options={[
          { value: 'active', label: t('loans.active', { count: String(active.length) }) },
          { value: 'closed', label: t('loans.closed', { count: String(closed.length) }) },
        ]}
        value={tab}
        onChange={setTab}
      />
      {shown.length === 0 ? (
        <div className="flex flex-col items-center gap-4">
          <EmptyState
            title={t(tab === 'active' ? 'loans.empty.active' : 'loans.empty.closed')}
            hint={tab === 'active' ? t('loans.empty.hint') : undefined}
          />
          {tab === 'active' && (
            <Button onClick={() => navigate(ROUTES.apply)}>{t('home.offer.cta')}</Button>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((loan) => (
            <li key={loan.id}>
              <LoanCard loan={loan} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** One loan: product and number, what is left (or when it closed), progress, the next payment. */
function LoanCard({ loan }: { loan: Loan }) {
  const { t } = useI18n()
  const { next, principalLeft, paid, total } = progressOf(loan)
  const product = productOf(loan)
  return (
    <Link
      to={loanPath(loan.id)}
      className="flex flex-col gap-4 rounded-card border border-line bg-canvas p-4 active:bg-neutral-100"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <span className="font-bold">{product?.name}</span>
          <span className="text-xs text-ink-muted tabular-nums">
            № {loan.number} · {formatSum(loan.amount)}
          </span>
        </div>
        <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
      </div>
      {loan.closedAt ? (
        <p className="flex items-center gap-2 text-sm font-semibold text-success">
          {t('loans.closedOn', { date: formatDate(loan.closedAt) })}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-ink-muted">{t('home.loan.left')}</span>
            <span className="text-2xl leading-none font-bold tabular-nums">
              {formatSum(principalLeft)}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-accent-500"
                style={{ width: `${(paid / total) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-ink-muted tabular-nums">
              <span>{t('home.loan.progress', { paid: String(paid), total: String(total) })}</span>
              {next && (
                <span className={cn(loan.overdueSince && 'font-semibold text-danger')}>
                  {t('loans.next', { date: formatDate(next.due), sum: formatSum(next.amount) })}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </Link>
  )
}
