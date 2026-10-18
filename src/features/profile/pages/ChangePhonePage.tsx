import { Smartphone } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { changePhone, isRegistered, sendCode, verifyCode } from '@/features/auth/api/mockAuth'
import { session, useBorrower } from '@/entities/session/session'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone, PHONE_DIGITS } from '@/shared/lib/phone'
import { toast } from '@/shared/lib/toast'
import { Button } from '@/shared/ui/Button'
import { FormScreen } from '@/shared/ui/FormScreen'
import { IconBadge } from '@/shared/ui/IconBadge'
import { OtpScreen } from '@/shared/ui/OtpScreen'
import { PhoneField } from '@/shared/ui/PhoneField'
import { ScreenIntro } from '@/shared/ui/ScreenIntro'

/**
 * A new phone number for the account: the number, then the SMS code sent to it. Loans and
 * cards stay, they belong to the person, not the number.
 */
export function ChangePhonePage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const borrower = useBorrower()
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'phone' | 'code'>('phone')
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
    await sendCode(phone)
    setLoading(false)
    setStep('code')
  }

  if (step === 'code')
    return (
      <OtpScreen
        subtitle={t('code.subtitle', { phone: formatPhone(phone) })}
        onBack={() => setStep('phone')}
        resend={() => sendCode(phone)}
        verify={async (code) => {
          await verifyCode(phone, code)
        }}
        onVerified={async () => {
          await changePhone(borrower.phone, phone)
          session.setBorrower({ ...borrower, phone })
          toast(t('phone.changed'))
          navigate(-1)
        }}
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
