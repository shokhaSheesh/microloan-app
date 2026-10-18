import { useSyncExternalStore } from 'react'
import { BRAND, type BrandId, type Product } from '@/shared/config/brand'

/** A loan the borrower took. Its schedule is worked out from the sum, rate and term. */
export type Loan = {
  id: string
  /** Contract number, e.g. "FB-2026-004512". */
  number: string
  productId: string
  amount: number
  /** Yearly interest, %. */
  rate: number
  term: number
  issuedAt: Date
  /** Day of the month payments are due. */
  payDay: number
  card: { brand: 'uzcard' | 'humo'; last4: string }
  /** Monthly payments made so far. */
  paidCount: number
  /** Set when a payment is late. */
  overdueSince?: Date
  closedAt?: Date
  /** When a monthly payment was made in the app, by its number; others count as paid on the day. */
  paidOn?: Record<number, Date>
  /** Money paid ahead of the schedule. A partial one lowers the payments after it. */
  prepayments?: Prepayment[]
}

/** An early repayment: `afterPaid` is how many monthly payments had been made when it came. */
export type Prepayment = { at: Date; amount: number; kind: 'partial' | 'full'; afterPaid: number }

/**
 * `paid`: done. `next`: the one to pay now. `overdue`: its day has passed unpaid. `settled`:
 * never due, because the loan was paid off early before it.
 */
export type InstallmentState = 'paid' | 'next' | 'overdue' | 'upcoming' | 'settled'

export type Installment = {
  n: number
  due: Date
  amount: number
  principal: number
  interest: number
}

const annuity = (principal: number, r: number, n: number) => (principal * r) / (1 - (1 + r) ** -n)

/**
 * Equal monthly payments (annuity): the same sum each month, interest on what is left. A partial
 * early repayment takes its sum off what is left and spreads the rest over the months that
 * remain, so the monthly payment drops and the end date stays.
 */
export function scheduleOf(
  loan: Pick<Loan, 'amount' | 'rate' | 'term' | 'issuedAt' | 'payDay' | 'prepayments'>,
) {
  const r = loan.rate / 100 / 12
  let left = loan.amount
  let payment = annuity(left, r, loan.term)
  const out: Installment[] = []
  for (let i = 0; i < loan.term && left > 0.5; i++) {
    for (const extra of loan.prepayments ?? []) {
      if (extra.kind !== 'partial' || extra.afterPaid !== i) continue
      left -= extra.amount
      payment = annuity(left, r, loan.term - i)
    }
    const interest = left * r
    const principal = i === loan.term - 1 ? left : payment - interest
    left -= principal
    const due = new Date(loan.issuedAt.getFullYear(), loan.issuedAt.getMonth() + i + 1, loan.payDay)
    out.push({ n: i + 1, due, amount: Math.round(principal + interest), principal, interest })
  }
  return out
}

/** Where a loan stands: what is left to pay, the next payment, and how far along it is. */
export function progressOf(loan: Loan) {
  const schedule = scheduleOf(loan)
  const left = loan.closedAt ? [] : schedule.slice(loan.paidCount)
  return {
    schedule,
    next: left[0],
    remaining: Math.round(left.reduce((sum, item) => sum + item.amount, 0)),
    principalLeft: Math.round(left.reduce((sum, item) => sum + item.principal, 0)),
    paid: loan.closedAt ? schedule.length : loan.paidCount,
    total: schedule.length,
  }
}

/** Each month's state, for the schedule list. */
export function stateOf(loan: Loan, item: Installment, today: Date): InstallmentState {
  const payoff = loan.prepayments?.find((extra) => extra.kind === 'full')
  if (payoff && item.n > payoff.afterPaid) return 'settled'
  if (loan.closedAt || item.n <= loan.paidCount) return 'paid'
  if (item.due < today) return 'overdue'
  return item.n === loan.paidCount + 1 ? 'next' : 'upcoming'
}

/** What closing the loan today costs: the principal left and this month's interest so far. */
export function payoffOf(loan: Loan, today: Date) {
  const { schedule, principalLeft } = progressOf(loan)
  const last = loan.paidCount > 0 ? schedule[loan.paidCount - 1].due : loan.issuedAt
  const days = Math.max(0, Math.round((today.getTime() - last.getTime()) / 86_400_000))
  return Math.round(principalLeft + ((principalLeft * loan.rate) / 100 / 365) * days)
}

export const productOf = (loan: Pick<Loan, 'productId'>) =>
  BRAND.products.find((product) => product.id === loan.productId)

// Sample loans by the borrower's passport, which stays when the phone number changes. The
// registered sample borrower (90 123 45 67, AB1234567) has loans in each brand; anyone new has
// none. Replace with the API.
const today = new Date()
const monthsAgo = (n: number, day: number) =>
  new Date(today.getFullYear(), today.getMonth() - n, day)
