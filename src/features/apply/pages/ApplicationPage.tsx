import {
  Banknote,
  Check,
  ChevronRight,
  CircleCheck,
  CircleX,
  CreditCard,
  FileText,
  LoaderCircle,
  Plus,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { setDraft, useDraft } from '@/entities/apply/draft'
import { cardText, useCards } from '@/entities/cards/cards'
import { AddCardSheet } from '@/features/cards/components/AddCardSheet'
import { addLoan, quote, rateFor, type Loan } from '@/entities/loans/loans'
import { useBorrower } from '@/entities/session/session'
import { BRAND } from '@/shared/config/brand'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { formatDate, formatSum } from '@/shared/lib/format'
import { formatPhone } from '@/shared/lib/phone'
import { Button } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'
import { FormScreen } from '@/shared/ui/FormScreen'
import { InfoList, InfoRow } from '@/shared/ui/InfoList'
import { NumberField } from '@/shared/ui/NumberField'
import { OtpScreen } from '@/shared/ui/OtpScreen'
import { ScreenIntro } from '@/shared/ui/ScreenIntro'
import { Select } from '@/shared/ui/Select'
import { TextField } from '@/shared/ui/TextField'
import { decide, payOut, sendSignCode, verifySignCode, type Decision } from '../api/mockApply'
import { ScheduleSheet } from '../components/ScheduleSheet'

type Step = 'details' | 'review' | 'decision' | 'contract' | 'sign' | 'payout' | 'done'
const PURPOSES = ['business', 'repair', 'education', 'health', 'family', 'other'] as const
type Purpose = (typeof PURPOSES)[number]
const PAY_DAY = 5
/** A unique number for the new loan, until the API issues one. */
const stamp = () => Date.now()
const CHECKS = ['myid', 'history', 'load'] as const

/**
 * Qarz olish after the calculator: the application (purpose, income, work, the card to receive
 * the money, consent to the credit check), the review, the decision (approved, a smaller
 * counter-offer, or declined), the contract, signing by SMS code, and the payout to the card.
 */
export function ApplicationPage() {
  const { t, tl } = useI18n()
  const navigate = useNavigate()
  const draft = useDraft()
  const borrower = useBorrower()
  const [step, setStep] = useState<Step>('details')
  const [submitted, setSubmitted] = useState(false)
  const [purpose, setPurpose] = useState<Purpose | null>(null)
  const [income, setIncome] = useState<number | null>(null)
  const [work, setWork] = useState('')
  // Picked from the linked cards; "Karta qoʻshish" links a new one and picks it
  const cards = useCards(borrower?.phone)
  const [cardId, setCardId] = useState<string | undefined>(cards[0]?.id)
  const [addingCard, setAddingCard] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [decision, setDecision] = useState<Decision | null>(null)
  const [read, setRead] = useState(false)
  const [schedule, setSchedule] = useState(false)
  const [checked, setChecked] = useState(0)
  const [today] = useState(() => new Date())
  const [leaving, setLeaving] = useState(false)

  // The review ticks its three checks off one by one while the decision is worked out
  useEffect(() => {
    if (step !== 'review') return
    const timers = CHECKS.map((_, i) => setTimeout(() => setChecked(i + 1), 1100 * (i + 1)))
    return () => timers.forEach(clearTimeout)
  }, [step])

  if (!draft || !borrower) return leaving ? null : <Navigate to={ROUTES.apply} replace />
  const product = BRAND.products.find((item) => item.id === draft.productId)!
  const rate = rateFor(product, draft.term)
  const amount = decision && decision.kind !== 'declined' ? decision.amount : draft.amount
  const { monthly, total, interest } = quote(amount, rate, draft.term)
  const picked = cards.find((item) => item.id === cardId)
  const card: Loan['card'] = picked
    ? { brand: picked.brand, last4: picked.last4 }
    : { brand: 'uzcard', last4: '' }
  const firstDue = new Date(today.getFullYear(), today.getMonth() + 1, PAY_DAY)

  const errors = {
    purpose: !purpose,
    income: !income,
    work: !work.trim(),
    card: !picked,
    agreed: !agreed,
  }
  const submit = async () => {
    setSubmitted(true)
    if (Object.values(errors).some(Boolean) || !income) return
    setChecked(0)
    setStep('review')
    setDecision(await decide(draft.amount, rate, draft.term, income))
    setStep('decision')
  }
  const pay = async () => {
    setStep('payout')
    await payOut()
    addLoan(borrower.phone, {
      id: `l${stamp()}`,
      number: `FB-${today.getFullYear()}-${String(stamp()).slice(-6)}`,
      productId: product.id,
      amount,
      rate,
      term: draft.term,
      issuedAt: today,
      payDay: PAY_DAY,
      card,
      paidCount: 0,
    })
    setStep('done')
  }
  const exit = () => {
    // Marked first, so clearing the draft does not bounce this screen back to the calculator
    setLeaving(true)
    navigate(ROUTES.home, { replace: true })
    setDraft(null)
  }

  const terms = (
    <InfoList>
      <InfoRow label={t('apply.product')} value={`${product.name} · ${tl(product.kind)}`} />
      <InfoRow label={t('apply.amount')} value={formatSum(amount)} />
      <InfoRow label={t('apply.term')} value={t('apply.months', { n: String(draft.term) })} />
      <InfoRow label={t('apply.rate')} value={t('apply.rate.value', { rate: String(rate) })} />
      <InfoRow label={t('apply.monthly')} value={formatSum(monthly)} />
      <InfoRow label={t('apply.interest')} value={formatSum(interest)} />
      <InfoRow label={t('apply.total')} value={formatSum(total)} />
    </InfoList>
  )

  if (step === 'review')
    return (
      <FormScreen onSubmit={() => {}}>
        <div className="flex flex-1 flex-col justify-center gap-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="relative grid size-24 place-items-center rounded-full bg-accent-200 text-brand">
              <FileText size={40} strokeWidth={1.6} />
              <LoaderCircle
                size={96}
                strokeWidth={1.2}
                className="absolute inset-0 animate-spin text-accent-500"
                aria-hidden
              />
            </span>
            <div role="status" className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-bold">{t('review.title')}</h1>
              <p className="text-ink-muted">{t('review.hint')}</p>
            </div>
          </div>
          <ul className="flex flex-col rounded-card border border-line bg-canvas px-4">
            {CHECKS.map((check, i) => (
              <li
                key={check}
                className="flex items-center gap-3 border-b border-line py-3.5 last:border-b-0"
              >
                {i < checked ? (
                  <span className="grid size-6 place-items-center rounded-full bg-success text-white">
                    <Check size={16} strokeWidth={3} />
                  </span>
                ) : (
                  <LoaderCircle size={24} className="animate-spin text-ink-subtle" />
                )}
                <span className={i < checked ? 'font-medium' : 'text-ink-muted'}>
                  {t(`review.${check}`)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </FormScreen>
    )

  if (step === 'decision' && decision)
    return decision.kind === 'declined' ? (
      <FormScreen
        onSubmit={exit}
        footer={
          <Button type="submit" block>
            {t('decision.home')}
          </Button>
        }
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="grid size-24 place-items-center rounded-full bg-danger-soft text-danger">
            <CircleX size={48} strokeWidth={1.6} />
          </span>
          <h1 className="text-2xl font-bold">{t('decision.declined')}</h1>
          <p className="text-ink-muted">{t('decision.declined.hint')}</p>
        </div>
      </FormScreen>
    ) : (
      <FormScreen
        onSubmit={() => setStep('contract')}
        footer={
          <div className="flex flex-col gap-1">
            <Button variant="ghost" block onClick={exit}>
              {t('decision.later')}
            </Button>
            <Button type="submit" block>
              {t('decision.toContract')}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-center gap-3 pt-4 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-success text-white">
            <CircleCheck size={42} strokeWidth={1.8} />
          </span>
          <h1 className="text-2xl font-bold">
            {t(decision.kind === 'approved' ? 'decision.approved' : 'decision.counter')}
          </h1>
          <p className="text-ink-muted">
            {decision.kind === 'approved'
              ? t('decision.approved.hint')
              : t('decision.counter.hint', { asked: formatSum(draft.amount) })}
          </p>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-[28px] bg-tile p-5 text-center text-on-tile">
          <span className="text-sm opacity-60">{t('decision.sum')}</span>
          <span className="text-[34px] leading-none font-bold tracking-tight tabular-nums">
            {formatSum(amount)}
          </span>
          <span className="text-sm opacity-70">
            {t('decision.perMonth', {
              months: String(draft.term),
              sum: formatSum(monthly),
            })}
          </span>
        </div>
        <p className="text-center text-sm text-ink-muted">{t('decision.valid')}</p>
      </FormScreen>
    )

  if (step === 'contract')
    return (
      <FormScreen
        onSubmit={() => {
          setSubmitted(true)
          if (!read) return
          void sendSignCode()
          setSubmitted(false)
          setStep('sign')
        }}
        onBack={() => setStep('decision')}
        footer={
          <div className="flex flex-col gap-4">
            <Checkbox
              checked={read}
              onChange={setRead}
              label={<span className="text-sm text-ink-muted">{t('contract.read')}</span>}
              error={submitted && !read ? t('contract.read.required') : undefined}
            />
            <Button type="submit" block>
              {t('contract.sign')}
            </Button>
          </div>
        }
      >
        <ScreenIntro title={t('contract.title')} subtitle={t('contract.subtitle')} />
        {terms}
        <InfoList>
          <InfoRow label={t('contract.borrower')} value={borrower.fullName} />
          <InfoRow
            label={t('contract.payDay')}
            value={t('contract.payDay.value', { day: String(PAY_DAY) })}
          />
          <InfoRow label={t('contract.first')} value={formatDate(firstDue)} />
          <InfoRow label={t('contract.card')} value={cardText(card)} />
        </InfoList>
        <div className="flex flex-col rounded-card border border-line bg-canvas">
          {(
            [
              ['contract.offer', () => {}],
              ['apply.schedule', () => setSchedule(true)],
            ] as const
          ).map(([label, onClick]) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className="flex items-center gap-3 border-b border-line px-4 py-3.5 text-left last:border-b-0 active:bg-neutral-100"
            >
              <FileText size={20} className="shrink-0 text-brand" />
              <span className="flex-1 font-medium">{t(label)}</span>
              <ChevronRight size={18} className="text-ink-subtle" />
            </button>
          ))}
        </div>
        <ScheduleSheet
          open={schedule}
          onClose={() => setSchedule(false)}
          amount={amount}
          rate={rate}
          term={draft.term}
        />
      </FormScreen>
    )

  if (step === 'sign')
    return (
      <OtpScreen
        subtitle={t('contract.code', { phone: formatPhone(borrower.phone) })}
        onBack={() => setStep('contract')}
        resend={sendSignCode}
        verify={verifySignCode}
        onVerified={pay}
      />
    )

  if (step === 'payout')
    return (
      <FormScreen onSubmit={() => {}}>
        <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          <span className="relative grid size-24 place-items-center rounded-full bg-accent-200 text-brand">
            <Banknote size={42} strokeWidth={1.6} />
            <LoaderCircle
              size={96}
              strokeWidth={1.2}
              className="absolute inset-0 animate-spin text-accent-500"
              aria-hidden
            />
          </span>
          <div role="status" className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold">{t('payout.title')}</h1>
            <p className="text-ink-muted">{t('payout.hint', { card: cardText(card) })}</p>
          </div>
        </div>
      </FormScreen>
    )

  if (step === 'done')
    return (
      <FormScreen
        onSubmit={exit}
        footer={
          <Button type="submit" block>
            {t('decision.home')}
          </Button>
        }
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          <span className="grid size-24 place-items-center rounded-full bg-success text-white">
            <Check size={48} strokeWidth={3} />
          </span>
          <div className="flex flex-col gap-1.5">
            <p className="font-semibold text-ink-muted">{t('done.money')}</p>
            <h1 className="text-[32px] leading-none font-bold tabular-nums">{formatSum(amount)}</h1>
            <p className="text-ink-muted">{cardText(card)}</p>
          </div>
          <p className="rounded-control border border-line bg-canvas px-4 py-3 text-sm">
            {t('done.firstPayment', { date: formatDate(firstDue), sum: formatSum(monthly) })}
          </p>
        </div>
      </FormScreen>
    )

  // details
  return (
    <FormScreen
      onSubmit={() => void submit()}
      onBack={() => navigate(ROUTES.apply)}
      footer={
        <div className="flex flex-col gap-4">
          <Checkbox
            checked={agreed}
            onChange={setAgreed}
            label={<span className="text-sm text-ink-muted">{t('details.consent')}</span>}
            error={submitted && errors.agreed ? t('details.consent.required') : undefined}
          />
          <Button type="submit" block>
            {t('details.send')}
          </Button>
        </div>
      }
    >
      <ScreenIntro title={t('details.title')} subtitle={t('details.subtitle')} />
      <button
        type="button"
        onClick={() => navigate(ROUTES.apply)}
        className="flex items-center gap-3 rounded-card border border-line bg-canvas p-4 text-left active:bg-neutral-100"
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-bold tabular-nums">
            {product.name} · {formatSum(draft.amount)}
          </span>
          <span className="text-sm text-ink-muted tabular-nums">
            {t('decision.perMonth', {
              months: String(draft.term),
              sum: formatSum(quote(draft.amount, rate, draft.term).monthly),
            })}
          </span>
        </div>
        <span className="text-sm font-semibold text-brand">{t('details.change')}</span>
      </button>

      <div className="flex flex-col gap-4">
        <Select
          label={t('details.purpose')}
          options={PURPOSES.map((value) => ({ value, label: t(`details.purpose.${value}`) }))}
          value={purpose}
          onChange={setPurpose}
          error={submitted && errors.purpose ? t('error.required') : undefined}
        />
        <NumberField
          label={t('details.income')}
          value={income}
          onChange={setIncome}
          suffix={t('common.currency')}
          hint={t('details.income.hint')}
          error={submitted && errors.income ? t('error.required') : undefined}
        />
        <TextField
          label={t('details.work')}
          placeholder={t('details.work.placeholder')}
          value={work}
          onChange={(e) => setWork(e.target.value)}
          error={submitted && errors.work ? t('error.required') : undefined}
        />
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-bold">{t('details.card')}</h2>
          <p className="text-sm text-ink-muted">{t('details.card.hint')}</p>
        </div>
        <div role="radiogroup" aria-label={t('details.card')} className="flex flex-col gap-2">
          {cards.map((item) => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={item.id === cardId}
              onClick={() => setCardId(item.id)}
              className={cn(
                'flex items-center gap-3 rounded-control border-[1.5px] bg-canvas p-3.5 text-left font-medium',
                item.id === cardId ? 'border-primary' : 'border-line',
              )}
            >
              <CreditCard size={20} className="text-brand" />
              <span className="flex-1 tabular-nums">{cardText(item)}</span>
              <span
                className={cn(
                  'grid size-5 place-items-center rounded-full border-2',
                  item.id === cardId ? 'border-primary' : 'border-neutral-400',
                )}
              >
                {item.id === cardId && <span className="size-2.5 rounded-full bg-primary" />}
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAddingCard(true)}
            className={cn(
              'flex items-center gap-3 rounded-control border-[1.5px] border-dashed bg-canvas p-3.5 text-left font-semibold text-brand',
              submitted && errors.card ? 'border-danger' : 'border-line',
            )}
          >
            <Plus size={20} />
            {t('cards.add')}
          </button>
          {submitted && errors.card && (
            <p className="text-sm text-danger">{t('details.card.required')}</p>
          )}
        </div>
      </section>
      {addingCard && (
        <AddCardSheet
          phone={borrower.phone}
          onClose={() => setAddingCard(false)}
          onAdded={(added) => setCardId(added.id)}
        />
      )}
    </FormScreen>
  )
}
