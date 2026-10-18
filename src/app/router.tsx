import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthPage } from '@/features/auth/pages/AuthPage'
import { PinSetupPage } from '@/features/auth/pages/PinSetupPage'
import { HomePage } from '@/features/home/pages/HomePage'
import { ROUTES } from '@/shared/config/routes'
import { DeviceLayout } from './layouts/DeviceLayout'

export const router = createBrowserRouter([
  {
    element: <DeviceLayout />,
    children: [
      { path: ROUTES.auth, element: <AuthPage /> },
      { path: ROUTES.pinSetup, element: <PinSetupPage /> },
      { path: ROUTES.home, element: <HomePage /> },
      { path: '*', element: <Navigate to={ROUTES.auth} replace /> },
    ],
  },
])
