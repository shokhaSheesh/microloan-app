import { Siren } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { PHONE_DIGITS } from '@/shared/lib/phone'
import { Button } from '@/shared/ui/Button'
import { ChoiceGrid } from '@/shared/ui/ChoiceGrid'
import { FormScreen } from '@/shared/ui/FormScreen'
import { IconBadge } from '@/shared/ui/IconBadge'
import { PhoneField } from '@/shared/ui/PhoneField'
import { ScreenIntro } from '@/shared/ui/ScreenIntro'
import { TextAreaField } from '@/shared/ui/TextAreaField'

const KINDS = ['call', 'message', 'loan', 'card'] as const
type Kind = (typeof KINDS)[number]

/** What the support chat receives from a fraud report. */
export type FraudReport = { kind: Kind; phone?: string; text: string }

/**
 * Profil → Firibgarlik haqida xabar berish: what happened (a call, a message, a loan taken in
 * my name, my card), the fraudster's number if known, and the story. It goes to Yordam chati
 * marked «Firibgarlik», where an operator picks it up.
 */
export function FraudReportPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [kind, setKind] = useState<Kind | null>(null)
  const [phone, setPhone] = useState('')
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const phoneBad = phone.length > 0 && phone.length < PHONE_DIGITS

  const submit = () => {
    setSubmitted(true)
    if (!kind || !text.trim() || phoneBad) return
    const report: FraudReport = { kind, phone: phone || undefined, text: text.trim() }
    navigate(ROUTES.chat, { replace: true, state: { fraud: report } })
  }

  return (
    <FormScreen
      onSubmit={submit}
      onBack={() => navigate(-1)}
      footer={
        <Button type="submit" block>
          {t('fraud.send')}
        </Button>
      }
    >
      <IconBadge icon={Siren} />
      <ScreenIntro title={t('fraud.report')} subtitle={t('fraud.report.hint')} />
      <ChoiceGrid
        label={t('fraud.kind')}
        columns={2}
        options={KINDS.map((value) => ({ value, label: t(`fraud.kind.${value}`) }))}
        value={kind}
        onChange={setKind}
        error={submitted && !kind ? t('error.required') : undefined}
      />
      <PhoneField
        label={t('fraud.phone')}
        value={phone}
        onChange={setPhone}
        hint={t('fraud.phone.hint')}
        error={submitted && phoneBad ? t('auth.error.phone') : undefined}
      />
      <TextAreaField
        label={t('fraud.text')}
        placeholder={t('fraud.text.placeholder')}
        value={text}
        onChange={(e) => setText(e.target.value)}
        error={submitted && !text.trim() ? t('error.required') : undefined}
      />
    </FormScreen>
  )
}
