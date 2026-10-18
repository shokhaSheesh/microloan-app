import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { calendarNames } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import {
  formatPeriod,
  inPeriod,
  PERIOD_UNITS,
  periodDays,
  shiftPeriod,
  type Period,
} from '@/shared/lib/period'
import { CalendarSheet } from './CalendarSheet'
import { SegmentedTabs } from './SegmentedTabs'

type Props = {
  value: Period
  onChange: (value: Period) => void
}

const arrow =
  'grid size-11 shrink-0 place-items-center rounded-full border border-line bg-canvas text-brand active:bg-neutral-100 disabled:text-neutral-200'

/**
 * Chooses a day, week or month to report on: tabs for the kind of period, arrows to step
 * through periods, and the label opens the calendar to jump to one. The future is not offered.
 */
export function PeriodPicker({ value, onChange }: Props) {
  const { t, lang } = useI18n()
  const [open, setOpen] = useState(false)
  const [today] = useState(() => new Date())
  const isCurrent = inPeriod(today, value)
  const label = formatPeriod(value, calendarNames[lang].months)

  return (
    <div className="flex flex-col gap-3">
      <SegmentedTabs
        label={t('period.pick')}
        options={PERIOD_UNITS.map((unit) => ({ value: unit, label: t(`period.${unit}`) }))}
        value={value.unit}
        // Switching the kind of period keeps the same date in view
        onChange={(unit) => onChange({ unit, anchor: value.anchor })}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={t('period.prev')}
          onClick={() => onChange(shiftPeriod(value, -1))}
          className={arrow}
        >
          <ChevronLeft size={22} />
        </button>
        <button
          type="button"
          aria-label={`${t('period.pick')}: ${label}`}
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
          className="flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-line bg-canvas px-4 font-semibold active:bg-neutral-100"
        >
          <CalendarDays size={18} className="shrink-0 text-brand" />
          <span className="truncate">
            {value.unit === 'day' && isCurrent ? `${t('period.today')}, ${label}` : label}
          </span>
        </button>
        <button
          type="button"
          aria-label={t('period.next')}
          disabled={isCurrent}
          onClick={() => onChange(shiftPeriod(value, 1))}
          className={arrow}
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {open && (
        <CalendarSheet
          title={t('period.pick')}
          pick={value.unit}
          value={value.unit === 'month' ? periodDays(value).first : value.anchor}
          max={today}
          onClose={() => setOpen(false)}
          onSelect={(anchor) => onChange({ unit: value.unit, anchor })}
        />
      )}
    </div>
  )
}
