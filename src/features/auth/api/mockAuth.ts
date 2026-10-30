// Stand-in for the auth API. One entry for sign-in and sign-up: the phone number decides.
// - Any 6-digit code works except "000000".
// - Registered numbers sign in with code + password. Any password works except "wrong1234".
//   90 123 45 67 is on a known device: straight in.
//   93 555 44 33 is on a new device: MyID face, then the cards are unlinked.
//   99 111 22 33 is on a new device and MyID does not confirm the face.
// - A new number signs up: passport, MyID (always finds the same invented person), password.

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
  '935554433': {
    fullName: 'Rahimov Sardor Akmal oʻgʻli',
    firstName: 'Sardor',
    phone: '935554433',
    passport: 'AC7654321',
    birthDate: '03.09.1990',
    address: 'Toshkent sh., Mirobod tumani, Nukus koʻchasi, 7-uy',
  },
  '991112233': {
    fullName: 'Yoʻldosheva Malika Anvar qizi',
    firstName: 'Malika',
    phone: '991112233',
    passport: 'AD1122334',
    birthDate: '21.01.1998',
    address: 'Samarqand sh., Registon koʻchasi, 15-uy',
  },
}

/** Phones this account has signed in on before. Mock: only the first sample. */
const KNOWN_DEVICE = new Set(['901234567'])
const FACE_FAILS = new Set(['991112233'])

export const WRONG_PASSWORD = 'wrong1234'

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

/** Saves the password chosen at sign-up. */
export async function setPassword(_phone: string, _password: string) {
  await delay(700)
}

/** Rejects on a wrong password. Resolves with whether this phone is one the account knows. */
export async function checkPassword(phone: string, password: string) {
  await delay(700)
  if (password === WRONG_PASSWORD) throw new Error('invalid_password')
  return { knownDevice: KNOWN_DEVICE.has(phone) }
}

/**
 * «Parolni unutdingizmi?»: after the SMS code, the new password replaces the old one. Resolves
 * with whether this phone is one the account knows, as a sign-in does.
 */
export async function resetPassword(phone: string, _password: string) {
  await delay(700)
  return { knownDevice: KNOWN_DEVICE.has(phone) }
}

/** A new device: MyID compares the face with the account's. Rejects when it does not match. */
export async function verifyDeviceFace(phone: string) {
  await delay(2200)
  if (FACE_FAILS.has(phone)) throw new Error('face_mismatch')
  // From now on this phone is known; the owner gets an SMS about the new device
  KNOWN_DEVICE.add(phone)
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
