export const ROUTES = {
  /** Welcome, sign-in and the lock screen. */
  auth: '/',
  pinSetup: '/pin/new',
  onboarding: '/welcome',
  home: '/home',
  loans: '/loans',
  loan: '/loans/:id',
  apply: '/apply',
  /** The application after the calculator, full screen without the tab bar. */
  application: '/apply/new',
  payments: '/payments',
  profile: '/profile',
  personal: '/profile/me',
  changePhone: '/profile/me/phone',
  notifications: '/notifications',
  cards: '/profile/cards',
  security: '/profile/security',
  notifySettings: '/profile/notifications',
  language: '/profile/language',
  faq: '/profile/faq',
  chat: '/profile/chat',
  contacts: '/profile/contacts',
} as const

/** Toʻlovlar with one loan's payment sheet open. */
export const payPath = (loanId: string) => `/payments?pay=${loanId}`

/** One loan's page. */
export const loanPath = (id: string) => `/loans/${id}`

/** "Qarz olish", started from a product's card. */
export const applyPath = (productId?: string) =>
  productId ? `/apply?product=${productId}` : '/apply'
