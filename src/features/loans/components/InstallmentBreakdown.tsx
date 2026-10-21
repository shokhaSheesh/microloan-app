import type { Installment } from '@/entities/loans/loans'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum } from '@/shared/lib/format'

/** What one monthly payment is made of: principal, interest, and the payment itself. */
export function InstallmentBreakdown({ item }: { item: Installment }) {
  const { t } = useI18n()
  const rows: [string, number, boolean?][] = [
    [t('schedule.principal'), item.principal],
    [t('schedule.interest'), item.interest],
    [t('schedule.total'), item.amount, true],
  ]
  return (
    <dl className="flex flex-col gap-1.5 rounded-control bg-surface px-3 py-2.5 text-sm">
      {rows.map(([label, value, strong]) => (
        <div key={label} className="flex items-baseline justify-between gap-3">
          <dt className="text-ink-muted">{label}</dt>
          <dd className={strong ? 'font-bold tabular-nums' : 'font-medium tabular-nums'}>
            {formatSum(Math.round(value))}
          </dd>
        </div>
      ))}
    </dl>
  )
}
