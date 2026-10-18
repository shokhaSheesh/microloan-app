// Stand-in for the auth API. One entry for sign-in and sign-up: the phone number decides.
// - Any 6-digit code works except "000000".
// - 90 123 45 67 is already registered: after the code it goes straight to a new PIN.
// - MyID always finds the same invented person after a short wait.

import type { Borrower } from '@/entities/session/session'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const REGISTERED: Record<string, Borrower> = {
  '901234567': {
    fullName: 'Karimova Dilnoza Rustam qizi',
    firstName: 'Dilnoza',
    phone: '901234567',
    passport: 'AB1234567',
    birthDate: '12.05.1995',
    address: 'Toshkent sh., Chilonzor tumani, 9-kvartal, 12-uy',
  },
}

export async function sendCode(_phone: string) {
  await delay(700)
}

/** Rejects on a wrong code. Resolves with the borrower when this number already has an account. */
export async function verifyCode(phone: string, code: string) {
  await delay(700)
  if (code === '000000') throw new Error('invalid_code')
  return { borrower: REGISTERED[phone] ?? null }
}

/** Checks the passport against MyID before the face step. */
export async function checkDocument(_passport: string, _birthDate: Date) {
  await delay(800)
}

/** MyID: matches the captured face with the passport and answers with the person's data. */
export async function verifyFace(phone: string, passport: string, birthDate: string) {
  await delay(2200)
  return {
    fullName: 'Toshmatov Jasur Bahodir oʻgʻli',
    firstName: 'Jasur',
    phone,
    passport,
    birthDate,
    address: 'Toshkent sh., Yunusobod tumani, 11-mavze, 23-uy',
  } satisfies Borrower
}

/** Another account already signs in with this number. */
export const isRegistered = (phone: string) => phone in REGISTERED

/** After the code to the new number fits: the account now signs in with it. */
export async function changePhone(from: string, to: string) {
  await delay(500)
  const account = REGISTERED[from]
  if (!account) return
  delete REGISTERED[from]
  REGISTERED[to] = { ...account, phone: to }
}
