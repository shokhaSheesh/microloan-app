import { useSyncExternalStore } from 'react'
import { loansOf } from '@/entities/loans/loans'

/** A bank card the borrower linked: where loans are paid out and payments taken from. */
export type Card = { id: string; brand: 'uzcard' | 'humo'; last4: string; expiry: string }

export const cardText = (card: Pick<Card, 'brand' | 'last4'>) =>
  `${card.brand === 'humo' ? 'Humo' : 'Uzcard'} •••• ${card.last4}`

/** Humo cards start with 9860; the rest taken here are Uzcard (8600, 5614). */
export const brandOf = (number: string): Card['brand'] =>
  number.startsWith('9860') ? 'humo' : 'uzcard'

// By the borrower's passport, like the loans, so a new phone number keeps them
const byOwner: Record<string, Card[]> = {}
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
function seeded(owner: string) {
  if (!byOwner[owner]) {
    const seen = new Map<string, Card>()
    for (const loan of loansOf(owner))
      seen.set(loan.card.last4, { id: `c${loan.card.last4}`, ...loan.card, expiry: '0829' })
    byOwner[owner] = [...seen.values()]
  }
  return byOwner[owner]
}

export const cardsOf = (owner: string | undefined) => (owner ? seeded(owner) : NONE)
export const useCards = (owner: string | undefined) =>
  useSyncExternalStore(subscribe, () => cardsOf(owner))

/** Adds a card unless one with the same last four digits is there. Returns the card kept. */
export function addCard(owner: string, card: Omit<Card, 'id'>) {
  const list = seeded(owner)
  const same = list.find((item) => item.last4 === card.last4 && item.brand === card.brand)
  if (same) return same
  const created = { ...card, id: `c${Date.now()}` }
  byOwner[owner] = [...list, created]
  emit()
  return created
}

/** A sign-in from a new phone: every card is unlinked there and has to be linked again. */
export function unlinkAll(owner: string) {
  byOwner[owner] = []
  emit()
}

export function removeCard(owner: string, id: string) {
  byOwner[owner] = seeded(owner).filter((card) => card.id !== id)
  emit()
}
