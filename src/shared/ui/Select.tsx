import { ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { controlClass } from './control'
import { Field } from './Field'
import { OptionSheet, type Option } from './OptionSheet'

type Props<T extends string> = {
  label: string
  options: Option<T>[]
  value: T | null
  onChange: (value: T) => void
  placeholder?: string
  error?: string
  hint?: string
}

export function Select<T extends string>({
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
  hint,
}: Props<T>) {
  const { t } = useI18n()
  const id = useId()
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.value === value)

  return (
    <Field label={label} htmlFor={id} error={error} hint={hint}>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={controlClass(!!error)}
      >
        <span className={cn('min-w-0 flex-1 truncate', !selected && 'text-ink-subtle')}>
          {selected?.label ?? placeholder ?? t('common.select')}
        </span>
        <ChevronDown size={20} className="text-ink-subtle" />
      </button>
      <OptionSheet
        open={open}
        onClose={() => setOpen(false)}
        title={label}
        options={options}
        value={value}
        onChange={onChange}
      />
    </Field>
  )
}
