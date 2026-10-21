import { useSyncExternalStore } from 'react'
import { loansOf } from '@/entities/loans/loans'
import { BRAND } from '@/shared/config/brand'

/**
 * Where an ariza stands, as the brand's admin sees it. The rules decide at once, so `review`
 * lasts only while the checks run; an offer (`approved`, `counter`) waits for the borrower to
 * sign, `signed` waits for the payout, and `paidOut` has become a loan. `refused`: the borrower
 * turned the offer down, with a reason.
 */
export const ARIZA_STATUSES = [
  'review',
  'approved',
  'counter',
  'signed',
  'paidOut',
  'declined',
  'expired',
  'refused',
] as const
export type ArizaStatus = (typeof ARIZA_STATUSES)[number]

/** Still in play: shown on Asosiy until it is signed or turned down. */
export const isPending = (status: ArizaStatus) =>
  status === 'review' || status === 'approved' || status === 'counter'
export const isOffer = (status: ArizaStatus) => status === 'approved' || status === 'counter'

export type Ariza = {
  id: string
  number: string
  productId: string
  /** What the borrower asked for. */
  amount: number
  /** What the decision gave: the same sum, or less for a counter-offer. */
  offered?: number
  term: number
  /** The borrower's contacts picked on the form, at least two. */
  contactIds?: string[]
  status: ArizaStatus
  createdAt: Date
  /** The loan it became. */
  loanId?: string
  /** An offer must be signed by this day, or it expires. */
  expiresOn?: Date
  /** After a decline: why, and the first day a new ariza is accepted. */
  reason?: DeclineReason
  reapplyOn?: Date
  /** After the borrower turned the offer down: the template picked, and their words for "other". */
  refusal?: { reason: RefusalReason; note?: string }
}

/** The templates a borrower picks from when turning an offer down. */
export const REFUSAL_REASONS = [
  'amountLow',
  'rateHigh',
  'paymentHigh',
  'changedMind',
  'elsewhere',
  'other',
] as const
export type RefusalReason = (typeof REFUSAL_REASONS)[number]

/**
 * Why the rules turned an ariza down, in the order they check: the monthly payment against the
 * income, late payments in the credit history, no history at all, the borrower's age.
 */
export const DECLINE_REASONS = ['load', 'history', 'noHistory', 'age'] as const
export type DeclineReason = (typeof DECLINE_REASONS)[number]

/** How long an offer waits for the signature. */
export const OFFER_DAYS = 3

const PREFIX = BRAND.id === 'fortuna' ? 'FB' : 'VT'
/** A new ariza number, until the API issues one. */
export const arizaNumber = (at: Date) =>
  `${PREFIX}-${at.getFullYear()}-${String(Date.now()).slice(-6)}`

const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
/** The same day at a sample time of day, so the list does not read "00:00". */
const atTime = (date: Date, i: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9 + ((i * 3) % 9), (i * 17) % 60)

// Sample arizalar, one in every status, so each card can be seen: the running loan's ariza
// (paid out) and six more. Replace with the API.
function samplesFor(owner: string): Ariza[] {
  const today = new Date()
  const ago = (days: number, i: number) => atTime(addDays(today, -days), i)
  const product = (i: number) => BRAND.products[i % BRAND.products.length].id
  const number = (at: Date, n: string) => `${PREFIX}-${at.getFullYear()}-${n}`
  const out: Ariza[] = []
  const running = loansOf(owner).find((loan) => !loan.closedAt)
  if (running)
    out.push({
      id: `a-${running.id}`,
      number: running.number,
      productId: running.productId,
      amount: running.amount,
      offered: running.amount,
      term: running.term,
      status: 'paidOut',
      createdAt: atTime(running.issuedAt, 1),
      loanId: running.id,
    })
  const review = new Date(today.getTime() - 4 * 60_000)
  out.push(
    {
      id: 'a-review',
      number: number(review, '557812'),
      productId: product(0),
      amount: 15_000_000,
      term: 12,
      status: 'review',
      createdAt: review,
    },
    {
      id: 'a-counter',
      number: number(today, '557790'),
      productId: product(1),
      amount: 8_000_000,
      offered: 6_000_000,
      term: 12,
      status: 'counter',
      createdAt: ago(1, 2),
      expiresOn: addDays(ago(1, 2), OFFER_DAYS),
    },
    {
      id: 'a-approved',
      number: number(today, '557741'),
      productId: product(2),
      amount: 5_000_000,
      offered: 5_000_000,
      term: 6,
      status: 'approved',
      createdAt: ago(2, 3),
      expiresOn: addDays(ago(2, 3), OFFER_DAYS),
    },
    {
      id: 'a-signed',
      number: number(today, '557702'),
      productId: product(0),
      amount: 3_000_000,
      offered: 3_000_000,
      term: 6,
      status: 'signed',
      createdAt: ago(0, 4),
    },
    {
      id: 'a-expired',
      number: number(today, '551960'),
      productId: product(1),
      amount: 12_000_000,
      offered: 12_000_000,
      term: 18,
      status: 'expired',
      createdAt: ago(25, 5),
      expiresOn: addDays(ago(25, 5), OFFER_DAYS),
    },
    {
      id: 'a-refused',
      number: number(today, '552377'),
      productId: product(2),
      amount: 10_000_000,
      offered: 10_000_000,
      term: 12,
      status: 'refused',
      createdAt: ago(12, 6),
      refusal: { reason: 'rateHigh' },
    },
    {
      id: 'a-declined',
      number: number(today, '003318'),
      productId: product(0),
      amount: 45_000_000,
      term: 24,
      status: 'declined',
      createdAt: ago(40, 7),
      reason: 'history',
      reapplyOn: addDays(ago(40, 7), 30),
    },
  )
  return out.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

const OWN: Record<string, Ariza[]> = {}
const own = (owner: string) => (OWN[owner] ??= samplesFor(owner))

const NONE: Ariza[] = []
const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
const notify = () => listeners.forEach((listener) => listener())

/** The borrower's arizalar, newest first. The same list until one changes, so safe in render. */
export const arizalarOf = (owner: string | undefined) => (owner ? own(owner) : NONE)

export const useArizalar = (owner: string | undefined) =>
  useSyncExternalStore(subscribe, () => arizalarOf(owner))

/** A just-sent ariza goes to the top. */
export function addAriza(owner: string, ariza: Ariza) {
  OWN[owner] = [ariza, ...own(owner)]
  notify()
}

export function updateAriza(owner: string, id: string, patch: Partial<Ariza>) {
  OWN[owner] = own(owner).map((item) => (item.id === id ? { ...item, ...patch } : item))
  notify()
}
