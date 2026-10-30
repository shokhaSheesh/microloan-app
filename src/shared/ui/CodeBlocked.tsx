import { ShieldAlert } from 'lucide-react'
import { CODE_BLOCK_MINUTES } from '@/shared/config/otp'
import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from './Button'
import { FormScreen } from './FormScreen'

const formatTimer = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

/** Three wrong codes in a row: no codes to this number for 15 minutes, counted down. */
export function CodeBlocked({ seconds, onBack }: { seconds: number; onBack: () => void }) {
  const { t } = useI18n()
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
          <span className="text-4xl font-bold tabular-nums">{formatTimer(seconds)}</span>
        </div>
      </div>
    </FormScreen>
  )
}
