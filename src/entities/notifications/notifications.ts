import { useSyncExternalStore } from 'react'
import { loansOf, productOf, progressOf } from '@/entities/loans/loans'
import { BRAND } from '@/shared/config/brand'
import { loanPath, payPath, applyPath, ROUTES } from '@/shared/config/routes'
import type { TranslationKey } from '@/shared/i18n/dictionaries'
import { formatDate, formatSum } from '@/shared/lib/format'

/** What a notification is about; picks its icon, colour and filter. */
export type NotificationKind = 'reminder' | 'paid' | 'overdue' | 'approved' | 'closed' | 'news'

/**
 * One message in Bildirishnomalar. The text is a translation key with its values, so it follows
 * the app language. `to` is where a tap leads.
 */
export type AppNotification = {
  id: string
  kind: NotificationKind
  title: TranslationKey
  body: TranslationKey
  params: Record<string, string>
  at: Date
  read: boolean
  to?: string
}

// By the borrower's passport, like loans and cards
const byOwner: Record<string, AppNotification[]> = {}
const NONE: AppNotification[] = []
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const at = (date: Date, hour: number, minute = 0) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute)
const daysAgo = (n: number, hour: number, minute = 0) => {
  const day = new Date()
  day.setDate(day.getDate() - n)
  return at(day, hour, minute)
}

// Sample messages made from the borrower's loans, plus two offers. Replace with the API.
function seeded(owner: string) {
  if (byOwner[owner]) return byOwner[owner]
  const list: AppNotification[] = []
  for (const loan of loansOf(owner)) {
    const product = productOf(loan)?.name ?? ''
    const { next, schedule } = progressOf(loan)
    if (next)
      list.push({
        id: `${loan.id}-remind`,
        kind: loan.overdueSince ? 'overdue' : 'reminder',
        title: loan.overdueSince ? 'notif.overdue' : 'notif.reminder',
        body: loan.overdueSince ? 'notif.overdue.body' : 'notif.reminder.body',
        params: { product, sum: formatSum(next.amount), date: formatDate(next.due) },
        at: daysAgo(0, 10, 0),
        read: false,
        to: payPath(loan.id),
      })
    const last = loan.paidCount > 0 ? schedule[loan.paidCount - 1] : undefined
    if (last && !loan.closedAt)
      list.push({
        id: `${loan.id}-paid${last.n}`,
        kind: 'paid',
        title: 'notif.paid',
        body: 'notif.paid.body',
        params: { product, sum: formatSum(last.amount), n: String(last.n) },
        at: loan.paidOn?.[last.n] ?? at(last.due, 9, 0),
        read: true,
        to: ROUTES.payments,
      })
    if (loan.closedAt)
      list.push({
        id: `${loan.id}-closed`,
        kind: 'closed',
        title: 'notif.closed',
        body: 'notif.closed.body',
        params: { product, number: loan.number },
        at: at(loan.closedAt, 11, 20),
        read: true,
        to: loanPath(loan.id),
      })
    list.push({
      id: `${loan.id}-approved`,
      kind: 'approved',
      title: 'notif.approved',
      body: 'notif.approved.body',
      params: { product, sum: formatSum(loan.amount) },
      at: at(loan.issuedAt, 14, 5),
      read: true,
      to: loanPath(loan.id),
    })
  }
  const offer = BRAND.products[0]
  if (offer)
    list.push({
      id: 'news-offer',
      kind: 'news',
      title: 'notif.news.offer',
      body: 'notif.news.offer.body',
      params: { product: offer.name, sum: String(offer.max / 1_000_000) },
      at: daysAgo(1, 12, 30),
      read: false,
      to: applyPath(offer.id),
    })
  list.push({
    id: 'news-app',
    kind: 'news',
    title: 'notif.news.app',
    body: 'notif.news.app.body',
    params: {},
    at: daysAgo(6, 16, 0),
    read: true,
  })
  byOwner[owner] = list.sort((a, b) => b.at.getTime() - a.at.getTime())
  return byOwner[owner]
}

export const notificationsOf = (owner: string | undefined) => (owner ? seeded(owner) : NONE)

/** The borrower's notifications, newest first. */
export const useNotifications = (owner: string | undefined) =>
  useSyncExternalStore(subscribe, () => notificationsOf(owner))

/** A new message at the top, e.g. after a payment. */
export function pushNotification(owner: string, item: Omit<AppNotification, 'read'>) {
  byOwner[owner] = [{ ...item, read: false }, ...seeded(owner)]
  emit()
}

export function markRead(owner: string, id: string) {
  byOwner[owner] = seeded(owner).map((item) => (item.id === id ? { ...item, read: true } : item))
  emit()
}

export function markAllRead(owner: string) {
  byOwner[owner] = seeded(owner).map((item) => (item.read ? item : { ...item, read: true }))
  emit()
}
