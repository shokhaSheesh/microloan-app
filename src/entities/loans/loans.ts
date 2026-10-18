import { useSyncExternalStore } from 'react'
import { BRAND, type Product } from '@/shared/config/brand'

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
}

export type Installment = {
  n: number
  due: Date
  amount: number
  principal: number
  interest: number
}

/** Equal monthly payments (annuity): the same sum each month, interest on what is left. */
export function scheduleOf(loan: Pick<Loan, 'amount' | 'rate' | 'term' | 'issuedAt' | 'payDay'>) {
  const r = loan.rate / 100 / 12
  const payment = (loan.amount * r) / (1 - (1 + r) ** -loan.term)
  let left = loan.amount
  return Array.from({ length: loan.term }, (_, i): Installment => {
    const interest = left * r
    const principal = i === loan.term - 1 ? left : payment - interest
    left -= principal
    const due = new Date(loan.issuedAt.getFullYear(), loan.issuedAt.getMonth() + i + 1, loan.payDay)
    return { n: i + 1, due, amount: Math.round(principal + interest), principal, interest }
  })
}

/** Where a loan stands: what is left to pay, the next payment, and how far along it is. */
export function progressOf(loan: Loan) {
  const schedule = scheduleOf(loan)
  const left = schedule.slice(loan.paidCount)
  return {
    schedule,
    next: left[0],
    remaining: Math.round(left.reduce((sum, item) => sum + item.amount, 0)),
    principalLeft: Math.round(left.reduce((sum, item) => sum + item.principal, 0)),
    paid: loan.paidCount,
    total: loan.term,
  }
}

export const productOf = (loan: Pick<Loan, 'productId'>) =>
  BRAND.products.find((product) => product.id === loan.productId)

// Sample loans by phone number. The registered sample borrower (90 123 45 67) has one running
// and one closed; anyone new has none. Replace with the API.
const today = new Date()
const monthsAgo = (n: number, day: number) =>
  new Date(today.getFullYear(), today.getMonth() - n, day)
const SAMPLES: Record<string, Loan[]> = {
  '901234567': [
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
  ],
}

const NONE: Loan[] = []
const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** The borrower's loans, newest first. The same list until one is added, so it is safe in render. */
export const loansOf = (phone: string | undefined) => (phone ? SAMPLES[phone] : undefined) ?? NONE

/** The borrower's loans; re-renders when a new one is paid out. */
export const useLoans = (phone: string | undefined) =>
  useSyncExternalStore(subscribe, () => loansOf(phone))

/** A loan just paid out to the card goes to the top of the list. */
export function addLoan(phone: string, loan: Loan) {
  SAMPLES[phone] = [loan, ...(SAMPLES[phone] ?? [])]
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
  [3, 6, 9, 12, 18, 24, 36].filter((n) => n <= product.termMax)
