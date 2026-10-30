import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { scheduleOf } from '@/entities/loans/loans'
import type { PayType } from '@/shared/config/brand'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { formatDate, formatSum } from '@/shared/lib/format'
import { InstallmentBreakdown } from '@/features/loans/components/InstallmentBreakdown'
import { Sheet } from '@/shared/ui/Sheet'

type Props = {
  open: boolean
  onClose: () => void
  amount: number
  rate: number
  term: number
  payDay: number
  payType: PayType
}

/**
 * Every monthly payment with its date, if the loan were paid out today, due on the picked day. A
 * month opens to show its principal, interest and total.
 */
export function ScheduleSheet({
  open: visible,
  onClose,
  amount,
  rate,
  term,
  payDay,
  payType,
}: Props) {
  const { t } = useI18n()
  const [today] = useState(() => new Date())
  // The month opened to show what its payment is made of
  const [open, setOpen] = useState<number | null>(null)
  const schedule = scheduleOf({ amount, rate, term, issuedAt: today, payDay, payType })
  return (
    <Sheet open={visible} onClose={onClose} title={t('apply.schedule')}>
      <ol className="flex flex-col pb-2">
        {schedule.map((item) => {
          const shown = open === item.n
          return (
            <li key={item.n} className="border-b border-line last:border-b-0">
              <button
                type="button"
                aria-expanded={shown}
                onClick={() => setOpen(shown ? null : item.n)}
                className="flex w-full items-center gap-3 py-3 text-left"
              >
                <span className="w-6 text-sm text-ink-subtle tabular-nums">{item.n}</span>
                <span className="flex-1 tabular-nums">{formatDate(item.due)}</span>
                <span className="font-semibold tabular-nums">{formatSum(item.amount)}</span>
                <ChevronDown
                  size={18}
                  className={cn(
                    'shrink-0 text-ink-subtle transition-transform',
                    shown && 'rotate-180',
                  )}
                />
              </button>
              {shown && (
                <div className="pb-3">
                  <InstallmentBreakdown item={item} />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </Sheet>
  )
}
