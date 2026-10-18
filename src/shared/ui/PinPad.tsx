import { Delete, Fingerprint, ScanFace } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'

type Props = {
  value: string
  onChange: (value: string) => void
  length: number
  /** Turns the dots red and shakes them, e.g. after a wrong PIN. */
  error?: boolean
  /** Shows the Face ID or fingerprint key at the bottom left. */
  onBiometric?: () => void
  /** Which key: a face (default) or a fingerprint. */
  biometric?: 'face' | 'finger'
}

const key =
  'grid size-20 place-items-center justify-self-center rounded-full text-[28px] transition-colors active:bg-neutral-100'
// Digits sit in an outlined circle; the Face ID and delete keys stand bare
const digit = `${key} border-[1.5px] border-line`

/**
 * Dots for the digits typed so far, and a number pad of outlined round keys. The Face ID key
 * (bottom left) appears only where it can be used: on the lock screen. Works with a keyboard too.
 */
export function PinPad({ value, onChange, length, error, onBiometric, biometric = 'face' }: Props) {
  const BiometricIcon = biometric === 'finger' ? Fingerprint : ScanFace
  const { t } = useI18n()
  // Keys can arrive faster than re-renders: track the latest value outside React state
  const latest = useRef(value)
  useEffect(() => {
    latest.current = value
  }, [value])
  const set = (next: string) => {
    latest.current = next
    onChange(next)
  }
  const press = (n: string) => {
    if (latest.current.length < length) set(latest.current + n)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) {
        if (latest.current.length < length) set(latest.current + e.key)
      } else if (e.key === 'Backspace') set(latest.current.slice(0, -1))
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  return (
    <div className="flex flex-col items-center gap-14">
      <div
        role="status"
        aria-label={t('pin.entered', { count: String(value.length), total: String(length) })}
        className={cn('flex gap-4', error && 'pin-shake')}
      >
        {Array.from({ length }, (_, i) => (
          <span
            key={i}
            className={cn(
              'size-3.5 rounded-full transition-colors',
              error ? 'bg-danger' : i < value.length ? 'bg-primary' : 'bg-neutral-100',
            )}
          />
        ))}
      </div>

      <div className="grid grid-cols-[repeat(3,5rem)] gap-x-7 gap-y-4">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
          <button key={n} type="button" onClick={() => press(n)} className={digit}>
            {n}
          </button>
        ))}
        {onBiometric ? (
          <button
            type="button"
            aria-label={t('pin.biometric')}
            onClick={onBiometric}
            className={cn(key, 'text-brand')}
          >
            <BiometricIcon size={32} />
          </button>
        ) : (
          <span />
        )}
        <button type="button" onClick={() => press('0')} className={digit}>
          0
        </button>
        <button
          type="button"
          aria-label={t('pin.delete')}
          onClick={() => set(latest.current.slice(0, -1))}
          className={cn(key, 'text-ink-muted')}
        >
          <Delete size={26} />
        </button>
      </div>
    </div>
  )
}
