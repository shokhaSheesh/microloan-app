import { useSyncExternalStore } from 'react'
import { BRAND } from '@/shared/config/brand'

// What this phone remembers about the borrower. Kept in the browser so the lock screen survives
// a refresh, as it would on a phone; the real app keeps the PIN in the device's secure storage.
// Keys carry the brand, so Fortuna and Vodiy on one phone stay apart.
const key = (name: string) => `${BRAND.id}.${name}`
const KEYS = {
  pin: key('pin'),
  biometric: key('biometric'),
  user: key('user'),
  onboarded: key('onboarded'),
}

/** How the borrower unlocks the app besides the PIN. */
export type Biometric = 'face' | 'finger'

/** The person MyID confirmed. */
export type Borrower = {
  fullName: string
  firstName: string
  phone: string
  passport: string
  birthDate: string
  address: string
}

const read = (k: string) => {
  try {
    return localStorage.getItem(k)
  } catch {
    return null
  }
}
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())
const write = (k: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(k)
    else localStorage.setItem(k, value)
  } catch {
    // Private mode: it lasts until the page is closed
  }
  emit()
}
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const PIN_LENGTH = 4
/** Wrong PINs in a row before the app asks to sign in by phone again. */
export const PIN_ATTEMPTS = 5

export const session = {
  hasPin: () => read(KEYS.pin) !== null,
  checkPin: (pin: string) => read(KEYS.pin) === pin,
  setPin: (pin: string) => write(KEYS.pin, pin),
  biometric: () => read(KEYS.biometric) as Biometric | null,
  setBiometric: (kind: Biometric | null) => write(KEYS.biometric, kind),
  borrower: (): Borrower | null => {
    const raw = read(KEYS.user)
    try {
      return raw ? (JSON.parse(raw) as Borrower) : null
    } catch {
      return null
    }
  },
  setBorrower: (borrower: Borrower) => write(KEYS.user, JSON.stringify(borrower)),
  /** The intro slides were seen on this phone. */
  onboarded: () => read(KEYS.onboarded) === '1',
  setOnboarded: () => write(KEYS.onboarded, '1'),
  /** Forgets everything; the next start asks for the phone number. */
  signOut: () => {
    write(KEYS.pin, null)
    write(KEYS.biometric, null)
    write(KEYS.user, null)
  },
}

/** «Ism F.» as banks print it on cards: "Karimova Dilnoza Rustam qizi" -> "Dilnoza K.". */
export function holderOf(fullName: string) {
  const [surname = '', name = ''] = fullName.split(' ')
  return name ? `${name} ${surname.charAt(0)}.` : surname
}

let cached: { raw: string | null; value: Borrower | null } = { raw: null, value: null }
/** The signed-in borrower; re-renders on sign-in and sign-out. */
export const useBorrower = () =>
  useSyncExternalStore(subscribe, () => {
    const raw = read(KEYS.user)
    if (raw !== cached.raw) cached = { raw, value: session.borrower() }
    return cached.value
  })
