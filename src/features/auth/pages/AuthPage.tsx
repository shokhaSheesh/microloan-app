import {
  CalendarCheck,
  CircleUserRound,
  CreditCard,
  Glasses,
  Ban,
  Phone,
  IdCard,
  KeyRound,
  LoaderCircle,
  ShieldAlert,
  Smartphone,
  Sun,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { unlinkAll } from '@/entities/cards/cards'
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
import { Interpolate } from '@/shared/ui/Interpolate'
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher'
import { OtpScreen } from '@/shared/ui/OtpScreen'
import { PassportField } from '@/shared/ui/PassportField'
import { PasswordField } from '@/shared/ui/PasswordField'
import { PhoneField } from '@/shared/ui/PhoneField'
import { ResultScreen } from '@/shared/ui/ResultScreen'
import { ScreenIntro } from '@/shared/ui/ScreenIntro'
import { otpBlock } from '@/shared/lib/otpBlock'
import { toast } from '@/shared/lib/toast'
import {
  checkDocument,
  checkPassword,
  checkPhoneOwner,
  resetPassword,
  sendCode,
  setPassword as savePassword,
  verifyCode,
  verifyDeviceFace,
  verifyFace,
} from '../api/mockAuth'
import { PasswordRules, passwordOk } from '../components/PasswordRules'
import { PinLock } from '../components/PinLock'

/**
 * welcome -> phone -> code -> id -> face -> checking -> password -> PIN   new borrower
 *                                     checking -> notOwner (the number is someone else's)
 * phone -> blocked                                                      the brand blocked the client
 * phone -> code -> signIn -> home                                       registered, known phone
 * phone -> code -> signIn -> deviceFace -> deviceChecking -> cardsGone -> PIN
 *                                                                       registered, new phone
 *                                          deviceChecking -> deviceFailed (MyID said no)
 * signIn -> resetCode -> resetPassword -> home, or deviceFace on a new phone   forgot password
 * lock -> home                                                          returning, PIN set here
 */
type Step =
  | 'lock'
  | 'welcome'
  | 'phone'
  | 'code'
  | 'id'
  | 'face'
  | 'checking'
  | 'password'
  | 'signIn'
  | 'resetCode'
  | 'resetPassword'
  | 'deviceFace'
  | 'deviceChecking'
  | 'deviceFailed'
  | 'cardsGone'
  | 'blocked'
  | 'notOwner'

const MIN_AGE = 18
const STEPS = 5
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
  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [wrongPassword, setWrongPassword] = useState(false)
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
  const toHome = (borrower: Borrower) => {
    session.setBorrower(borrower)
    // This phone already has a PIN unless it was signed out; then it sets one first
    navigate(session.hasPin() ? ROUTES.home : ROUTES.pinSetup, { replace: true })
  }

  const submitPhone = async () => {
    setSubmitted(true)
    if (phone.length < PHONE_DIGITS || !agreed) return
    setLoading(true)
    // A number blocked for wrong codes gets no new one; the code screen counts the block down
    if (!otpBlock.until(phone)) {
      try {
        await sendCode(phone)
      } catch {
        goTo('blocked')
        return
      }
    }
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
    const person = await verifyFace(phone, passport, birthDate ? ddmmyyyy(birthDate) : '')
    // Only now is the PINFL known, so the number's owner is checked here
    try {
      await checkPhoneOwner(phone, person.passport)
    } catch {
      goTo('notOwner')
      return
    }
    setFound(person)
    setPassword('')
    setRepeat('')
    goTo('password')
  }

  const submitNewPassword = async () => {
    setSubmitted(true)
    if (!found || !passwordOk(password) || password !== repeat) return
    setLoading(true)
    await savePassword(phone, password)
    toPin(found)
  }

  const submitSignIn = async () => {
    setSubmitted(true)
    setWrongPassword(false)
    if (!found || !password) return
    setLoading(true)
    try {
      const { knownDevice } = await checkPassword(phone, password)
      if (knownDevice) toHome(found)
      else goTo('deviceFace')
    } catch {
      setWrongPassword(true)
      setLoading(false)
    }
  }

  const forgot = async () => {
    setLoading(true)
    await sendCode(phone)
    goTo('resetCode')
  }

  // A new password goes on like a correct one: a new phone still passes MyID
  const submitReset = async () => {
    setSubmitted(true)
    if (!found || !passwordOk(password) || password !== repeat) return
    setLoading(true)
    const { knownDevice } = await resetPassword(phone, password)
    toast(t('password.reset.done'))
    if (knownDevice) toHome(found)
    else goTo('deviceFace')
  }

  const captureDevice = async () => {
    if (!found) return
    goTo('deviceChecking')
    try {
      await verifyDeviceFace(phone)
      unlinkAll(found.passport)
      goTo('cardsGone')
    } catch {
      goTo('deviceFailed')
    }
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
        blockKey={phone}
        onBack={() => goTo('phone')}
        progress={{ step: 2, total: STEPS }}
        resend={() => sendCode(phone)}
        verify={async (code) => {
          const { borrower } = await verifyCode(phone, code)
          setPassword('')
          setWrongPassword(false)
          setFound(borrower)
          goTo(borrower ? 'signIn' : 'id')
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

  if (step === 'checking' || step === 'deviceChecking') return <Checking />

  if (step === 'password' || step === 'resetPassword') {
    const reset = step === 'resetPassword'
    return (
      <FormScreen
        onSubmit={() => void (reset ? submitReset() : submitNewPassword())}
        onBack={() => goTo(reset ? 'signIn' : 'face')}
        progress={reset ? undefined : { step: 5, total: STEPS }}
        footer={
          <Button type="submit" block loading={loading}>
            {t(reset ? 'password.reset.submit' : 'common.continue')}
          </Button>
        }
      >
        <IconBadge icon={KeyRound} />
        <ScreenIntro
          title={t(reset ? 'password.reset.title' : 'password.new.title')}
          subtitle={t(reset ? 'password.reset.subtitle' : 'password.new.subtitle', {
            name: found?.firstName ?? '',
          })}
        />
        <div className="flex flex-col gap-4">
          <PasswordField
            label={t('password.field')}
            autoComplete="new-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={submitted && !passwordOk(password) ? t('password.error.rules') : undefined}
          />
          <PasswordField
            label={t('password.repeat')}
            autoComplete="new-password"
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            error={
              submitted && repeat !== password
                ? t(repeat === '' ? 'error.required' : 'password.error.mismatch')
                : undefined
            }
          />
        </div>
        <PasswordRules value={password} />
      </FormScreen>
    )
  }

  if (step === 'signIn')
    return (
      <FormScreen
        onSubmit={() => void submitSignIn()}
        onBack={() => goTo('phone')}
        footer={
          <Button type="submit" block loading={loading}>
            {t('password.signIn.submit')}
          </Button>
        }
      >
        <IconBadge icon={KeyRound} />
        <ScreenIntro
          title={t('password.signIn.title', { name: found?.firstName ?? '' })}
          subtitle={t('password.signIn.subtitle', { phone: formatPhone(phone) })}
        />
        <PasswordField
          label={t('password.field')}
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setWrongPassword(false)
          }}
          error={
            submitted && !password
              ? t('error.required')
              : wrongPassword
                ? t('password.error.wrong')
                : undefined
          }
        />
        <button
          type="button"
          onClick={() => void forgot()}
          disabled={loading}
          className="-mx-1 self-start rounded-full px-1 py-0.5 text-sm font-semibold text-brand active:bg-neutral-100"
        >
          {t('password.forgot')}
        </button>
      </FormScreen>
    )

  if (step === 'resetCode')
    return (
      <OtpScreen
        subtitle={t('password.reset.code', { phone: formatPhone(phone) })}
        blockKey={phone}
        onBack={() => goTo('signIn')}
        resend={() => sendCode(phone)}
        verify={async (code) => {
          await verifyCode(phone, code)
          setPassword('')
          setRepeat('')
          goTo('resetPassword')
        }}
        onVerified={() => {}}
      />
    )

  if (step === 'deviceFace')
    return (
      <FormScreen
        onSubmit={() => void captureDevice()}
        onBack={() => goTo('signIn')}
        footer={
          <Button type="submit" block>
            {t('myid.capture')}
          </Button>
        }
      >
        <ScreenIntro title={t('device.title')} subtitle={t('device.subtitle')} />
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

  if (step === 'deviceFailed')
    return (
      <ResultScreen
        tone="danger"
        icon={ShieldAlert}
        title={t('device.failed.title')}
        text={t('device.failed.text')}
        primary={{ label: t('device.failed.retry'), onClick: () => goTo('deviceFace') }}
        secondary={{ label: t('device.failed.other'), onClick: () => goTo('phone') }}
      />
    )

  if (step === 'blocked')
    return (
      <ResultScreen
        tone="danger"
        icon={Ban}
        title={t('blocked.title')}
        text={t('blocked.text', { brand: BRAND.name })}
        primary={{
          label: t('blocked.call'),
          onClick: () => window.location.assign(`tel:+998${BRAND.phone}`),
        }}
        secondary={{ label: t('device.failed.other'), onClick: () => goTo('phone') }}
      />
    )

  if (step === 'notOwner')
    return (
      <ResultScreen
        tone="danger"
        icon={Phone}
        title={t('owner.title')}
        text={t('owner.text', { phone: formatPhone(phone) })}
        primary={{ label: t('device.failed.other'), onClick: () => goTo('phone') }}
      />
    )

  if (step === 'cardsGone' && found)
    return (
      <ResultScreen
        tone="warning"
        icon={CreditCard}
        title={t('device.cards.title')}
        text={t('device.cards.text')}
        primary={{ label: t('device.cards.next'), onClick: () => toPin(found) }}
      />
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

/** MyID at work: a spinning ring round the face icon. */
function Checking() {
  const { t } = useI18n()
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
