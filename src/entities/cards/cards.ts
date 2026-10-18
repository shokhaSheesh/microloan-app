import { useSyncExternalStore } from 'react'
import { loansOf } from '@/entities/loans/loans'

/** A bank card the borrower linked: where loans are paid out and payments taken from. */
export type Card = { id: string; brand: 'uzcard' | 'humo'; last4: string; expiry: string }

export const cardText = (card: Pick<Card, 'brand' | 'last4'>) =>
  `${card.brand === 'humo' ? 'Humo' : 'Uzcard'} •••• ${card.last4}`

/** Humo cards start with 9860; the rest taken here are Uzcard (8600, 5614). */
export const brandOf = (number: string): Card['brand'] =>
  number.startsWith('9860') ? 'humo' : 'uzcard'

const byPhone: Record<string, Card[]> = {}
const NONE: Card[] = []
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// The sample borrower starts with the card their loans use. Replace with the API.
function seeded(phone: string) {
  if (!byPhone[phone]) {
    const seen = new Map<string, Card>()
    for (const loan of loansOf(phone))
      seen.set(loan.card.last4, { id: `c${loan.card.last4}`, ...loan.card, expiry: '0829' })
    byPhone[phone] = [...seen.values()]
  }
  return byPhone[phone]
}

export const cardsOf = (phone: string | undefined) => (phone ? seeded(phone) : NONE)
export const useCards = (phone: string | undefined) =>
  useSyncExternalStore(subscribe, () => cardsOf(phone))

/** Adds a card unless one with the same last four digits is there. Returns the card kept. */
export function addCard(phone: string, card: Omit<Card, 'id'>) {
  const list = seeded(phone)
  const same = list.find((item) => item.last4 === card.last4 && item.brand === card.brand)
  if (same) return same
  const created = { ...card, id: `c${Date.now()}` }
  byPhone[phone] = [...list, created]
  emit()
  return created
}

export function removeCard(phone: string, id: string) {
  byPhone[phone] = seeded(phone).filter((card) => card.id !== id)
  emit()
}
