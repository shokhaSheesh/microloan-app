import { MessageSquareText } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { CODE_LENGTH, RESEND_AFTER_SECONDS } from '@/shared/config/otp'
import { useI18n } from '@/shared/i18n/useI18n'
import { useCountdown } from '@/shared/lib/useCountdown'
import { Button } from './Button'
import { FormScreen } from './FormScreen'
import { IconBadge } from './IconBadge'
import { OtpField } from './OtpField'
import { ResendCode } from './ResendCode'
import { ScreenIntro } from './ScreenIntro'

type Props = {
  /** Says where the code was sent. */
  subtitle: string
  onBack: () => void
  headerEnd?: ReactNode
  progress?: { step: number; total: number }
  /** Sends a new code. The first code is sent before this screen opens. */
  resend: () => Promise<void>
  /** Must reject when the code is wrong. */
  verify: (code: string) => Promise<void>
  onVerified: () => void | Promise<void>
}

/** The SMS code step. Every place that asks for a code uses this screen. */
export function OtpScreen({
  subtitle,
  onBack,
  headerEnd,
  progress,
  resend,
  verify,
  onVerified,
}: Props) {
  const { t } = useI18n()
  const [code, setCode] = useState('')
  const [rejected, setRejected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [secondsLeft, setSecondsLeft] = useCountdown(RESEND_AFTER_SECONDS)

  const submit = async (value: string) => {
    if (value.length < CODE_LENGTH || loading) return
    setLoading(true)
    try {
      await verify(value)
    } catch {
      setRejected(true)
      setCode('')
      setLoading(false)
      return
    }
    await onVerified()
  }

  const handleResend = async () => {
    setLoading(true)
    await resend()
    setLoading(false)
    setCode('')
    setRejected(false)
    setSecondsLeft(RESEND_AFTER_SECONDS)
  }

  return (
    <FormScreen
      onSubmit={() => void submit(code)}
      onBack={onBack}
      headerEnd={headerEnd}
      progress={progress}
      footer={
        <Button type="submit" block loading={loading} disabled={code.length < CODE_LENGTH}>
          {t('code.submit')}
        </Button>
      }
    >
      <IconBadge icon={MessageSquareText} />
      <ScreenIntro title={t('code.title')} subtitle={subtitle} />
      <OtpField
        label={t('field.code')}
        length={CODE_LENGTH}
        value={code}
        autoFocus
        disabled={loading}
        error={rejected ? t('code.error') : undefined}
        onChange={(value) => {
          setCode(value)
          setRejected(false)
          void submit(value)
        }}
      />
      <ResendCode
        secondsLeft={secondsLeft}
        disabled={loading}
        onResend={() => void handleResend()}
      />
    </FormScreen>
  )
}
