import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ApplicationPage } from '@/features/apply/pages/ApplicationPage'
import { ApplyPage } from '@/features/apply/pages/ApplyPage'
import { AuthPage } from '@/features/auth/pages/AuthPage'
import { PinSetupPage } from '@/features/auth/pages/PinSetupPage'
import { HomePage } from '@/features/home/pages/HomePage'
import { CreditsPage } from '@/features/home/pages/CreditsPage'
import { LoanPage } from '@/features/loans/pages/LoanPage'
import { LoansPage } from '@/features/loans/pages/LoansPage'
import { OnboardingPage } from '@/features/onboarding/pages/OnboardingPage'
import { PaymentsPage } from '@/features/payments/pages/PaymentsPage'
import { CardsPage } from '@/features/cards/pages/CardsPage'
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage'
import { ChangePhonePage } from '@/features/profile/pages/ChangePhonePage'
import { ChatPage } from '@/features/profile/pages/ChatPage'
import { ContactsPage } from '@/features/profile/pages/ContactsPage'
import { FaqPage } from '@/features/profile/pages/FaqPage'
import { LanguagePage } from '@/features/profile/pages/LanguagePage'
import { PersonalPage } from '@/features/profile/pages/PersonalPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { SecurityPage } from '@/features/profile/pages/SecurityPage'
import { BRAND_BASE } from '@/shared/config/brand'
import { ROUTES } from '@/shared/config/routes'
import { DeviceLayout } from './layouts/DeviceLayout'
import { SignedInLayout } from './layouts/SignedInLayout'
import { MyContactsPage } from '@/features/contacts/pages/MyContactsPage'
import { TabLayout } from './layouts/TabLayout'
import { tabs } from './tabs'

// Every route sits under the brand's path, e.g. /vodiy/home
export const router = createBrowserRouter(
  [
    {
      element: <DeviceLayout />,
      children: [
        { path: ROUTES.auth, element: <AuthPage /> },
        { path: ROUTES.pinSetup, element: <PinSetupPage /> },
        {
          element: <SignedInLayout />,
          children: [
            { path: ROUTES.onboarding, element: <OnboardingPage /> },
            { path: ROUTES.apply, element: <ApplyPage /> },
            { path: ROUTES.application, element: <ApplicationPage /> },
            { path: ROUTES.credits, element: <CreditsPage /> },
            { path: ROUTES.loan, element: <LoanPage /> },
            { path: ROUTES.personal, element: <PersonalPage /> },
            { path: ROUTES.changePhone, element: <ChangePhonePage /> },
            { path: ROUTES.notifications, element: <NotificationsPage /> },
            { path: ROUTES.cards, element: <CardsPage /> },
            { path: ROUTES.security, element: <SecurityPage /> },
            { path: ROUTES.language, element: <LanguagePage /> },
            { path: ROUTES.faq, element: <FaqPage /> },
            { path: ROUTES.chat, element: <ChatPage /> },
            { path: ROUTES.contacts, element: <ContactsPage /> },
            { path: ROUTES.myContacts, element: <MyContactsPage /> },
            {
              element: <TabLayout tabs={tabs} />,
              children: [
                { path: ROUTES.home, element: <HomePage /> },
                { path: ROUTES.loans, element: <LoansPage /> },
                { path: ROUTES.payments, element: <PaymentsPage /> },
                { path: ROUTES.profile, element: <ProfilePage /> },
              ],
            },
          ],
        },
        { path: '*', element: <Navigate to={ROUTES.auth} replace /> },
      ],
    },
  ],
  { basename: BRAND_BASE },
)
