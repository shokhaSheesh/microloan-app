import { Check, Circle } from 'lucide-react'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'

export const PASSWORD_RULES = [
  { key: 'length', test: (value: string) => value.length >= 8 },
  { key: 'letter', test: (value: string) => /[a-zA-Z]/.test(value) },
  { key: 'digit', test: (value: string) => /\d/.test(value) },
] as const

export const passwordOk = (value: string) => PASSWORD_RULES.every((rule) => rule.test(value))

/** The password rules under the fields, each ticking green once the password meets it. */
export function PasswordRules({ value }: { value: string }) {
  const { t } = useI18n()
  return (
    <ul className="flex flex-col gap-2" aria-live="polite">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(value)
        return (
          <li
            key={rule.key}
            className={cn(
              'flex items-center gap-2.5 text-sm transition-colors',
              met ? 'font-medium text-success' : 'text-ink-muted',
            )}
          >
            {met ? (
              <span className="grid size-5 place-items-center rounded-full bg-success text-on-primary">
                <Check size={13} strokeWidth={3} />
              </span>
            ) : (
              <Circle size={20} strokeWidth={1.6} className="text-ink-subtle" />
            )}
            {t(`password.rule.${rule.key}`)}
          </li>
        )
      })}
    </ul>
  )
}
