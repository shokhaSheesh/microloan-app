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
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import {
  addAriza,
  arizaNumber,
  arizalarOf,
  isOffer,
  OFFER_DAYS,
  updateAriza,
} from '@/entities/applications/applications'
import { setDraft, useDraft, type Draft } from '@/entities/apply/draft'
import { useContacts } from '@/entities/contacts/contacts'
import { ContactSheet } from '@/features/contacts/components/ContactSheet'
import { cardText, useCards } from '@/entities/cards/cards'
import { AddCardSheet } from '@/features/cards/components/AddCardSheet'
import { addLoan, DEFAULT_PAY_DAY, quote, rateFor, type Loan } from '@/entities/loans/loans'
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
import { TextField } from '@/shared/ui/TextField'
import { decide, payOut, sendSignCode, verifySignCode, type Decision } from '../api/mockApply'
import { RefuseSheet } from '../components/RefuseSheet'
import { ScheduleSheet } from '../components/ScheduleSheet'

type Step = 'details' | 'review' | 'decision' | 'contract' | 'sign' | 'payout' | 'done'
/** Contacts every ariza must name, so the brand can reach someone. */
const MIN_CONTACTS = 2
/** A unique number for the new loan, until the API issues one. */
const stamp = () => Date.now()
const CHECKS = ['myid', 'history', 'load'] as const

/**
 * Qarz olish after the calculator: the application (income, work, at least two contacts, the card to receive
 * the money, consent to the credit check), the review, the decision (approved, a smaller
 * counter-offer, or declined), the contract, signing by SMS code, and the payout to the card.
 * Every step is kept on the ariza, which Qarzlarim → Arizalar lists. An offer left with
 * "Keyinroq" is opened again from there (`?ariza=<id>`), straight at the decision.
 */
