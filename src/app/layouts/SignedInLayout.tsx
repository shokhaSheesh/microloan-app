import { useEffect, useState } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { session, useBorrower } from '@/entities/session/session'
import { PinLock } from '@/features/auth/components/PinLock'
import { ROUTES } from '@/shared/config/routes'

/** No touch or key for this long locks the app (Nizom: 3 minutes). */
export const IDLE_LOCK_MS = 3 * 60_000
const ACTIVITY = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const

/**
 * Every screen behind sign-in: without a borrower and a PIN on this phone, back to the start.
 * After 3 minutes without a touch the lock screen covers the app; the PIN or Face ID opens it
 * again on the same screen, with what was typed still there.
 */
export function SignedInLayout() {
  const borrower = useBorrower()
  const navigate = useNavigate()
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    if (locked) return
    let timer = setTimeout(() => setLocked(true), IDLE_LOCK_MS)
    const restart = () => {
      clearTimeout(timer)
      timer = setTimeout(() => setLocked(true), IDLE_LOCK_MS)
    }
    ACTIVITY.forEach((name) =>
      window.addEventListener(name, restart, { capture: true, passive: true }),
    )
    return () => {
      clearTimeout(timer)
      ACTIVITY.forEach((name) => window.removeEventListener(name, restart, { capture: true }))
    }
  }, [locked])

  if (!borrower || !session.hasPin()) return <Navigate to={ROUTES.auth} replace />
  return (
    <div className="relative h-full">
      <Outlet />
      {locked && (
        <div className="absolute inset-0 z-50">
          <PinLock
            onUnlock={() => setLocked(false)}
            onSignIn={() => navigate(ROUTES.auth, { replace: true })}
          />
        </div>
      )}
    </div>
  )
}
