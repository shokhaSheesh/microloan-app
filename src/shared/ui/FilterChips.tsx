import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type Props<T extends string> = {
  /** Read by screen readers. */
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  /** Extra chip shown first, e.g. a date range. */
  leading?: ReactNode
}

/** One-tap list filter. Scrolls sideways when the chips do not fit. */
export function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
  leading,
}: Props<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="-mx-5 flex scroll-px-5 gap-2 overflow-x-auto px-5"
    >
      {leading}
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'h-10 shrink-0 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors',
              selected
                ? 'bg-primary text-on-primary'
                : 'border border-line bg-canvas text-brand active:bg-neutral-100',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
