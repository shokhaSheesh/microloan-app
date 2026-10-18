import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ApplyPage } from '@/features/apply/pages/ApplyPage'
import { AuthPage } from '@/features/auth/pages/AuthPage'
import { PinSetupPage } from '@/features/auth/pages/PinSetupPage'
import { HomePage } from '@/features/home/pages/HomePage'
import { LoansPage } from '@/features/loans/pages/LoansPage'
import { OnboardingPage } from '@/features/onboarding/pages/OnboardingPage'
import { PaymentsPage } from '@/features/payments/pages/PaymentsPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
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
