import { MessageSquareText, ShieldAlert } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { CODE_BLOCK_MINUTES, CODE_LENGTH, RESEND_AFTER_SECONDS } from '@/shared/config/otp'
import { useI18n } from '@/shared/i18n/useI18n'
import { otpBlock } from '@/shared/lib/otpBlock'
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
  /** The number the code went to: three wrong codes block it for 15 minutes. */
  blockKey: string
  onBack: () => void
  headerEnd?: ReactNode
  progress?: { step: number; total: number }
  /** Sends a new code. The first code is sent before this screen opens. */
  resend: () => Promise<void>
  /** Must reject when the code is wrong. */
  verify: (code: string) => Promise<void>
  onVerified: () => void | Promise<void>
}

const secondsTo = (end: number | null) => (end ? Math.ceil((end - Date.now()) / 1000) : 0)
const formatTimer = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

/**
 * The SMS code step. Every place that asks for a code uses this screen. Codes are 6 letters and
 * digits; a new one can be asked for after 59 s. The third wrong code in a row blocks the number
 * for 15 minutes (the owner gets an SMS), and the screen counts the block down.
 */
export function OtpScreen({
  subtitle,
  blockKey,
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
  const [blockedFor, setBlockedFor] = useCountdown(secondsTo(otpBlock.until(blockKey)))

  const submit = async (value: string) => {
    if (value.length < CODE_LENGTH || loading) return
    setLoading(true)
    try {
      await verify(value)
    } catch {
      setCode('')
      setLoading(false)
      if (otpBlock.wrong(blockKey)) {
        setRejected(false)
        setSecondsLeft(0)
        setBlockedFor(secondsTo(otpBlock.until(blockKey)))
      } else setRejected(true)
      return
    }
    otpBlock.clear(blockKey)
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

  if (blockedFor > 0)
    return (
      <FormScreen
        onSubmit={onBack}
        onBack={onBack}
        footer={
          <Button type="submit" block variant="secondary">
            {t('common.back')}
          </Button>
        }
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-danger-soft text-danger">
            <ShieldAlert size={36} />
          </span>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-balance">{t('code.blocked.title')}</h1>
            <p className="text-ink-muted">
              {t('code.blocked.text', { minutes: String(CODE_BLOCK_MINUTES) })}
            </p>
          </div>
          <div role="timer" className="flex flex-col items-center gap-1">
            <span className="text-sm text-ink-muted">{t('code.blocked.timer')}</span>
            <span className="text-4xl font-bold tabular-nums">{formatTimer(blockedFor)}</span>
          </div>
        </div>
      </FormScreen>
    )

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
        error={rejected ? t('code.error.left', { n: String(otpBlock.left(blockKey)) }) : undefined}
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
