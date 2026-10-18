import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { calendarNames } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { startOfDay, startOfWeek } from '@/shared/lib/period'
import { Sheet } from './Sheet'

type Props = {
  title: string
  value: Date | null
  onSelect: (value: Date) => void
  onClose: () => void
  min?: Date
  max?: Date
  /** `week` marks the whole week of the chosen day; `month` stops at the month grid. */
  pick?: 'day' | 'week' | 'month'
}

type Mode = 'days' | 'years' | 'months'

const EARLIEST_YEAR = 1930
const navButton =
  'grid size-10 place-items-center rounded-full text-brand active:bg-neutral-100 disabled:text-neutral-200'
const cell = 'grid place-items-center rounded-control text-base disabled:text-neutral-200'
const cellSelected = 'bg-primary font-semibold text-on-primary'

/**
 * The app's one calendar, in a bottom sheet. Render it only while it should be open:
 * it starts on the chosen date each time it mounts.
 */
export function CalendarSheet({ title, value, onSelect, onClose, min, max, pick = 'day' }: Props) {
  const { t, lang } = useI18n()
  const { months, weekdays } = calendarNames[lang]
  const [today] = useState(() => new Date())
  const minDay = min && startOfDay(min)
  const maxDay = max && startOfDay(max)
  // Start on the chosen date, or the nearest allowed month to today
  const [view, setView] = useState(
    () => value ?? (maxDay && today > maxDay ? maxDay : minDay && today < minDay ? minDay : today),
  )
  const [mode, setMode] = useState<Mode>(pick === 'month' ? 'months' : 'days')

  const firstYear = minDay?.getFullYear() ?? EARLIEST_YEAR
  const lastYear = maxDay?.getFullYear() ?? today.getFullYear() + 10
  const year = view.getFullYear()
  const month = view.getMonth()
  const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const baseMode: Mode = pick === 'month' ? 'months' : 'days'

  const dayDisabled = (day: Date) =>
    (minDay !== undefined && day < minDay) || (maxDay !== undefined && day > maxDay)
  const monthDisabled = (y: number, m: number) =>
    (minDay !== undefined && new Date(y, m + 1, 0) < minDay) ||
    (maxDay !== undefined && new Date(y, m, 1) > maxDay)
  const daySelected = (day: Date) =>
    value !== null &&
    (pick === 'week'
      ? startOfWeek(day).getTime() === startOfWeek(value).getTime()
      : startOfDay(day).getTime() === startOfDay(value).getTime())

  const choose = (date: Date) => {
    onSelect(date)
    onClose()
  }

  return (
    <Sheet open onClose={onClose} title={title}>
      <div className="flex items-center justify-between pb-2">
        <button
          type="button"
          aria-label={t('calendar.prev')}
          disabled={mode !== 'days' || monthDisabled(year, month - 1)}
          onClick={() => setView(new Date(year, month - 1, 1))}
          className={navButton}
        >
          <ChevronLeft size={22} />
        </button>
        <button
          type="button"
          aria-label={t('calendar.pickYear')}
          aria-expanded={mode === 'years'}
          onClick={() => setMode(mode === 'years' ? baseMode : 'years')}
          className="flex h-10 items-center gap-1 rounded-full px-3 text-base font-semibold active:bg-neutral-100"
        >
          {mode === 'days' ? `${months[month]} ${year}` : year}
          <ChevronDown
            size={18}
            className={cn('text-ink-subtle transition-transform', mode === 'years' && 'rotate-180')}
          />
        </button>
        <button
          type="button"
          aria-label={t('calendar.next')}
          disabled={mode !== 'days' || monthDisabled(year, month + 1)}
          onClick={() => setView(new Date(year, month + 1, 1))}
          className={navButton}
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {mode === 'years' && (
        <div className="grid max-h-72 grid-cols-4 gap-1.5 overflow-y-auto pb-1">
          {Array.from({ length: lastYear - firstYear + 1 }, (_, i) => {
            const y = firstYear + i
            return (
              <button
                key={y}
                type="button"
                ref={y === year ? (el) => el?.scrollIntoView({ block: 'center' }) : undefined}
                onClick={() => {
                  setView(new Date(y, month, 1))
                  setMode('months')
                }}
                className={cn(cell, 'h-11', y === year ? cellSelected : 'active:bg-neutral-100')}
              >
                {y}
              </button>
            )
          })}
        </div>
      )}

      {mode === 'months' && (
        <div className="grid grid-cols-3 gap-1.5 pb-1">
          {months.map((name, m) => (
            <button
              key={name}
              type="button"
              disabled={monthDisabled(year, m)}
              onClick={() => {
                if (pick === 'month') return choose(new Date(year, m, 1))
                setView(new Date(year, m, 1))
                setMode('days')
              }}
              className={cn(cell, 'h-13', m === month ? cellSelected : 'active:bg-neutral-100')}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {mode === 'days' && (
        <div className="grid grid-cols-7 justify-items-center gap-y-1 pb-1">
          {weekdays.map((name) => (
            <span key={name} className="py-1 text-xs font-semibold text-ink-subtle uppercase">
              {name}
            </span>
          ))}
          {Array.from({ length: leadingBlanks }, (_, i) => (
            <span key={`blank-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = new Date(year, month, i + 1)
            const selected = daySelected(day)
            const isToday = startOfDay(day).getTime() === startOfDay(today).getTime()
            return (
              <button
                key={i}
                type="button"
                disabled={dayDisabled(day)}
                aria-pressed={selected}
                onClick={() => choose(day)}
                className={cn(
                  'grid size-11 place-items-center rounded-full text-base disabled:text-neutral-200',
                  selected
                    ? cellSelected
                    : isToday
                      ? 'font-semibold ring-[1.5px] ring-accent-500 ring-inset active:bg-neutral-100'
                      : 'active:bg-neutral-100',
                )}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
      )}
    </Sheet>
  )
}
