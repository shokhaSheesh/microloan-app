import type { LucideIcon } from 'lucide-react'
import { useId } from 'react'
import { cn } from '@/shared/lib/cn'

type Props = {
  icon?: LucideIcon
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

/** A setting that is on or off right away, as a row inside a `MenuList`. Use `Checkbox` in forms. */
export function SwitchRow({ icon: Icon, label, description, checked, onChange }: Props) {
  const id = useId()

  return (
    <li className="border-b border-line last:border-b-0">
      <div className="flex min-h-13 items-center gap-3 py-2">
        {Icon && <Icon size={22} className="shrink-0 text-brand" />}
        <label htmlFor={id} className="flex min-w-0 flex-1 cursor-pointer flex-col">
          <span className="font-medium">{label}</span>
          {description && <span className="text-sm text-ink-muted">{description}</span>}
        </label>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={cn(
            'relative h-7 w-12 shrink-0 rounded-full transition-colors',
            checked ? 'bg-primary' : 'bg-neutral-200',
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 size-6 rounded-full bg-canvas shadow-sm transition-transform',
              checked && 'translate-x-5',
            )}
          />
        </button>
      </div>
    </li>
  )
}
