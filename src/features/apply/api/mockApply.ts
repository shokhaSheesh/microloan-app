// Stand-in for the loan API.
// - The decision allows a monthly payment up to half the stated income. Above that it offers the
//   largest sum that fits; below 1 mln it declines.
// - Any 6-character signing code works except "000000".
// - The payout to the sample Uzcard •••• 8812 fails (Atmos: the bank did not answer); others succeed.

import { quote } from '@/entities/loans/loans'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const MIN = 1_000_000
const STEP = 500_000

export type Decision =
  { kind: 'approved'; amount: number } | { kind: 'counter'; amount: number } | { kind: 'declined' }

export async function decide(amount: number, rate: number, term: number, income: number) {
  await delay(4200)
  const affordable = income * 0.5
  if (quote(amount, rate, term).monthly <= affordable)
    return { kind: 'approved', amount } satisfies Decision
  const r = rate / 100 / 12
  const most = Math.floor((affordable * (1 - (1 + r) ** -term)) / r / STEP) * STEP
  return (most >= MIN ? { kind: 'counter', amount: most } : { kind: 'declined' }) satisfies Decision
}

export async function sendSignCode() {
  await delay(600)
}

export async function verifySignCode(code: string) {
  await delay(700)
  if (code === '000000') throw new Error('invalid_code')
}

const PAYOUT_FAILS = new Set(['8812'])

/** Atmos sends the money to the card. Rejects when the bank does not take it; it is retried later. */
export async function payOut(last4: string) {
  await delay(2600)
  if (PAYOUT_FAILS.has(last4)) throw new Error('payout_failed')
}
