import { Check, Fingerprint, ScanFace } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Biometric } from '@/entities/session/session'
import { OVERLAY_ROOT_ID } from '@/shared/config/overlay'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'

type Props = { kind: Biometric; onSuccess: () => void; onCancel: () => void }

/**
 * Stands in for the phone's own Face ID or fingerprint prompt: a scan, then a tick. The real
 * app calls the system prompt and gets only yes or no.
 */
export function BiometricPrompt({ kind, onSuccess, onCancel }: Props) {
  const { t } = useI18n()
  const [done, setDone] = useState(false)
  const Icon = kind === 'finger' ? Fingerprint : ScanFace

  useEffect(() => {
    const scan = setTimeout(() => setDone(true), 1100)
    const finish = setTimeout(onSuccess, 1600)
    return () => {
      clearTimeout(scan)
      clearTimeout(finish)
    }
  }, [onSuccess])

  const root = document.getElementById(OVERLAY_ROOT_ID)
  if (!root) return null
  return createPortal(
    <div className="absolute inset-0 z-50 grid place-items-center bg-neutral-950/45 px-10">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t(kind === 'finger' ? 'quick.finger.prompt' : 'quick.face.prompt')}
        className="sheet-panel flex w-full max-w-60 flex-col items-center gap-3 rounded-[28px] bg-canvas px-6 pt-7 pb-3 text-center"
      >
        <span
          className={cn(
            'grid size-20 place-items-center rounded-full transition-colors',
            done ? 'bg-success text-white' : 'animate-pulse bg-accent-200 text-brand',
          )}
        >
          {done ? <Check size={40} strokeWidth={3} /> : <Icon size={42} />}
        </span>
        <p className="font-semibold">
          {t(kind === 'finger' ? 'quick.finger.prompt' : 'quick.face.prompt')}
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="h-11 w-full rounded-full text-sm font-semibold text-brand active:bg-neutral-100"
        >
          {t('common.cancel')}
        </button>
      </div>
    </div>,
    root,
  )
}
