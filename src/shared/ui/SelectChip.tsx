import { ChevronDown, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { OptionSheet } from './OptionSheet'

type Props = {
  icon: LucideIcon
  /** Sheet title, e.g. "Filial". */
  title: string
  /** Chip text and first option while nothing is chosen, e.g. "Barcha filiallar". */
  allLabel: string
  options: { value: string; label: string }[]
  /** The chosen option, or null for all. */
  value: string | null
  onChange: (value: string | null) => void
}

const ALL = '__all__'

/** A filter chip that picks one of a list, or all of it. Sits in a row with the other chips. */
export function SelectChip({ icon: Icon, title, allLabel, options, value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const current = options.find((option) => option.value === value)

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={cn(
          'flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold whitespace-nowrap transition-colors',
          current
            ? 'bg-primary text-on-primary'
            : 'border border-line bg-canvas text-brand active:bg-neutral-100',
        )}
      >
        <Icon size={18} />
        {current?.label ?? allLabel}
        <ChevronDown size={16} />
      </button>
      <OptionSheet
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        options={[{ value: ALL, label: allLabel }, ...options]}
        value={value ?? ALL}
        onChange={(next) => onChange(next === ALL ? null : next)}
      />
    </>
  )
}
