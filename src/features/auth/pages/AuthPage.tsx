import {
  CalendarCheck,
  CircleUserRound,
  CreditCard,
  Glasses,
  IdCard,
  LoaderCircle,
  Smartphone,
  Sun,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { session, type Borrower } from '@/entities/session/session'
import { BRAND } from '@/shared/config/brand'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum } from '@/shared/lib/format'
import { isPassport } from '@/shared/lib/passport'
import { formatPhone, PHONE_DIGITS } from '@/shared/lib/phone'
import { BrandLogo, BrandMark } from '@/shared/ui/BrandMark'
import { Button } from '@/shared/ui/Button'
import { CameraView } from '@/shared/ui/CameraView'
import { Checkbox } from '@/shared/ui/Checkbox'
import { DatePicker } from '@/shared/ui/DatePicker'
import { FormScreen } from '@/shared/ui/FormScreen'
import { IconBadge } from '@/shared/ui/IconBadge'
import { InfoList, InfoRow } from '@/shared/ui/InfoList'
import { Interpolate } from '@/shared/ui/Interpolate'
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher'
import { OtpScreen } from '@/shared/ui/OtpScreen'
import { PassportField } from '@/shared/ui/PassportField'
import { PhoneField } from '@/shared/ui/PhoneField'
import { ScreenIntro } from '@/shared/ui/ScreenIntro'
import { checkDocument, sendCode, verifyCode, verifyFace } from '../api/mockAuth'
import { PinLock } from '../components/PinLock'

/**
 * welcome -> phone -> code -> id -> face -> checking -> found -> PIN   new borrower
 * welcome -> phone -> code -> PIN                                     already registered
 * lock -> home                                                        returning, PIN set here
 */
type Step = 'lock' | 'welcome' | 'phone' | 'code' | 'id' | 'face' | 'checking' | 'found'

const MIN_AGE = 18
const STEPS = 4
const ddmmyyyy = (date: Date) =>
  `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`

/** The one way in. There is no separate sign-up: the phone number decides. */
export function AuthPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(() => (session.hasPin() ? 'lock' : 'welcome'))
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [phone, setPhone] = useState('')
  const [passport, setPassport] = useState('')
  const [birthDate, setBirthDate] = useState<Date | null>(null)
  const [found, setFound] = useState<Borrower | null>(null)
  const [notMe, setNotMe] = useState(false)
  const [latestBirthDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear() - MIN_AGE, now.getMonth(), now.getDate())
  })

  const goTo = (next: Step) => {
    setSubmitted(false)
    setLoading(false)
    setStep(next)
  }
  const toPin = (borrower: Borrower) => {
    session.setBorrower(borrower)
    navigate(ROUTES.pinSetup, { replace: true })
  }

  const submitPhone = async () => {
    setSubmitted(true)
    if (phone.length < PHONE_DIGITS || !agreed) return
    setLoading(true)
    await sendCode(phone)
    goTo('code')
  }

  const submitId = async () => {
    setSubmitted(true)
    if (!isPassport(passport) || !birthDate) return
    setLoading(true)
    await checkDocument(passport, birthDate)
    goTo('face')
  }

  const capture = async () => {
    goTo('checking')
    setFound(await verifyFace(phone, passport, birthDate ? ddmmyyyy(birthDate) : ''))
    setNotMe(false)
    goTo('found')
  }

  if (step === 'lock')
    return (
      <PinLock
        onUnlock={() => navigate(ROUTES.home, { replace: true })}
        onSignIn={() => goTo('phone')}
      />
    )

  if (step === 'code')
    return (
      <OtpScreen
        subtitle={t('code.subtitle', { phone: formatPhone(phone) })}
        onBack={() => goTo('phone')}
        progress={{ step: 2, total: STEPS }}
        resend={() => sendCode(phone)}
        verify={async (code) => {
          const { borrower } = await verifyCode(phone, code)
          if (borrower) toPin(borrower)
          else goTo('id')
        }}
        onVerified={() => {}}
      />
    )

  if (step === 'id')
    return (
      <FormScreen
        onSubmit={() => void submitId()}
        onBack={() => goTo('phone')}
        progress={{ step: 3, total: STEPS }}
        footer={
          <Button type="submit" block loading={loading}>
            {t('common.continue')}
          </Button>
        }
      >
        <IconBadge icon={IdCard} />
        <ScreenIntro title={t('auth.id.title')} subtitle={t('auth.id.subtitle')} />
        <div className="flex flex-col gap-4">
          <PassportField
            label={t('field.passport')}
            value={passport}
            onChange={setPassport}
            hint={t('auth.id.hint')}
            error={
              submitted && !isPassport(passport)
                ? t(passport === '' ? 'error.required' : 'error.passport')
                : undefined
            }
          />
          <DatePicker
            label={t('field.birthDate')}
            value={birthDate}
            onChange={setBirthDate}
            max={latestBirthDate}
            hint={t('auth.id.age')}
            error={submitted && !birthDate ? t('error.required') : undefined}
          />
        </div>
      </FormScreen>
    )

  if (step === 'face')
    return (
      <FormScreen
        onSubmit={() => void capture()}
        onBack={() => goTo('id')}
        progress={{ step: 4, total: STEPS }}
        footer={
          <Button type="submit" block>
            {t('myid.capture')}
          </Button>
        }
      >
        <ScreenIntro title={t('myid.title')} subtitle={t('myid.subtitle')} />
        <CameraView guide="face" facing="user" unavailableText={t('myid.noCamera')} />
        <ul className="flex flex-col gap-2 text-sm text-ink-muted">
          {(
            [
              [Sun, 'myid.tip.light'],
              [Glasses, 'myid.tip.glasses'],
              [Smartphone, 'myid.tip.still'],
            ] as const
          ).map(([Icon, text]) => (
            <li key={text} className="flex items-center gap-2.5">
              <Icon size={18} className="shrink-0 text-brand" />
              {t(text)}
            </li>
          ))}
        </ul>
      </FormScreen>
    )

  if (step === 'checking')
    return (
      <FormScreen onSubmit={() => {}}>
        <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          <span className="relative grid size-24 place-items-center rounded-full bg-accent-200 text-brand">
            <CircleUserRound size={44} strokeWidth={1.6} />
            <LoaderCircle
              size={96}
              strokeWidth={1.2}
              className="absolute inset-0 animate-spin text-accent-500"
              aria-hidden
            />
          </span>
          <div role="status" className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold">{t('myid.checking')}</h1>
            <p className="text-ink-muted">{t('myid.checking.hint')}</p>
          </div>
        </div>
      </FormScreen>
    )

  if (step === 'found' && found)
    return (
      <FormScreen
        onSubmit={() => toPin(found)}
        onBack={() => goTo('face')}
        footer={
          <div className="flex flex-col gap-1">
            <Button variant="ghost" block onClick={() => setNotMe(true)}>
              {t('myid.found.no')}
            </Button>
            <Button type="submit" block>
              {t('myid.found.yes')}
            </Button>
          </div>
        }
      >
        <ScreenIntro title={t('myid.found.title')} subtitle={t('myid.found.subtitle')} />
        <InfoList>
          <InfoRow label={t('myid.name')} value={found.fullName} />
          <InfoRow label={t('myid.birth')} value={found.birthDate} />
          <InfoRow
            label={t('myid.document')}
            value={`${found.passport.slice(0, 2)} ${found.passport.slice(2)}`}
          />
          <InfoRow label={t('myid.address')} value={found.address} />
        </InfoList>
        {notMe && (
          <p role="alert" className="rounded-control bg-danger-soft px-4 py-3 text-sm text-danger">
            {t('myid.wrong')}
          </p>
        )}
      </FormScreen>
    )

  if (step === 'phone')
    return (
      <FormScreen
        onSubmit={() => void submitPhone()}
        onBack={() => goTo('welcome')}
        headerEnd={<LanguageSwitcher />}
        progress={{ step: 1, total: STEPS }}
        footer={
          <div className="flex flex-col gap-4">
            <Checkbox
              checked={agreed}
              onChange={setAgreed}
              error={submitted && !agreed ? t('auth.consent.required') : undefined}
              label={
                <span className="text-sm text-ink-muted">
                  <Interpolate
                    text={t('auth.consent')}
                    parts={{
                      offer: (
                        <span className="font-semibold text-brand underline underline-offset-2">
                          {t('auth.consent.offer')}
                        </span>
                      ),
                      privacy: (
                        <span className="font-semibold text-brand underline underline-offset-2">
                          {t('auth.consent.privacy')}
                        </span>
                      ),
                    }}
                  />
                </span>
              }
            />
            <Button type="submit" block loading={loading}>
              {t('auth.phone.send')}
            </Button>
          </div>
        }
      >
        <ScreenIntro title={t('auth.phone.title')} subtitle={t('auth.phone.subtitle')} />
        <PhoneField
          label={t('field.phone')}
          value={phone}
          onChange={setPhone}
          error={submitted && phone.length < PHONE_DIGITS ? t('auth.error.phone') : undefined}
        />
      </FormScreen>
    )

  return <Welcome onStart={() => goTo('phone')} />
}

