import { CalendarClock, Check, CircleAlert } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { cardText, useCards } from '@/entities/cards/cards'
import { productOf, progressOf, useLoans, type Loan } from '@/entities/loans/loans'
import { useBorrower } from '@/entities/session/session'
import { calendarNames } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { formatDate, formatSum } from '@/shared/lib/format'
import { Button } from '@/shared/ui/Button'
import { Section } from '@/shared/ui/Section'
import { PaySheet } from '../components/PaySheet'

type Paid = { key: string; at: Date; amount: number; label: string; card: string }

/**
 * Toʻlovlar: what to pay next on each running loan with "Toʻlash", and every payment made, by
 * month. Cards live in Profil. `?pay=<loan id>` opens that loan's payment straight away.
 */
export function PaymentsPage() {
  const { t, lang } = useI18n()
  const borrower = useBorrower()
  const loans = useLoans(borrower?.phone)
  const cards = useCards(borrower?.phone)
  const [params, setParams] = useSearchParams()
  const paying = loans.find((loan) => loan.id === params.get('pay') && !loan.closedAt)
  const active = loans.filter((loan) => !loan.closedAt)

  // Every payment made on every loan, newest first
  const paid: Paid[] = loans
    .flatMap((loan) => {
      const { schedule } = progressOf(loan)
      const name = productOf(loan)?.name ?? ''
      const card = cardText(loan.card)
      return [
        ...schedule
          .filter((item) => item.n <= loan.paidCount)
          .map((item) => ({
            key: `${loan.id}-m${item.n}`,
            at: loan.paidOn?.[item.n] ?? item.due,
            amount: item.amount,
            label: `${name} · ${t('history.monthly', { n: String(item.n) })}`,
            card,
          })),
        ...(loan.prepayments ?? []).map((extra, i) => ({
          key: `${loan.id}-e${i}`,
          at: extra.at,
          amount: extra.amount,
          label: `${name} · ${t(extra.kind === 'full' ? 'history.full' : 'history.partial')}`,
          card,
        })),
      ]
    })
    .sort((a, b) => b.at.getTime() - a.at.getTime())
  const months = paid.reduce<{ key: string; label: string; items: Paid[] }[]>((groups, item) => {
    const key = `${item.at.getFullYear()}-${item.at.getMonth()}`
    const last = groups.at(-1)
    if (last?.key === key) last.items.push(item)
    else
      groups.push({
        key,
        label: `${calendarNames[lang].months[item.at.getMonth()]} ${item.at.getFullYear()}`,
        items: [item],
      })
    return groups
  }, [])

  if (!borrower) return null
  return (
    <div className="flex min-h-full flex-col gap-7 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-tabbar">
      <h1 className="text-2xl font-bold">{t('nav.payments')}</h1>

      <Section title={t('pay.toPay')}>
        {active.length === 0 ? (
          <p className="rounded-card border border-line bg-canvas p-4 text-sm text-ink-muted">
            {t('pay.nothing')}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {active.map((loan) => (
              <li key={loan.id}>
                <DueCard loan={loan} onPay={() => setParams({ pay: loan.id })} />
              </li>
            ))}
          </ul>
        )}
        <p className="flex items-start gap-2 px-1 text-xs text-ink-muted">
          <CalendarClock size={16} className="shrink-0" />
          {t('pay.auto')}
        </p>
      </Section>

      <Section title={t('pay.history')}>
        {months.length === 0 ? (
          <p className="rounded-card border border-line bg-canvas p-4 text-sm text-ink-muted">
            {t('history.empty')}
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {months.map((month) => (
              <div key={month.key} className="flex flex-col gap-2">
                <p className="px-1 text-xs font-semibold tracking-wide text-ink-muted uppercase">
                  {month.label}
                </p>
                <ul className="flex flex-col rounded-card border border-line bg-canvas px-4">
                  {month.items.map((item) => (
                    <li
                      key={item.key}
                      className="flex items-center gap-3 border-b border-line py-3 last:border-b-0"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-success-soft text-success">
                        <Check size={18} strokeWidth={2.5} />
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-medium">{item.label}</span>
                        <span className="text-xs text-ink-muted tabular-nums">
                          {formatDate(item.at)} · {item.card}
                        </span>
                      </div>
                      <span className="font-semibold tabular-nums">{formatSum(item.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Section>

      {paying && (
        <PaySheet
          loan={paying}
          phone={borrower.phone}
          cards={cards}
          onClose={() => setParams({}, { replace: true })}
        />
      )}
    </div>
  )
}

/** One loan's next payment, red when its day has passed. */
function DueCard({ loan, onPay }: { loan: Loan; onPay: () => void }) {
  const { t } = useI18n()
  const { next } = progressOf(loan)
  const late = !!loan.overdueSince
  if (!next) return null
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-card border p-4',
        late ? 'border-danger/30 bg-danger-soft' : 'border-line bg-canvas',
      )}
    >
      <span
        className={cn(
          'grid size-11 shrink-0 place-items-center rounded-full',
          late ? 'bg-danger text-white' : 'bg-surface text-brand',
        )}
      >
        {late ? <CircleAlert size={22} /> : <CalendarClock size={22} />}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className={cn('text-sm', late ? 'text-danger' : 'text-ink-muted')}>
          {productOf(loan)?.name} ·{' '}
          {t(late ? 'pay.overdue' : 'pay.due', { date: formatDate(next.due) })}
        </span>
        <span className="text-lg font-bold tabular-nums">{formatSum(next.amount)}</span>
      </div>
      <Button size="sm" className="px-5!" onClick={onPay}>
        {t('home.loan.pay')}
      </Button>
    </div>
  )
}
