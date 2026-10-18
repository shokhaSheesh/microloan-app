import { Check, CircleAlert, Download, Zap } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  productOf,
  progressOf,
  stateOf,
  useLoans,
  type InstallmentState,
} from '@/entities/loans/loans'
import { useBorrower } from '@/entities/session/session'
import { payPath, ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { formatDate, formatSum } from '@/shared/lib/format'
import { toast } from '@/shared/lib/toast'
import { Button } from '@/shared/ui/Button'
import { InfoList, InfoRow } from '@/shared/ui/InfoList'
import { PageHeader } from '@/shared/ui/PageHeader'
import { SegmentedTabs } from '@/shared/ui/SegmentedTabs'
import { EarlyRepaySheet } from '../components/EarlyRepaySheet'

type Tab = 'schedule' | 'history' | 'contract'

const stateLook: Record<InstallmentState, string> = {
  paid: 'bg-success-soft text-success',
  next: 'bg-primary text-on-primary',
  overdue: 'bg-danger-soft text-danger',
  upcoming: 'bg-surface text-ink-muted',
  settled: 'bg-surface text-ink-subtle',
}

/**
 * One loan: what is left and the next payment on top, with "Toʻlash" and early repayment; then
 * the schedule month by month, the payments made, and the contract.
 */
export function LoanPage() {
  const { t, tl } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const borrower = useBorrower()
  const loans = useLoans(borrower?.passport)
  const loan = loans.find((item) => item.id === id)
  const [tab, setTab] = useState<Tab>('schedule')
  const [early, setEarly] = useState(false)
  const [today] = useState(() => new Date())
  if (!loan || !borrower) return <Navigate to={ROUTES.loans} replace />

  const product = productOf(loan)
  const { schedule, next, principalLeft, remaining, paid, total } = progressOf(loan)
  const card = `${loan.card.brand === 'humo' ? 'Humo' : 'Uzcard'} •••• ${loan.card.last4}`
  const history = [
    ...schedule
      .filter((item) => item.n <= loan.paidCount)
      .map((item) => ({
        key: `m${item.n}`,
        at: loan.paidOn?.[item.n] ?? item.due,
        amount: item.amount,
        label: t('history.monthly', { n: String(item.n) }),
      })),
    ...(loan.prepayments ?? []).map((extra, i) => ({
      key: `e${i}`,
      at: extra.at,
      amount: extra.amount,
      label: t(extra.kind === 'full' ? 'history.full' : 'history.partial'),
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime())

  return (
    <div className="flex h-full flex-col bg-page">
      <PageHeader title={`${product?.name ?? ''} · № ${loan.number}`} />
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pt-2 pb-8">
        <section className="flex flex-col gap-4 rounded-[28px] bg-tile p-5 text-on-tile">
          {loan.closedAt ? (
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-2 text-lg font-bold">
                <Check size={22} className="text-accent-500" />
                {t('loans.closedOn', { date: formatDate(loan.closedAt) })}
              </span>
              <span className="text-sm opacity-60 tabular-nums">
                {t('loan.issued', { sum: formatSum(loan.amount), date: formatDate(loan.issuedAt) })}
              </span>
            </div>
          ) : (
            <>
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
                    className="h-full rounded-full bg-accent-500"
                    style={{ width: `${(paid / total) * 100}%` }}
                  />
                </div>
                <span className="text-xs opacity-60 tabular-nums">
                  {t('home.loan.progress', { paid: String(paid), total: String(total) })}
                </span>
              </div>
              {next && (
                <div className="flex items-center gap-3 rounded-control bg-white/10 p-3">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-xs opacity-70">
                      {t('home.loan.next', { date: formatDate(next.due) })}
                    </span>
                    <span className="text-lg font-bold tabular-nums">{formatSum(next.amount)}</span>
                  </div>
                  <Button size="sm" className="px-5!" onClick={() => navigate(payPath(loan.id))}>
                    {t('home.loan.pay')}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {loan.overdueSince && !loan.closedAt && (
          <p className="flex items-center gap-2.5 rounded-control bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">
            <CircleAlert size={20} className="shrink-0" />
            {t('home.loan.late')}
          </p>
        )}

        {!loan.closedAt && (
          <Button variant="secondary" block onClick={() => setEarly(true)}>
            <Zap size={20} />
            {t('early.title')}
          </Button>
        )}

        <SegmentedTabs
          label={t('nav.loans')}
          options={[
            { value: 'schedule', label: t('loan.tab.schedule') },
            { value: 'history', label: t('loan.tab.history') },
            { value: 'contract', label: t('loan.tab.contract') },
          ]}
          value={tab}
          onChange={setTab}
        />

        {tab === 'schedule' && (
          <ol className="flex flex-col rounded-card border border-line bg-canvas px-4">
            {schedule.map((item) => {
              const state = stateOf(loan, item, today)
              return (
                <li
                  key={item.n}
                  className={cn(
                    'flex items-center gap-3 border-b border-line py-3 last:border-b-0',
                    (state === 'paid' || state === 'settled') && 'opacity-70',
                  )}
                >
                  <span
                    className={cn(
                      'grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold tabular-nums',
                      stateLook[state],
                    )}
                  >
                    {state === 'paid' ? <Check size={16} strokeWidth={3} /> : item.n}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="font-medium tabular-nums">{formatDate(item.due)}</span>
                    <span
                      className={cn(
                        'text-xs',
                        state === 'overdue' ? 'text-danger' : 'text-ink-muted',
                      )}
                    >
                      {t(`loan.state.${state}`)}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'tabular-nums',
                      state === 'next' ? 'font-bold' : 'font-semibold',
                      state === 'paid' && 'line-through',
                      state === 'settled' && 'text-ink-subtle',
                    )}
                  >
                    {formatSum(item.amount)}
                  </span>
                </li>
              )
            })}
          </ol>
        )}

        {tab === 'history' &&
          (history.length === 0 ? (
            <p className="rounded-card border border-line bg-canvas p-4 text-center text-sm text-ink-muted">
              {t('history.empty')}
            </p>
          ) : (
            <ul className="flex flex-col rounded-card border border-line bg-canvas px-4">
              {history.map((item) => (
                <li
                  key={item.key}
                  className="flex items-center gap-3 border-b border-line py-3 last:border-b-0"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-success-soft text-success">
                    <Check size={18} strokeWidth={2.5} />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-xs text-ink-muted tabular-nums">
                      {formatDate(item.at)} · {card}
                    </span>
                  </div>
                  <span className="font-semibold tabular-nums">{formatSum(item.amount)}</span>
                </li>
              ))}
            </ul>
          ))}

        {tab === 'contract' && (
          <div className="flex flex-col gap-4">
            <InfoList>
              <InfoRow
                label={t('apply.product')}
                value={`${product?.name} · ${product ? tl(product.kind) : ''}`}
              />
              <InfoRow label={t('loan.number')} value={loan.number} />
              <InfoRow label={t('loan.issuedOn')} value={formatDate(loan.issuedAt)} />
              <InfoRow label={t('apply.amount')} value={formatSum(loan.amount)} />
              <InfoRow
                label={t('apply.term')}
                value={t('apply.months', { n: String(loan.term) })}
              />
              <InfoRow
                label={t('apply.rate')}
                value={t('apply.rate.value', { rate: String(loan.rate) })}
              />
              <InfoRow
                label={t('contract.payDay')}
                value={t('contract.payDay.value', { day: String(loan.payDay) })}
              />
              <InfoRow label={t('contract.card')} value={card} />
            </InfoList>
            <Button variant="secondary" block onClick={() => toast(t('loan.pdf.sample'))}>
              <Download size={20} />
              {t('loan.pdf')}
            </Button>
          </div>
        )}
      </div>

      {/* Mounted only while open, so each time starts from "Toʻliq yopish" with no sum typed */}
      {early && (
        <EarlyRepaySheet
          open
          onClose={() => setEarly(false)}
          loan={loan}
          owner={borrower.passport}
          card={card}
        />
      )}
    </div>
  )
}
