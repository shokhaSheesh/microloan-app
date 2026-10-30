import { BRAND } from '@/shared/config/brand'
import { createStore } from '@/shared/lib/createStore'

/** One phone the borrower is signed in on. The app has no web version, so every session is a phone. */
export type Session = {
  id: string
  /** "iPhone 15 Pro", "Samsung Galaxy S24". */
  device: string
  /** "iOS 18.1", "Android 15". */
  os: string
  /** The app and its version, e.g. "Fortuna Biznes 1.0". */
  client: string
  ip: string
  startedAt: Date
  /** The session this screen is open in. It can't be ended from here. */
  current?: boolean
}

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000)

// Invented sample sessions. Replace with the API.
export const sessionsStore = createStore<Session>([
  {
    id: 's1',
    device: 'iPhone 15 Pro',
    os: 'iOS 18.1',
    client: `${BRAND.name} 1.0`,
    ip: '213.230.80.14',
    startedAt: hoursAgo(0.2),
    current: true,
  },
  {
    id: 's2',
    device: 'Samsung Galaxy A54',
    os: 'Android 15',
    client: `${BRAND.name} 1.0`,
    ip: '84.54.71.203',
    startedAt: hoursAgo(26),
  },
  {
    id: 's3',
    device: 'Redmi Note 13',
    os: 'Android 14',
    client: `${BRAND.name} 0.9`,
    ip: '195.158.9.41',
    startedAt: hoursAgo(24 * 6),
  },
])
