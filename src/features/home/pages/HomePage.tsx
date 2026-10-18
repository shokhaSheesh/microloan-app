import { LogOut } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { session, useBorrower } from '@/entities/session/session'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { BrandLogo } from '@/shared/ui/BrandMark'
import { Button } from '@/shared/ui/Button'

/** Placeholder until the loan screens are designed: who is signed in, and a way out. */
export function HomePage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const borrower = useBorrower()
  if (!borrower || !session.hasPin()) return <Navigate to={ROUTES.auth} replace />

  return (
    <div className="flex h-full flex-col gap-6 bg-page px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <BrandLogo />
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{t('home.greeting', { name: borrower.firstName })}</h1>
        <p className="text-ink-muted">{t('home.soon')}</p>
      </div>
      <div className="mt-auto">
        <Button
          variant="secondary"
          block
          onClick={() => {
            session.signOut()
            navigate(ROUTES.auth, { replace: true })
          }}
        >
          <LogOut size={20} />
          {t('home.signOut')}
        </Button>
      </div>
    </div>
  )
}
