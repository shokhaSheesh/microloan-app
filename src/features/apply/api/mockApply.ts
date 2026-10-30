// Stand-in for the loan API.
// - FlexSoft decides by the product's rules, later; the app only sends the ariza (it stays
//   «Koʻrib chiqilmoqda»). The offers in Arizalar are samples.
// - Any 6-character signing code works except "000000".
// - The payout always succeeds; the failed payout is shown in «Holatlar namunasi».

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export type Decision =
  { kind: 'approved'; amount: number } | { kind: 'counter'; amount: number } | { kind: 'declined' }

export async function sendSignCode() {
  await delay(600)
}

export async function verifySignCode(code: string) {
  await delay(700)
  if (code === '000000') throw new Error('invalid_code')
}

/** Atmos sends the money to the card. Rejects when the bank does not take it; it is retried later. */
export async function payOut(_last4: string) {
  await delay(2600)
}
