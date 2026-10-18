import { useState } from 'react'
import { scheduleOf } from '@/entities/loans/loans'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatDate, formatSum } from '@/shared/lib/format'
import { Sheet } from '@/shared/ui/Sheet'

type Props = { open: boolean; onClose: () => void; amount: number; rate: number; term: number }

/** Every monthly payment with its date, if the loan were paid out today, due on the 5th. */
export function ScheduleSheet({ open, onClose, amount, rate, term }: Props) {
  const { t } = useI18n()
  const [today] = useState(() => new Date())
  const schedule = scheduleOf({ amount, rate, term, issuedAt: today, payDay: 5 })
  return (
    <Sheet open={open} onClose={onClose} title={t('apply.schedule')}>
      <ol className="flex flex-col pb-2">
        {schedule.map((item) => (
          <li
            key={item.n}
            className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-b-0"
          >
            <span className="flex items-center gap-3">
              <span className="w-6 text-sm text-ink-subtle tabular-nums">{item.n}</span>
              <span className="tabular-nums">{formatDate(item.due)}</span>
            </span>
            <span className="flex flex-col items-end">
              <span className="font-semibold tabular-nums">{formatSum(item.amount)}</span>
              <span className="text-xs text-ink-muted tabular-nums">
                {t('apply.schedule.split', {
                  principal: formatSum(Math.round(item.principal), false),
                  interest: formatSum(Math.round(item.interest), false),
                })}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </Sheet>
  )
}
