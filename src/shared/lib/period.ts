import { formatDate } from './format'

export const PERIOD_UNITS = ['day', 'week', 'month'] as const
export type PeriodUnit = (typeof PERIOD_UNITS)[number]

/** A day, a Monday-to-Sunday week, or a calendar month, identified by any date inside it. */
export type Period = { unit: PeriodUnit; anchor: Date }

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d: Date, days: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + days)

/** Monday of the week that contains the date. */
export const startOfWeek = (d: Date) => addDays(d, -((d.getDay() + 6) % 7))

/** First and last day of the period, both at midnight. */
export function periodDays({ unit, anchor }: Period) {
  if (unit === 'day') return { first: startOfDay(anchor), last: startOfDay(anchor) }
  if (unit === 'week') {
    const first = startOfWeek(anchor)
    return { first, last: addDays(first, 6) }
  }
  return {
    first: new Date(anchor.getFullYear(), anchor.getMonth(), 1),
    last: new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0),
  }
}

export function inPeriod(date: Date, period: Period) {
  const { first, last } = periodDays(period)
  return date >= first && date < addDays(last, 1)
}

/** The same kind of period, `steps` periods later (negative for earlier). */
export function shiftPeriod({ unit, anchor }: Period, steps: number): Period {
  if (unit === 'day') return { unit, anchor: addDays(anchor, steps) }
  if (unit === 'week') return { unit, anchor: addDays(anchor, steps * 7) }
  return { unit, anchor: new Date(anchor.getFullYear(), anchor.getMonth() + steps, 1) }
}

/** "12.10.2026", "06.10 – 12.10.2026" or "Oktabr 2026". */
export function formatPeriod(period: Period, monthNames: string[]) {
  const { first, last } = periodDays(period)
  if (period.unit === 'day') return formatDate(first)
  if (period.unit === 'week') return `${formatDate(first).slice(0, 5)} – ${formatDate(last)}`
  return `${monthNames[first.getMonth()]} ${first.getFullYear()}`
}
