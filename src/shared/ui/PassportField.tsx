import { useId } from 'react'
import { controlClass, inputClass } from './control'
import { Field } from './Field'

type Props = {
  label: string
  /** Series and number without a space, e.g. "AB1234567". */
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: string
}

/** Uzbek passport or ID card: two letters, then seven digits. */
export function PassportField({ label, value, onChange, error, hint }: Props) {
  const id = useId()

  return (
    <Field label={label} htmlFor={id} error={error} hint={hint}>
      <div className={controlClass(!!error)}>
        <input
          id={id}
          autoComplete="off"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          placeholder="AA 0000000"
          aria-invalid={!!error || undefined}
          className={inputClass}
          value={value.length > 2 ? `${value.slice(0, 2)} ${value.slice(2)}` : value}
          onChange={(e) => {
            const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
            const series = raw.slice(0, 2).replace(/[^A-Z]/g, '')
            const number = series.length === 2 ? raw.slice(2).replace(/\D/g, '').slice(0, 7) : ''
            onChange(series + number)
          }}
        />
      </div>
    </Field>
  )
}
