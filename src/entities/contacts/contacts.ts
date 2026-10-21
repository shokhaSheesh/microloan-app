import { useSyncExternalStore } from 'react'

/** Who a contact is to the borrower. */
export const RELATIONS = [
  'spouse',
  'parent',
  'child',
  'brother',
  'sister',
  'relative',
  'friend',
  'colleague',
] as const
export type Relation = (typeof RELATIONS)[number]

/** Someone the brand may call when it cannot reach the borrower. Picked on every ariza. */
export type Contact = {
  id: string
  name: string
  /** Nine digits after +998. */
  phone: string
  relation: Relation
  comment: string
}

// Two sample contacts for every borrower, kept by passport. Replace with the API.
const SAMPLES = (): Contact[] => [
  { id: 'c1', name: 'Dilnoza', phone: '901112233', relation: 'spouse', comment: '' },
  {
    id: 'c2',
    name: 'Akmal',
    phone: '935554466',
    relation: 'brother',
    comment: 'Ishda, 18:00 dan keyin',
  },
]

const OWN: Record<string, Contact[]> = {}
const own = (owner: string) => (OWN[owner] ??= SAMPLES())

const NONE: Contact[] = []
const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
const change = (owner: string, next: Contact[]) => {
  OWN[owner] = next
  listeners.forEach((listener) => listener())
}

/** The borrower's contacts; the same list until one changes, so safe in render. */
export const useContacts = (owner: string | undefined) =>
  useSyncExternalStore(subscribe, () => (owner ? own(owner) : NONE))

/** Adds the contact, or replaces the one with the same id. */
export function saveContact(owner: string, contact: Contact) {
  const list = own(owner)
  change(
    owner,
    list.some((item) => item.id === contact.id)
      ? list.map((item) => (item.id === contact.id ? contact : item))
      : [...list, contact],
  )
}

export const removeContact = (owner: string, id: string) =>
  change(
    owner,
    own(owner).filter((item) => item.id !== id),
  )
