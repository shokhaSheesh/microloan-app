import { useState } from 'react'
import { addCard, brandOf, cardText, type Card } from '@/entities/cards/cards'
import { CODE_LENGTH, RESEND_AFTER_SECONDS } from '@/shared/config/otp'
import { useI18n } from '@/shared/i18n/useI18n'
import { toast } from '@/shared/lib/toast'
import { useCountdown } from '@/shared/lib/useCountdown'
import { Button } from '@/shared/ui/Button'
import { CardExpiryField, CardNumberField } from '@/shared/ui/CardFields'
import { OtpField } from '@/shared/ui/OtpField'
import { ResendCode } from '@/shared/ui/ResendCode'
import { Sheet } from '@/shared/ui/Sheet'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
// Mock processing: "000000" is the wrong code, any other works
const WRONG_CODE = '000000'

/**
 * Links a new Uzcard or Humo card: the number and its expiry, then the SMS code the card's
 * processing sends to the phone the card is tied to. The card is saved only once the code fits.
 */
export function AddCardSheet({
  phone,
  onClose,
  onAdded,
}: {
  phone: string
  onClose: () => void
  /** The card just linked, e.g. to pick it at once. */
  onAdded?: (card: Card) => void
}) {
  const { t } = useI18n()
  const [number, setNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState<'details' | 'code'>('details')
  const [code, setCode] = useState('')
  const [rejected, setRejected] = useState(false)
  const [secondsLeft, setSecondsLeft] = useCountdown()
  const card = { brand: brandOf(number), last4: number.slice(-4), expiry }

  const sendCode = async () => {
    setSubmitted(true)
    if (number.length < 16 || expiry.length < 4) return
    setBusy(true)
    await delay(700)
    setBusy(false)
    setCode('')
    setRejected(false)
    setSecondsLeft(RESEND_AFTER_SECONDS)
    setStep('code')
  }

  const confirm = async (value: string) => {
    if (value.length < CODE_LENGTH || busy) return
    setBusy(true)
    await delay(700)
    if (value === WRONG_CODE) {
      setRejected(true)
      setCode('')
      setBusy(false)
      return
    }
    const added = addCard(phone, card)
    onAdded?.(added)
    toast(t('cards.added'))
    onClose()
  }

  if (step === 'code')
    return (
      <Sheet open onClose={onClose} title={t('cards.code.title')}>
        <div className="flex flex-col gap-4 pb-2">
          <p className="text-sm text-ink-muted">{t('cards.code', { card: cardText(card) })}</p>
          <OtpField
            label={t('field.code')}
            length={CODE_LENGTH}
            value={code}
            autoFocus
            disabled={busy}
            error={rejected ? t('code.error') : undefined}
            onChange={(value) => {
              setCode(value)
              setRejected(false)
              void confirm(value)
            }}
          />
          <ResendCode secondsLeft={secondsLeft} disabled={busy} onResend={() => void sendCode()} />
          <Button
            block
            loading={busy}
            disabled={code.length < CODE_LENGTH}
            onClick={() => void confirm(code)}
          >
            {t('code.submit')}
          </Button>
          <Button variant="ghost" block disabled={busy} onClick={() => setStep('details')}>
            {t('common.back')}
          </Button>
        </div>
      </Sheet>
    )

  return (
    <Sheet open onClose={onClose} title={t('cards.add')}>
      <div className="flex flex-col gap-4 pb-2">
        <CardNumberField
          label={t('details.card.number')}
          value={number}
          onChange={setNumber}
          hint={t('cards.add.hint')}
          error={submitted && number.length < 16 ? t('error.required') : undefined}
        />
        <CardExpiryField
          label={t('details.card.expiry')}
          value={expiry}
          onChange={setExpiry}
          error={submitted && expiry.length < 4 ? t('error.required') : undefined}
        />
        <Button block loading={busy} onClick={() => void sendCode()}>
          {t('cards.add.save')}
        </Button>
      </div>
    </Sheet>
  )
}
