import { useId } from 'react'
import { CARD_DIGITS } from '@/shared/lib/card'
import { controlClass, inputClass } from './control'
import { Field } from './Field'

type Props = {
  label: string
  /** Digits only, without spaces or the slash. */
  value: string
  onChange: (digits: string) => void
  error?: string
  hint?: string
}

const groupBy4 = (digits: string) => digits.replace(/(\d{4})(?=\d)/g, '$1 ')

export function CardNumberField({ label, value, onChange, error, hint }: Props) {
  const id = useId()

  return (
    <Field label={label} htmlFor={id} error={error} hint={hint}>
      <div className={controlClass(!!error)}>
        <input
          id={id}
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="0000 0000 0000 0000"
          aria-invalid={!!error || undefined}
          className={inputClass}
          value={groupBy4(value)}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, CARD_DIGITS))}
        />
      </div>
    </Field>
  )
}

/** Expiry as MM/YY. `value` is the four digits. */
export function CardExpiryField({ label, value, onChange, error, hint }: Props) {
  const id = useId()

  return (
    <Field label={label} htmlFor={id} error={error} hint={hint}>
      <div className={controlClass(!!error)}>
        <input
          id={id}
          inputMode="numeric"
          autoComplete="cc-exp"
          placeholder="OO/YY"
          aria-invalid={!!error || undefined}
          className={inputClass}
          value={value.length > 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
        />
      </div>
    </Field>
  )
}
