import { CalendarDays } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { formatDate } from '@/shared/lib/format'
import { Button } from './Button'
import { DatePicker } from './DatePicker'
import { Sheet } from './Sheet'

export type DateRange = { from: Date | null; to: Date | null }

type Props = {
  /** Chip text while no range is set, e.g. "Sana". */
  label: string
  value: DateRange
  onChange: (value: DateRange) => void
}

/** A filter chip that opens a sheet for picking a from and to date. Goes first in FilterChips. */
export function DateRangeChip({ label, value, onChange }: Props) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState<Date | null>(null)
  const [to, setTo] = useState<Date | null>(null)

  const active = value.from !== null || value.to !== null
  const invalid = from !== null && to !== null && from > to
  const text = active
    ? [value.from ? formatDate(value.from) : '…', value.to ? formatDate(value.to) : '…'].join(' – ')
    : label

  const openSheet = () => {
    setFrom(value.from)
    setTo(value.to)
    setOpen(true)
  }

  const apply = (e: FormEvent) => {
    e.preventDefault()
    if (invalid) return
    onChange({ from, to })
    setOpen(false)
  }

  const clear = () => {
    onChange({ from: null, to: null })
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={openSheet}
        className={cn(
          'flex h-10 shrink-0 items-center gap-1.5 rounded-full pr-4 pl-3 text-sm font-semibold whitespace-nowrap transition-colors',
          active
            ? 'bg-primary text-on-primary'
            : 'border border-line bg-canvas text-brand active:bg-neutral-100',
        )}
      >
        <CalendarDays size={18} />
        {text}
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title={t('dateRange.title')}>
        <form onSubmit={apply} noValidate className="flex flex-col gap-4 pt-1 pb-1">
          <DatePicker label={t('dateRange.from')} value={from} onChange={setFrom} />
          <DatePicker
            label={t('dateRange.to')}
            value={to}
            onChange={setTo}
            error={invalid ? t('error.dateRange') : undefined}
          />
          <div className="mt-2 flex flex-col gap-1">
            <Button variant="ghost" block onClick={clear}>
              {t('common.clear')}
            </Button>
            <Button type="submit" block>
              {t('common.apply')}
            </Button>
          </div>
        </form>
      </Sheet>
    </>
  )
}
