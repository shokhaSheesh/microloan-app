import type { TranslationKey } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from './Button'
import { ErrorIllustration } from './ErrorIllustration'
import type { ErrorKind } from './errorKinds'

type Props = {
  kind: ErrorKind
  /** What the button does: retry the request, sign in again, go home or go back. */
  onAction: () => void
}

/**
 * A screen that could not be shown, and what to do about it. One layout for every kind:
 * its picture, a title, one sentence, and one button.
 */
export function ErrorState({ kind, onAction }: Props) {
  const { t } = useI18n()
  const key = (part: 'title' | 'hint' | 'action') => `errorState.${kind}.${part}` as TranslationKey

  return (
    <div
      role="alert"
      className="flex flex-1 flex-col items-center justify-center gap-3 px-8 py-10 text-center"
    >
      <ErrorIllustration kind={kind} className="w-52 max-w-full" />
      <div className="flex flex-col gap-1.5">
        <p className="text-xl font-bold">{t(key('title'))}</p>
        <p className="text-ink-muted">{t(key('hint'))}</p>
      </div>
      <Button onClick={onAction} className="min-w-44">
        {t(key('action'))}
      </Button>
    </div>
  )
}