/**
 * First open: the brand, the biggest loan on a dark card with the mark's bars, three plain
 * promises, and one button. The bars slide in once.
 */
function Welcome({ onStart }: { onStart: () => void }) {
  const { t } = useI18n()
  const points = [
    [Zap, 'welcome.point.online'],
    [CreditCard, 'welcome.point.card'],
    [CalendarCheck, 'welcome.point.pay'],
  ] as const

  return (
    <div className="flex h-full flex-col bg-page px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <header className="flex items-center justify-between gap-3">
        <BrandLogo />
        <LanguageSwitcher />
      </header>

      <div className="flex min-h-0 flex-1 flex-col justify-center gap-7 overflow-y-auto py-6">
        <section className="relative flex flex-col gap-4 overflow-hidden rounded-[28px] bg-tile p-6 text-on-tile">
          <BrandMark className="welcome-mark absolute top-6 right-6 h-9 w-auto" />
          <span className="text-sm font-medium opacity-70">{t('app.tagline')}</span>
          <ul className="flex flex-col gap-2.5">
            {BRAND.products.map((product) => (
              <li key={product.name} className="flex items-baseline justify-between gap-3">
                <span className="text-lg font-semibold">{product.name}</span>
                <span className="text-sm opacity-70 tabular-nums">
                  {t('welcome.upTo', { amount: formatSum(product.max, false) })}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] leading-tight font-bold text-balance">
            {t('welcome.title', { amount: formatSum(BRAND.maxAmount, false) })}
          </h1>
          <p className="text-ink-muted">{t('welcome.subtitle')}</p>
        </div>

        <ul className="flex flex-col gap-3">
          {points.map(([Icon, text]) => (
            <li key={text} className="flex items-center gap-3 font-medium">
              <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-canvas text-brand">
                <Icon size={20} />
              </span>
              {t(text)}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <Button block onClick={onStart}>
          {t('welcome.start')}
        </Button>
        <p className="text-center text-xs text-ink-subtle">{t('welcome.license')}</p>
      </div>
    </div>
  )
}
