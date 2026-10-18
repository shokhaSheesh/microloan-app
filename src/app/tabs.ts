import { CreditCard, FileText, House, Plus, UserRound } from 'lucide-react'
import { ROUTES } from '@/shared/config/routes'
import type { Tab } from '@/shared/ui/TabBar'

/** Asosiy · Qarzlarim · Qarz olish (the raised middle button) · Toʻlovlar · Profil. */
export const tabs: Tab[] = [
  { to: ROUTES.home, label: 'nav.home', icon: House },
  { to: ROUTES.loans, label: 'nav.loans', icon: FileText },
  { to: ROUTES.apply, label: 'nav.apply', icon: Plus, center: true },
  { to: ROUTES.payments, label: 'nav.payments', icon: CreditCard },
  { to: ROUTES.profile, label: 'nav.profile', icon: UserRound },
]
