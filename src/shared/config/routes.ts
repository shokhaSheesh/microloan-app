export const ROUTES = {
  /** Welcome, sign-in and the lock screen. */
  auth: '/',
  pinSetup: '/pin/new',
  onboarding: '/welcome',
  home: '/home',
  loans: '/loans',
  apply: '/apply',
  /** The application after the calculator, full screen without the tab bar. */
  application: '/apply/new',
  payments: '/payments',
  profile: '/profile',
} as const

/** "Qarz olish", started from a product's card. */
export const applyPath = (productId?: string) =>
  productId ? `/apply?product=${productId}` : '/apply'
