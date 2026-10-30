import { CircleCheck, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { changePhone, isRegistered, sendCode, verifyCode } from '@/features/auth/api/mockAuth'
import { session, useBorrower } from '@/entities/session/session'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone, PHONE_DIGITS } from '@/shared/lib/phone'
import { Button } from '@/shared/ui/Button'
import { FormScreen } from '@/shared/ui/FormScreen'
import { IconBadge } from '@/shared/ui/IconBadge'
import { OtpScreen } from '@/shared/ui/OtpScreen'
import { ResultScreen } from '@/shared/ui/ResultScreen'
import { PhoneField } from '@/shared/ui/PhoneField'
import { ScreenIntro } from '@/shared/ui/ScreenIntro'

/**
 * A new phone number for the account: the new number, a code to the old number (the owner
 * agrees), then a code to the new one (it is really theirs). Both numbers get an SMS about the
 * change. Loans and cards stay, they belong to the person, not the number.
 */
export function ChangePhonePage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const borrower = useBorrower()
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'phone' | 'oldCode' | 'newCode' | 'done'>('phone')
  // Kept for the done screen: the borrower's phone is the new one by then
  const [oldPhone] = useState(() => borrower?.phone ?? '')
  if (!borrower) return null

  const error = !submitted
    ? undefined
    : phone.length < PHONE_DIGITS
      ? t('auth.error.phone')
      : phone === borrower.phone
        ? t('phone.error.same')
        : isRegistered(phone)
          ? t('phone.error.taken')
          : undefined

  const submit = async () => {
    setSubmitted(true)
    if (phone.length < PHONE_DIGITS || phone === borrower.phone || isRegistered(phone)) return
    setLoading(true)
    await sendCode(oldPhone)
    setLoading(false)
    setStep('oldCode')
  }

  if (step === 'oldCode')
    return (
      <OtpScreen
        key="old"
        subtitle={t('phone.code.old', { phone: formatPhone(oldPhone) })}
        blockKey={oldPhone}
        onBack={() => setStep('phone')}
        resend={() => sendCode(oldPhone)}
        verify={async (code) => {
          await verifyCode(oldPhone, code)
        }}
        onVerified={async () => {
          await sendCode(phone)
          setStep('newCode')
        }}
      />
    )

  if (step === 'newCode')
    return (
      <OtpScreen
        // Its own key, so the old number's screen (still loading) is not reused
        key="new"
        subtitle={t('phone.code.new', { phone: formatPhone(phone) })}
        blockKey={phone}
        onBack={() => setStep('phone')}
        resend={() => sendCode(phone)}
        verify={async (code) => {
          await verifyCode(phone, code)
        }}
        onVerified={async () => {
          await changePhone(oldPhone, phone)
          session.setBorrower({ ...borrower, phone })
          setStep('done')
        }}
      />
    )

  if (step === 'done')
    return (
      <ResultScreen
        tone="success"
        icon={CircleCheck}
        title={t('phone.changed')}
        text={t('phone.done.text', { phone: formatPhone(phone) })}
        note={t('phone.done.sms', { old: formatPhone(oldPhone), new: formatPhone(phone) })}
        primary={{ label: t('phone.done.ok'), onClick: () => navigate(-1) }}
      />
    )

  return (
    <FormScreen
      onSubmit={() => void submit()}
      onBack={() => navigate(-1)}
      footer={
        <Button type="submit" block loading={loading}>
          {t('auth.phone.send')}
        </Button>
      }
    >
      <IconBadge icon={Smartphone} />
      <ScreenIntro
        title={t('phone.title')}
        subtitle={t('phone.subtitle', { phone: formatPhone(borrower.phone) })}
      />
      <PhoneField
        label={t('phone.new')}
        value={phone}
        onChange={setPhone}
        autoFocus
        error={error}
      />
    </FormScreen>
  )
}
