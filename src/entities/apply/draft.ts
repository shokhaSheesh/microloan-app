import { useSyncExternalStore } from 'react'
import type { PayType } from '@/shared/config/brand'

/** What the borrower picked on the calculator, carried into the application. */
export type Draft = {
  productId: string
  amount: number
  term: number
  /** Day of the month, 1–10. */
  payDay: number
  payType: PayType
}

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