export function ApplicationPage() {
  const { t, tl } = useI18n()
  const navigate = useNavigate()
  const borrower = useBorrower()
  const [params] = useSearchParams()
  // An offer opened again from Arizalar: its own sum and term stand in for the draft
  const [resumed] = useState(() => {
    const found = arizalarOf(borrower?.passport).find((item) => item.id === params.get('ariza'))
    return found && isOffer(found.status) && found.offered ? found : undefined
  })
  const saved = useDraft()
  const draft: Draft | null = resumed
    ? {
        productId: resumed.productId,
        amount: resumed.amount,
        term: resumed.term,
        payDay: resumed.payDay ?? DEFAULT_PAY_DAY,
        payType: resumed.payType ?? 'annuity',
      }
    : saved
  const [arizaId, setArizaId] = useState<string | undefined>(resumed?.id)
  const [step, setStep] = useState<Step>(resumed ? 'decision' : 'details')
  const [submitted, setSubmitted] = useState(false)
  const contacts = useContacts(borrower?.passport)
  const [contactIds, setContactIds] = useState<string[]>([])
  const [addingContact, setAddingContact] = useState(false)
  const [refusing, setRefusing] = useState(false)
  const [income, setIncome] = useState<number | null>(null)
  const [work, setWork] = useState('')
  // Picked from the linked cards; "Karta qoʻshish" links a new one and picks it
  const cards = useCards(borrower?.passport)
  const [cardId, setCardId] = useState<string | undefined>(cards[0]?.id)
  const [addingCard, setAddingCard] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [decision, setDecision] = useState<Decision | null>(
    resumed ? { kind: resumed.status as 'approved' | 'counter', amount: resumed.offered! } : null,
  )
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
  const { monthly, total, interest } = quote(amount, rate, draft.term, draft.payType)
  const picked = cards.find((item) => item.id === cardId)
  const card: Loan['card'] = picked
    ? { brand: picked.brand, last4: picked.last4 }
    : { brand: 'uzcard', last4: '' }
  const firstDue = new Date(today.getFullYear(), today.getMonth() + 1, draft.payDay)

  const errors = {
    contacts: contactIds.length < MIN_CONTACTS,
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
    const id = `a${stamp()}`
    addAriza(borrower.passport, {
      id,
      number: arizaNumber(today),
      productId: product.id,
      amount: draft.amount,
      term: draft.term,
      payDay: draft.payDay,
      payType: draft.payType,
      contactIds,
      status: 'review',
      createdAt: today,
    })
    setArizaId(id)
    const result = await decide(draft.amount, rate, draft.term, income)
    updateAriza(
      borrower.passport,
      id,
      result.kind === 'declined'
        ? {
            status: 'declined',
            // The mock only declines when the payment is too big for the income
            reason: 'load',
            reapplyOn: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30),
          }
        : {
            status: result.kind,
            offered: result.amount,
            expiresOn: new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate() + OFFER_DAYS,
            ),
          },
    )
    setDecision(result)
    setStep('decision')
  }
  const pay = async () => {
    setStep('payout')
    if (arizaId) updateAriza(borrower.passport, arizaId, { status: 'signed' })
    await payOut()
    const loanId = `l${stamp()}`
    const number =
      arizalarOf(borrower.passport).find((item) => item.id === arizaId)?.number ??
      arizaNumber(today)
    if (arizaId) updateAriza(borrower.passport, arizaId, { status: 'paidOut', loanId })
    addLoan(borrower.passport, {
      id: loanId,
      number,
      productId: product.id,
      amount,
      rate,
      term: draft.term,
      issuedAt: today,
      payDay: draft.payDay,
      payType: draft.payType,
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
      <InfoRow label={t('apply.payType')} value={t(`payType.${draft.payType}`)} />
      <InfoRow
        label={t(draft.payType === 'differentiated' ? 'apply.monthly.first' : 'apply.monthly')}
        value={formatSum(monthly)}
      />
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
            <div className="grid grid-cols-2 gap-1">
              <Button
                variant="ghost"
                block
                className="text-danger!"
                onClick={() => setRefusing(true)}
              >
                {t('refuse.open')}
              </Button>
              <Button variant="ghost" block onClick={exit}>
                {t('decision.later')}
              </Button>
            </div>
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
            {t(
              draft.payType === 'differentiated' ? 'decision.perMonth.first' : 'decision.perMonth',
              {
                months: String(draft.term),
                sum: formatSum(monthly),
              },
            )}
          </span>
        </div>
        <p className="text-center text-sm text-ink-muted">{t('decision.valid')}</p>
        {refusing && arizaId && (
          <RefuseSheet
            owner={borrower.passport}
            arizaId={arizaId}
            onClose={() => setRefusing(false)}
            onRefused={exit}
          />
        )}
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
            value={t('contract.payDay.value', { day: String(draft.payDay) })}
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
          payDay={draft.payDay}
          payType={draft.payType}
        />
      </FormScreen>
    )

  if (step === 'sign')
    return (
      <OtpScreen
        subtitle={t('contract.code', { phone: formatPhone(borrower.phone) })}
        blockKey={borrower.phone}
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
            {t(
              draft.payType === 'differentiated' ? 'decision.perMonth.first' : 'decision.perMonth',
              {
                months: String(draft.term),
                sum: formatSum(quote(draft.amount, rate, draft.term, draft.payType).monthly),
              },
            )}
          </span>
        </div>
        <span className="text-sm font-semibold text-brand">{t('details.change')}</span>
      </button>

      <div className="flex flex-col gap-4">
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
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-bold">{t('details.contacts')}</h2>
          <p className="text-sm text-ink-muted">
            {t('details.contacts.hint', { count: String(MIN_CONTACTS) })}
          </p>
        </div>
        <div role="group" aria-label={t('details.contacts')} className="flex flex-col gap-2">
          {contacts.map((contact) => {
            const on = contactIds.includes(contact.id)
            return (
              <button
                key={contact.id}
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() =>
                  setContactIds(
                    on ? contactIds.filter((id) => id !== contact.id) : [...contactIds, contact.id],
                  )
                }
                className={cn(
                  'flex items-center gap-3 rounded-control border-[1.5px] bg-canvas p-3.5 text-left',
                  on ? 'border-primary' : 'border-line',
                )}
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">
                    {contact.name} · {t(`relation.${contact.relation}`)}
                  </span>
                  <span className="text-sm text-ink-muted tabular-nums">
                    {formatPhone(contact.phone)}
                  </span>
                </span>
                <span
                  className={cn(
                    'grid size-5 shrink-0 place-items-center rounded-md border-2',
                    on ? 'border-primary bg-primary text-on-primary' : 'border-neutral-400',
                  )}
                >
                  {on && <Check size={14} strokeWidth={3} />}
                </span>
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => setAddingContact(true)}
            className={cn(
              'flex items-center gap-3 rounded-control border-[1.5px] border-dashed bg-canvas p-3.5 text-left font-semibold text-brand',
              submitted && errors.contacts ? 'border-danger' : 'border-line',
            )}
          >
            <Plus size={20} />
            {t('myContacts.add')}
          </button>
          {submitted && errors.contacts && (
            <p className="text-sm text-danger">
              {t('details.contacts.required', { count: String(MIN_CONTACTS) })}
            </p>
          )}
        </div>
      </section>
      {addingContact && (
        <ContactSheet
          owner={borrower.passport}
          contact={null}
          onClose={() => setAddingContact(false)}
          onSaved={(added) => setContactIds([...contactIds, added.id])}
        />
      )}
      {addingCard && (
        <AddCardSheet
          owner={borrower.passport}
          onClose={() => setAddingCard(false)}
          onAdded={(added) => setCardId(added.id)}
        />
      )}
    </FormScreen>
  )
}
