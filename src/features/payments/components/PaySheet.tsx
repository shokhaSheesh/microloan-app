import { CreditCard } from 'lucide-react'
import { useState } from 'react'
import { cardText, type Card } from '@/entities/cards/cards'
import { pushNotification } from '@/entities/notifications/notifications'
import { productOf, progressOf, updateLoan, type Loan } from '@/entities/loans/loans'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { ROUTES } from '@/shared/config/routes'
import { formatDate, formatSum } from '@/shared/lib/format'
import { toast } from '@/shared/lib/toast'
import { Button } from '@/shared/ui/Button'
import { SelfCheck } from '@/shared/ui/SelfCheck'
import { Sheet } from '@/shared/ui/Sheet'

type Props = { loan: Loan; owner: string; cards: Card[]; onClose: () => void }

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const now = () => new Date()

/** Pays one loan's next monthly payment now, from a card the borrower picks. */
export function PaySheet({ loan, owner, cards, onClose }: Props) {
  const { t } = useI18n()
  const { next, schedule } = progressOf(loan)
  const product = productOf(loan)
  // The loan's own card first
  const [cardId, setCardId] = useState(
    cards.find((card) => card.last4 === loan.card.last4)?.id ?? cards[0]?.id,
  )
  const [busy, setBusy] = useState(false)
  // «Oʻzim bajaryapman» comes before the money is taken
  const [checking, setChecking] = useState(false)
  if (!next) return null

  const pay = async () => {
    setChecking(false)
    setBusy(true)
    await delay(1200)
    const paidCount = loan.paidCount + 1
    updateLoan(owner, loan.id, {
      paidCount,
      paidOn: { ...loan.paidOn, [next.n]: now() },
      overdueSince: undefined,
      ...(paidCount >= schedule.length ? { closedAt: now() } : {}),
    })
    pushNotification(owner, {
      id: `${loan.id}-paid${next.n}-${now().getTime()}`,
      kind: 'paid',
      title: 'notif.paid',
      body: 'notif.paid.body',
      params: { product: product?.name ?? '', sum: formatSum(next.amount), n: String(next.n) },
      at: now(),
      to: ROUTES.payments,
    })
    toast(t(paidCount >= schedule.length ? 'early.closed' : 'pay.done'))
    onClose()
  }

  return (
    <Sheet open onClose={onClose} title={t(checking ? 'selfcheck.title' : 'pay.title')}>
      {checking ? (
        <SelfCheck action="pay" onConfirm={() => void pay()} onCancel={() => setChecking(false)} />
      ) : (
        <div className="flex flex-col gap-5 pb-2">
          <div className="flex flex-col items-center gap-1 rounded-card bg-surface p-4 text-center">
            <span className="text-sm text-ink-muted">
              {product?.name} ·{' '}
              {t('pay.month', { n: String(next.n), total: String(schedule.length) })}
            </span>
            <span className="text-3xl font-bold tabular-nums">{formatSum(next.amount)}</span>
            <span
              className={cn(
                'text-sm',
                loan.overdueSince ? 'font-semibold text-danger' : 'text-ink-muted',
              )}
            >
              {t(loan.overdueSince ? 'pay.overdue' : 'pay.due', { date: formatDate(next.due) })}
            </span>
          </div>
          <div role="radiogroup" aria-label={t('pay.card')} className="flex flex-col gap-2">
            <p className="text-sm font-medium text-ink-muted">{t('pay.card')}</p>
            {cards.map((card) => (
              <button
                key={card.id}
                type="button"
                role="radio"
                aria-checked={card.id === cardId}
                onClick={() => setCardId(card.id)}
                className={cn(
                  'flex items-center gap-3 rounded-control border-[1.5px] bg-canvas p-3.5 text-left font-medium',
                  card.id === cardId ? 'border-primary' : 'border-line',
                )}
              >
                <CreditCard size={20} className="text-brand" />
                <span className="flex-1 tabular-nums">{cardText(card)}</span>
                <span
                  className={cn(
                    'grid size-5 place-items-center rounded-full border-2',
                    card.id === cardId ? 'border-primary' : 'border-neutral-400',
                  )}
                >
                  {card.id === cardId && <span className="size-2.5 rounded-full bg-primary" />}
                </span>
              </button>
            ))}
          </div>
          <Button block loading={busy} disabled={!cardId} onClick={() => setChecking(true)}>
            {t('early.pay', { sum: formatSum(next.amount) })}
          </Button>
        </div>
      )}
    </Sheet>
  )
}