const SAMPLES_BY_BRAND: Record<BrandId, Record<string, Loan[]>> = {
  fortuna: {
    AB1234567: [
      {
        id: 'l1',
        number: 'FB-2026-004512',
        productId: 'tezkor',
        amount: 24_000_000,
        rate: 47,
        term: 18,
        issuedAt: monthsAgo(5, 3),
        payDay: 5,
        card: { brand: 'humo', last4: '1671' },
        paidCount: 5,
      },
      {
        id: 'l2',
        number: 'FB-2025-001377',
        productId: 'ishonch',
        amount: 8_000_000,
        rate: 54,
        term: 12,
        issuedAt: monthsAgo(19, 10),
        payDay: 10,
        card: { brand: 'humo', last4: '1671' },
        paidCount: 12,
        closedAt: monthsAgo(7, 8),
      },
      {
        id: 'l3',
        number: 'FB-2025-000842',
        productId: 'rivoj',
        amount: 15_000_000,
        rate: 49,
        term: 12,
        issuedAt: monthsAgo(22, 14),
        payDay: 15,
        card: { brand: 'humo', last4: '1671' },
        paidCount: 12,
        closedAt: monthsAgo(10, 15),
      },
      {
        id: 'l4',
        number: 'FB-2024-007930',
        productId: 'tezkor',
        amount: 6_000_000,
        rate: 45,
        term: 6,
        issuedAt: monthsAgo(30, 20),
        payDay: 20,
        card: { brand: 'uzcard', last4: '8812' },
        paidCount: 4,
        // Paid off early, two months ahead
        prepayments: [{ at: monthsAgo(25, 2), amount: 2_100_000, kind: 'full', afterPaid: 4 }],
        closedAt: monthsAgo(25, 2),
      },
    ],
  },
  vodiy: {
    AB1234567: [
      {
        id: 'v1',
        number: 'VT-2026-010274',
        productId: 'zar',
        amount: 30_000_000,
        rate: 48,
        term: 12,
        issuedAt: monthsAgo(4, 12),
        payDay: 15,
        card: { brand: 'uzcard', last4: '4417' },
        paidCount: 4,
      },
      {
        id: 'v2',
        number: 'VT-2025-006118',
        productId: 'imkoniyat',
        amount: 12_000_000,
        rate: 55,
        term: 9,
        issuedAt: monthsAgo(14, 2),
        payDay: 5,
        card: { brand: 'uzcard', last4: '4417' },
        paidCount: 9,
        closedAt: monthsAgo(5, 4),
      },
      {
        id: 'v3',
        number: 'VT-2025-002391',
        productId: 'ishonch',
        amount: 20_000_000,
        rate: 48,
        term: 12,
        issuedAt: monthsAgo(27, 8),
        payDay: 10,
        card: { brand: 'humo', last4: '0925' },
        paidCount: 12,
        closedAt: monthsAgo(15, 9),
      },
      {
        id: 'v4',
        number: 'VT-2024-001156',
        productId: 'komak',
        amount: 8_000_000,
        rate: 50,
        term: 9,
        issuedAt: monthsAgo(40, 3),
        payDay: 5,
        card: { brand: 'uzcard', last4: '4417' },
        paidCount: 9,
        closedAt: monthsAgo(31, 4),
      },
    ],
  },
}
const SAMPLES = SAMPLES_BY_BRAND[BRAND.id]

const NONE: Loan[] = []
const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** The borrower's loans, newest first. The same list until one is added, so it is safe in render. */
export const loansOf = (owner: string | undefined) => (owner ? SAMPLES[owner] : undefined) ?? NONE

/** The borrower's loans; re-renders when a new one is paid out. */
export const useLoans = (owner: string | undefined) =>
  useSyncExternalStore(subscribe, () => loansOf(owner))

/** Changes one loan, e.g. after an early repayment. */
export function updateLoan(owner: string, id: string, patch: Partial<Loan>) {
  SAMPLES[owner] = (SAMPLES[owner] ?? []).map((loan) =>
    loan.id === id ? { ...loan, ...patch } : loan,
  )
  listeners.forEach((listener) => listener())
}

/** A loan just paid out to the card goes to the top of the list. */
export function addLoan(owner: string, loan: Loan) {
  SAMPLES[owner] = [loan, ...(SAMPLES[owner] ?? [])]
  listeners.forEach((listener) => listener())
}

/** The yearly rate for a term: a product's lower rate up to 12 months, its higher one beyond. */
export const rateFor = (product: Product, term: number) =>
  term <= 12 ? product.rate[0] : product.rate[1]

/** Monthly payment, total to pay and the interest in it, for a sum, yearly rate and term. */
export function quote(amount: number, rate: number, term: number) {
  const r = rate / 100 / 12
  const monthly = Math.round((amount * r) / (1 - (1 + r) ** -term))
  const total = monthly * term
  return { monthly, total, interest: total - amount }
}

/** The terms a product offers, in months, up to its longest. */
export const termsOf = (product: Product) =>
  [3, 6, 9, 12, 18, 24, 36, 48].filter((n) => n >= (product.termMin ?? 3) && n <= product.termMax)
