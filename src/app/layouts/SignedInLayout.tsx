import { Navigate, Outlet } from 'react-router-dom'
import { session, useBorrower } from '@/entities/session/session'
import { ROUTES } from '@/shared/config/routes'

/** Every screen behind sign-in: without a borrower and a PIN on this phone, back to the start. */
export function SignedInLayout() {
  const borrower = useBorrower()
  if (!borrower || !session.hasPin()) return <Navigate to={ROUTES.auth} replace />
  return <Outlet />
}
