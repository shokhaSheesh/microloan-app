import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ApplicationPage } from '@/features/apply/pages/ApplicationPage'
import { ApplyPage } from '@/features/apply/pages/ApplyPage'
import { AuthPage } from '@/features/auth/pages/AuthPage'
import { PinSetupPage } from '@/features/auth/pages/PinSetupPage'
import { HomePage } from '@/features/home/pages/HomePage'
import { LoanPage } from '@/features/loans/pages/LoanPage'
import { LoansPage } from '@/features/loans/pages/LoansPage'
import { OnboardingPage } from '@/features/onboarding/pages/OnboardingPage'
import { PaymentsPage } from '@/features/payments/pages/PaymentsPage'
import { CardsPage } from '@/features/cards/pages/CardsPage'
import { ChatPage } from '@/features/profile/pages/ChatPage'
import { ContactsPage } from '@/features/profile/pages/ContactsPage'
import { FaqPage } from '@/features/profile/pages/FaqPage'
import { LanguagePage } from '@/features/profile/pages/LanguagePage'
import { NotifySettingsPage } from '@/features/profile/pages/NotifySettingsPage'
import { PersonalPage } from '@/features/profile/pages/PersonalPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { SecurityPage } from '@/features/profile/pages/SecurityPage'
import { ROUTES } from '@/shared/config/routes'
import { DeviceLayout } from './layouts/DeviceLayout'
import { TabLayout } from './layouts/TabLayout'
import { tabs } from './tabs'

export const router = createBrowserRouter([
  {
    element: <DeviceLayout />,
    children: [
      { path: ROUTES.auth, element: <AuthPage /> },
      { path: ROUTES.pinSetup, element: <PinSetupPage /> },
      { path: ROUTES.onboarding, element: <OnboardingPage /> },
      { path: ROUTES.application, element: <ApplicationPage /> },
      { path: ROUTES.loan, element: <LoanPage /> },
      { path: ROUTES.personal, element: <PersonalPage /> },
      { path: ROUTES.cards, element: <CardsPage /> },
      { path: ROUTES.security, element: <SecurityPage /> },
      { path: ROUTES.notifySettings, element: <NotifySettingsPage /> },
      { path: ROUTES.language, element: <LanguagePage /> },
      { path: ROUTES.faq, element: <FaqPage /> },
      { path: ROUTES.chat, element: <ChatPage /> },
      { path: ROUTES.contacts, element: <ContactsPage /> },
      {
        element: <TabLayout tabs={tabs} />,
        children: [
          { path: ROUTES.home, element: <HomePage /> },
          { path: ROUTES.loans, element: <LoansPage /> },
          { path: ROUTES.apply, element: <ApplyPage /> },
          { path: ROUTES.payments, element: <PaymentsPage /> },
          { path: ROUTES.profile, element: <ProfilePage /> },
        ],
      },
      { path: '*', element: <Navigate to={ROUTES.auth} replace /> },
    ],
  },
])
