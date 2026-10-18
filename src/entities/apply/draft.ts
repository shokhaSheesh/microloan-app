import { useSyncExternalStore } from 'react'

/** What the borrower picked on the calculator, carried into the application. */
export type Draft = { productId: string; amount: number; term: number }

let draft: Draft | null = null
const listeners = new Set<() => void>()

export const setDraft = (next: Draft | null) => {
  draft = next
  listeners.forEach((listener) => listener())
}
export const useDraft = () =>
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    () => draft,
  )
