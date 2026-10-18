import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { session } from '@/entities/session/session'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from '@/shared/ui/Button'
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher'
import { ScreenStub } from '@/shared/ui/ScreenStub'

/** Designed in a later step; for now the language and a way out, for testing. */
export function ProfilePage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  return (
    <div className="flex flex-col gap-6 pb-tabbar">
      <ScreenStub title={t('nav.profile')} />
      <div className="flex flex-col items-start gap-4 px-5">
        <LanguageSwitcher />
        <Button
          variant="secondary"
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
