import { useState } from 'react'
import { payoffOf, progressOf, scheduleOf, updateLoan, type Loan } from '@/entities/loans/loans'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum } from '@/shared/lib/format'
import { toast } from '@/shared/lib/toast'
import { Button } from '@/shared/ui/Button'
import { ChoiceGrid } from '@/shared/ui/ChoiceGrid'
import { NumberField } from '@/shared/ui/NumberField'
import { Sheet } from '@/shared/ui/Sheet'

type Props = { open: boolean; onClose: () => void; loan: Loan; phone: string; card: string }

const MIN_PART = 100_000
const now = () => new Date()
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Paying ahead: close the whole loan (the principal left and this month's interest so far), or
 * pay part of it, which lowers every payment after it. Taken from the loan's card.
 */
export function EarlyRepaySheet({ open, onClose, loan, phone, card }: Props) {
  const { t } = useI18n()
  const [kind, setKind] = useState<'full' | 'partial'>('full')
  const [amount, setAmount] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [today] = useState(now)
  const { next, principalLeft } = progressOf(loan)
  const payoff = payoffOf(loan, today)

  const max = principalLeft - MIN_PART
  const partError =
    kind !== 'partial' || amount === null
      ? undefined
      : amount < MIN_PART
        ? t('early.min', { sum: formatSum(MIN_PART) })
        : amount > max
          ? t('early.max')
          : undefined
  // What the monthly payment becomes after a partial payment
  const after =
    kind === 'partial' && amount && !partError
      ? scheduleOf({
          ...loan,
          prepayments: [
            ...(loan.prepayments ?? []),
            { at: today, amount, kind: 'partial', afterPaid: loan.paidCount },
          ],
        })[loan.paidCount]?.amount
      : undefined
  const sum = kind === 'full' ? payoff : (amount ?? 0)

  const pay = async () => {
    if (kind === 'partial' && (!amount || partError)) return
    setBusy(true)
    await delay(1200)
    const extra = { at: now(), amount: sum, kind, afterPaid: loan.paidCount }
    updateLoan(phone, loan.id, {
      prepayments: [...(loan.prepayments ?? []), extra],
      ...(kind === 'full' ? { closedAt: now() } : {}),
    })
    setBusy(false)
    toast(t(kind === 'full' ? 'early.closed' : 'early.paid'))
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={t('early.title')}>
      <div className="flex flex-col gap-5 pb-2">
        <ChoiceGrid
          label={t('early.kind')}
          columns={2}
          options={[
            { value: 'full', label: t('early.full'), description: formatSum(payoff) },
            { value: 'partial', label: t('early.partial'), description: t('early.partial.hint') },
          ]}
          value={kind}
          onChange={setKind}
        />
        {kind === 'full' ? (
          <p className="rounded-control bg-surface p-3 text-sm text-ink-muted">
            {t('early.full.hint', { principal: formatSum(principalLeft) })}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <NumberField
              label={t('early.amount')}
              value={amount}
              onChange={setAmount}
              suffix={t('common.currency')}
              error={partError}
            />
            {after !== undefined && next && (
              <p className="rounded-control bg-accent-100 p-3 text-sm">
                {t('early.after', { from: formatSum(next.amount), to: formatSum(after) })}
              </p>
            )}
          </div>
        )}
        <p className="text-sm text-ink-muted">{t('early.card', { card })}</p>
        <Button
          block
          loading={busy}
          disabled={kind === 'partial' && (!amount || !!partError)}
          onClick={() => void pay()}
        >
          {t('early.pay', { sum: formatSum(sum) })}
        </Button>
      </div>
    </Sheet>
  )
}
