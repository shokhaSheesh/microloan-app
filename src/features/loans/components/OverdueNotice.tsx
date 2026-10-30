import { CircleAlert } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { overdueOf, type Loan } from '@/entities/loans/loans'
import { payPath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum } from '@/shared/lib/format'
import { Button } from '@/shared/ui/Button'

/** A late loan: the sum overdue, how many days, and «Toʻlash», which pays it in the app. */
export function OverdueNotice({ loan }: { loan: Loan }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [today] = useState(() => new Date())
  const overdue = overdueOf(loan, today)
  if (!overdue) return null
  return (
    <section className="flex flex-col gap-3 rounded-card border border-danger/30 bg-danger-soft p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-danger text-white">
          <CircleAlert size={22} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-sm font-semibold text-danger">
            {t('overdue.title', { days: String(overdue.days) })}
          </span>
          <span className="text-2xl font-bold tabular-nums">{formatSum(overdue.sum)}</span>
        </div>
      </div>
      <Button block onClick={() => navigate(payPath(loan.id))}>
        {t('overdue.pay')}
      </Button>
    </section>
  )
}
