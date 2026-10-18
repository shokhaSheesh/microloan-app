import { useId, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { Field } from './Field'

type Props = {
  label: string
  value: string
  onChange: (code: string) => void
  length?: number
  error?: string
  hint?: string
  disabled?: boolean
  autoFocus?: boolean
}

/** One-time code. A single real input sits invisibly over the boxes, so paste and SMS autofill work. */
export function OtpField({
  label,
  value,
  onChange,
  length = 6,
  error,
  hint,
  disabled,
  autoFocus,
}: Props) {
  const id = useId()
  const [focused, setFocused] = useState(false)
  const activeIndex = Math.min(value.length, length - 1)

  return (
    <Field label={label} htmlFor={id} error={error} hint={hint}>
      <div className="relative">
        <div aria-hidden className="flex gap-2">
          {Array.from({ length }, (_, i) => (
            <span
              key={i}
              className={cn(
                'grid h-14 min-w-0 flex-1 place-items-center rounded-control border-[1.5px] bg-canvas text-2xl font-semibold transition-colors',
                error
                  ? 'border-danger'
                  : focused && i === activeIndex
                    ? 'border-primary ring-3 ring-accent-200'
                    : 'border-line',
                disabled && 'opacity-45',
              )}
            >
              {value[i] ?? ''}
            </span>
          ))}
        </div>
        <input
          id={id}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus={autoFocus}
          disabled={disabled}
          maxLength={length}
          aria-invalid={!!error || undefined}
          className="absolute inset-0 size-full cursor-text opacity-0"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, length))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
    </Field>
  )
}
