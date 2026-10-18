import { useState } from 'react'
import { addCard, brandOf } from '@/entities/cards/cards'
import { useI18n } from '@/shared/i18n/useI18n'
import { toast } from '@/shared/lib/toast'
import { Button } from '@/shared/ui/Button'
import { CardExpiryField, CardNumberField } from '@/shared/ui/CardFields'
import { Sheet } from '@/shared/ui/Sheet'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Links a new Uzcard or Humo card: the number and its expiry. */
export function AddCardSheet({ phone, onClose }: { phone: string; onClose: () => void }) {
  const { t } = useI18n()
  const [number, setNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)

  const save = async () => {
    setSubmitted(true)
    if (number.length < 16 || expiry.length < 4) return
    setBusy(true)
    await delay(700)
    addCard(phone, { brand: brandOf(number), last4: number.slice(-4), expiry })
    toast(t('cards.added'))
    onClose()
  }

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
        <Button block loading={busy} onClick={() => void save()}>
          {t('cards.add.save')}
        </Button>
      </div>
    </Sheet>
  )
}
