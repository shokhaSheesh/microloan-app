import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from './Button'

type Props = {
  secondsLeft: number
  onResend: () => void
  disabled?: boolean
}

const formatTimer = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

/** Sits under every OtpField: a countdown, then a resend button. */
export function ResendCode({ secondsLeft, onResend, disabled }: Props) {
  const { t } = useI18n()

  if (secondsLeft > 0) {
    return (
      <p className="text-center text-sm text-ink-muted">
        {t('code.resendIn', { time: formatTimer(secondsLeft) })}
      </p>
    )
  }

  return (
    <Button variant="ghost" block disabled={disabled} onClick={onResend}>
      {t('code.resend')}
    </Button>
  )
}
