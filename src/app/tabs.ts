import { CreditCard, FileText, House, Plus, UserRound } from 'lucide-react'
import type { HomeData } from '@/shared/api/types'
import { ROUTES } from '@/shared/config/routes'
import type { Tab } from '@/shared/ui/TabBar'

/** What the app knows about each tab key the backend can send. */
const KNOWN: Record<string, Tab> = {
  home: { to: ROUTES.home, label: 'nav.home', icon: House },
  loans: { to: ROUTES.loans, label: 'nav.loans', icon: FileText },
  apply: { to: ROUTES.apply, label: 'nav.apply', icon: Plus, center: true },
  payments: { to: ROUTES.payments, label: 'nav.payments', icon: CreditCard },
  profile: { to: ROUTES.profile, label: 'nav.profile', icon: UserRound },
}

/** Used only when /client/home cannot be reached. */
export const tabs: Tab[] = ['home', 'loans', 'apply', 'payments', 'profile'].map(
  (key) => KNOWN[key],
)

/** The tab bar as the backend orders it: its order, its labels, hidden tabs left out. */
export const tabsFromApi = (items: HomeData['tabs']): Tab[] =>
  items.flatMap((item) => (KNOWN[item.key] ? [{ ...KNOWN[item.key], text: item.label }] : []))
