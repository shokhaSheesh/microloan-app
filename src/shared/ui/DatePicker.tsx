import { CalendarDays } from 'lucide-react'
import { useId, useState } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatDate } from '@/shared/lib/format'
import { controlClass, inputClass } from './control'
import { Field } from './Field'
import { CalendarSheet } from './CalendarSheet'

type Props = {
  label: string
  value: Date | null
  /** `null` while the typed date is incomplete or not allowed. */
  onChange: (value: Date | null) => void
  min?: Date
  max?: Date
  error?: string
  hint?: string
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

/** "12101995" -> "12.10.1995" (works on partial input too) */
const maskDate = (digits: string) =>
  [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join('.')

/** Eight digits DDMMYYYY -> Date, or null when that day does not exist. */
function parseDate(digits: string) {
  const day = Number(digits.slice(0, 2))
  const month = Number(digits.slice(2, 4)) - 1
  const year = Number(digits.slice(4, 8))
  const date = new Date(year, month, day)
  const real = date.getFullYear() === year && date.getMonth() === month && date.getDate() === day
  return real ? date : null
}

/** A date can be typed as DD.MM.YYYY or picked from the calendar behind the icon. */
export function DatePicker({ label, value, onChange, min, max, error, hint }: Props) {
  const { t } = useI18n()
  const id = useId()
  const [text, setText] = useState(() => (value ? formatDate(value) : ''))
  const [typedInvalid, setTypedInvalid] = useState(false)
  const [open, setOpen] = useState(false)

  const minDay = min && startOfDay(min)
  const maxDay = max && startOfDay(max)
  const dayDisabled = (day: Date) =>
    (minDay !== undefined && day < minDay) || (maxDay !== undefined && day > maxDay)

  const handleTyping = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8)
    setText(maskDate(digits))
    const date = digits.length === 8 ? parseDate(digits) : null
    const allowed = date !== null && !dayDisabled(date)
    setTypedInvalid(digits.length === 8 && !allowed)
    onChange(allowed ? date : null)
  }

  const shownError = error ?? (typedInvalid ? t('error.date') : undefined)

  return (
    <Field label={label} htmlFor={id} error={shownError} hint={hint}>
      <div className={controlClass(!!shownError)}>
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          placeholder="KK.OO.YYYY"
          aria-invalid={!!shownError || undefined}
          className={inputClass}
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
        />
        <button
          type="button"
          aria-label={t('calendar.open')}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="-mr-2 grid size-10 shrink-0 place-items-center rounded-full text-brand active:bg-neutral-100"
        >
          <CalendarDays size={20} />
        </button>
      </div>

      {open && (
        <CalendarSheet
          title={label}
          value={value}
          min={min}
          max={max}
          onClose={() => setOpen(false)}
          onSelect={(day) => {
            setText(formatDate(day))
            setTypedInvalid(false)
            onChange(day)
          }}
        />
      )}
    </Field>
  )
}
