import { LogOut } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { PIN_ATTEMPTS, PIN_LENGTH, session, useBorrower } from '@/entities/session/session'
import { useI18n } from '@/shared/i18n/useI18n'
import { BrandMark } from '@/shared/ui/BrandMark'
import { PinPad } from '@/shared/ui/PinPad'
import { BiometricPrompt } from './BiometricPrompt'

type Props = {
  onUnlock: () => void
  /** Forgot the PIN or ran out of tries: sign in by phone again. */
  onSignIn: () => void
}

/** What a returning borrower sees when the app opens: Face ID or fingerprint if on, else the PIN. */
export function PinLock({ onUnlock, onSignIn }: Props) {
  const { t } = useI18n()
  const borrower = useBorrower()
  const biometric = session.biometric()
  const [pin, setPin] = useState('')
  const [wrong, setWrong] = useState(false)
  const [attemptsLeft, setAttemptsLeft] = useState(PIN_ATTEMPTS)
  const [scanning, setScanning] = useState(biometric !== null)
  const stopScanning = useCallback(() => setScanning(false), [])

  useEffect(() => {
    if (pin.length < PIN_LENGTH) return
    if (session.checkPin(pin)) {
      onUnlock()
      return
    }
    const left = attemptsLeft - 1
    setWrong(true)
    setAttemptsLeft(left)
    const timer = setTimeout(() => {
      setPin('')
      setWrong(false)
      if (left === 0) {
        session.signOut()
        onSignIn()
      }
    }, 500)
    return () => clearTimeout(timer)
    // Runs once per complete PIN
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin])

  const signIn = () => {
    session.signOut()
    onSignIn()
  }

  return (
    <div className="flex h-full flex-col bg-page px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <header className="flex h-11 shrink-0 items-center justify-between">
        <button
          type="button"
          aria-label={t('pin.otherAccount')}
          title={t('pin.otherAccount')}
          onClick={signIn}
          className="-ml-2 grid size-11 place-items-center rounded-full text-ink-muted active:bg-neutral-100"
        >
          <LogOut size={24} />
        </button>
        <button
          type="button"
          onClick={signIn}
          className="-mr-2 h-11 rounded-full px-2 font-semibold text-brand active:bg-neutral-100"
        >
          {t('pin.forgot')}
        </button>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <BrandMark className="h-12 w-auto" />
        <div className="flex flex-col items-center gap-1 text-center">
          {borrower && (
            <p className="text-xl font-bold">{t('home.greeting', { name: borrower.firstName })}</p>
          )}
          <p className={wrong || attemptsLeft < PIN_ATTEMPTS ? 'text-danger' : 'text-ink-muted'}>
            {attemptsLeft < PIN_ATTEMPTS
              ? t('pin.wrong', { count: String(attemptsLeft) })
              : t('pin.enter')}
          </p>
        </div>
        <PinPad
          value={pin}
          onChange={setPin}
          length={PIN_LENGTH}
          error={wrong}
          biometric={biometric ?? undefined}
          onBiometric={biometric ? () => setScanning(true) : undefined}
        />
      </div>

      {scanning && biometric && (
        <BiometricPrompt kind={biometric} onSuccess={onUnlock} onCancel={stopScanning} />
      )}
    </div>
  )
}
