export const ROUTES = {
  /** Welcome, sign-in and the lock screen. */
  auth: '/',
  pinSetup: '/pin/new',
  onboarding: '/welcome',
  home: '/home',
  loans: '/loans',
  loan: '/loans/:id',
  apply: '/apply',
  /** Every loan product, from the Kreditlar quick action. */
  credits: '/credits',
  /** «Batafsil shartlar»: one product's full terms. */
  productTerms: '/credits/:id',
  /** The application after the calculator, full screen without the tab bar. */
  application: '/apply/new',
  payments: '/payments',
  profile: '/profile',
  personal: '/profile/me',
  changePhone: '/profile/me/phone',
  notifications: '/notifications',
  cards: '/profile/cards',
  security: '/profile/security',
  sessions: '/profile/sessions',
  /** «Holatlar namunasi»: the states sample data never shows. */
  states: '/profile/states',
  state: '/profile/states/:id',
  language: '/profile/language',
  faq: '/profile/faq',
  chat: '/profile/chat',
  contacts: '/profile/contacts',
  /** The borrower's own contacts, picked on every ariza. */
  myContacts: '/profile/my-contacts',
} as const

/** Toʻlovlar with one loan's payment sheet open. */
export const payPath = (loanId: string) => `/payments?pay=${loanId}`

/** Qarzlarim on a tab: its running loans, its arizalar or its closed loans. */
export const loansPath = (tab?: 'applications' | 'closed') => (tab ? `/loans?tab=${tab}` : '/loans')

/** One loan's page. */
export const loanPath = (id: string) => `/loans/${id}`

/** "Qarz olish", started from a product's card. */
/** Kreditlar, optionally just some products (a banner's). */
export const creditsPath = (ids?: string[]) =>
  ids?.length ? `/credits?ids=${ids.join(',')}` : '/credits'

/** One screen of «Holatlar namunasi». */
export const statePath = (id: string) => `/profile/states/${id}`

/** One product's «Batafsil shartlar». */
export const productTermsPath = (id: string) => `/credits/${id}`

export const applyPath = (productId?: string) =>
  productId ? `/apply?product=${productId}` : '/apply'
