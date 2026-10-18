import { Check, Fingerprint, ScanFace } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { PIN_LENGTH, session, useBorrower, type Biometric } from '@/entities/session/session'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { ActionCard } from '@/shared/ui/ActionCard'
import { Button } from '@/shared/ui/Button'
import { PinPad } from '@/shared/ui/PinPad'
import { BiometricPrompt } from '../components/BiometricPrompt'

type Step = 'create' | 'confirm' | 'quick' | 'done'

/**
 * After MyID (or the code, for someone already registered): choose a PIN, type it again, pick
 * Face ID or the fingerprint for quick sign-in or skip it, and land on "Hisobingiz tayyor".
 */
export function PinSetupPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const borrower = useBorrower()
  const [step, setStep] = useState<Step>('create')
  const [first, setFirst] = useState('')
  const [pin, setPin] = useState('')
  const [mismatch, setMismatch] = useState(false)
  const [scanning, setScanning] = useState<Biometric | null>(null)

  const finishQuick = useCallback(() => {
    if (scanning) session.setBiometric(scanning)
    setScanning(null)
    setStep('done')
  }, [scanning])

  useEffect(() => {
    if (pin.length < PIN_LENGTH) return
    const timer = setTimeout(() => {
      if (step === 'create') {
        setFirst(pin)
        setPin('')
        setMismatch(false)
        setStep('confirm')
      } else if (pin === first) {
        session.setPin(pin)
        setStep('quick')
      } else {
        // Start over: the two did not match
        setMismatch(true)
        setPin('')
        setFirst('')
        setStep('create')
      }
    }, 150)
    return () => clearTimeout(timer)
    // Runs once per complete PIN
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin])

  // Only reachable after the phone and MyID steps
  if (!borrower) return <Navigate to={ROUTES.auth} replace />

  if (step === 'done')
    return (
      <div className="flex h-full flex-col bg-page px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          <span className="grid size-24 place-items-center rounded-full bg-success text-white">
            <Check size={48} strokeWidth={3} />
          </span>
          <div className="flex flex-col gap-1.5">
            <p className="font-semibold text-ink-muted">{t('done.title')}</p>
            <h1 className="text-2xl leading-tight font-bold text-balance">{borrower.fullName}</h1>
            <p className="text-ink-muted">{t('done.subtitle')}</p>
          </div>
        </div>
        <Button block onClick={() => navigate(ROUTES.home, { replace: true })}>
          {t('done.start')}
        </Button>
      </div>
    )

  if (step === 'quick')
    return (
      <div className="flex h-full flex-col bg-page px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-1 flex-col justify-center gap-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="grid size-24 place-items-center rounded-full bg-accent-200 text-brand">
              <ScanFace size={48} strokeWidth={1.6} />
            </span>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-bold">{t('quick.title')}</h1>
              <p className="text-ink-muted">{t('quick.subtitle')}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <ActionCard
              icon={ScanFace}
              title={t('quick.face')}
              description={t('quick.face.hint')}
              onClick={() => setScanning('face')}
            />
            <ActionCard
              icon={Fingerprint}
              title={t('quick.finger')}
              description={t('quick.finger.hint')}
              onClick={() => setScanning('finger')}
            />
          </div>
        </div>
        <Button variant="ghost" block onClick={() => setStep('done')}>
          {t('quick.later')}
        </Button>
        {scanning && (
          <BiometricPrompt
            kind={scanning}
            onSuccess={finishQuick}
            onCancel={() => setScanning(null)}
          />
        )}
      </div>
    )

  const isError = step === 'create' && mismatch
  return (
    <div className="flex h-full flex-col bg-page">
      <div className="h-[max(3rem,env(safe-area-inset-top))]" />
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h1 className="text-2xl font-bold">
            {t(step === 'create' ? 'pin.create.title' : 'pin.confirm.title')}
          </h1>
          <p className={isError ? 'text-danger' : 'text-ink-muted'}>
            {t(
              isError ? 'pin.mismatch' : step === 'create' ? 'pin.create.hint' : 'pin.confirm.hint',
            )}
          </p>
        </div>
        <PinPad value={pin} onChange={setPin} length={PIN_LENGTH} error={isError && pin === ''} />
      </div>
    </div>
  )
}
