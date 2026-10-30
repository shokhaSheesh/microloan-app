import { Fingerprint, KeyRound, ScanFace, MonitorSmartphone } from 'lucide-react'
import { useState } from 'react'
import { session, type Biometric } from '@/entities/session/session'
import { BiometricPrompt } from '@/features/auth/components/BiometricPrompt'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { toast } from '@/shared/lib/toast'
import { MenuList, MenuRow } from '@/shared/ui/MenuList'
import { PageHeader } from '@/shared/ui/PageHeader'
import { SwitchRow } from '@/shared/ui/Switch'

/**
 * Xavfsizlik: change the PIN, and sign in with Face ID or the fingerprint instead of it. One of
 * the two at a time; turning one on asks the phone to confirm it first.
 */
export function SecurityPage() {
  const { t } = useI18n()
  const [current, setCurrent] = useState(session.biometric())
  const [asking, setAsking] = useState<Biometric | null>(null)

  const toggle = (kind: Biometric, on: boolean) => {
    if (on) setAsking(kind)
    else {
      session.setBiometric(null)
      setCurrent(null)
      toast(t('security.off'))
    }
  }

  return (
    <div className="flex h-full flex-col bg-page">
      <PageHeader title={t('profile.security')} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-2 pb-6">
        <MenuList>
          <MenuRow
            icon={KeyRound}
            label={t('security.changePin')}
            to={`${ROUTES.pinSetup}?change=1`}
          />
          <MenuRow icon={MonitorSmartphone} label={t('sessions.title')} to={ROUTES.sessions} />
        </MenuList>
        <MenuList>
          <SwitchRow
            icon={ScanFace}
            label={t('quick.face')}
            description={t('quick.face.hint')}
            checked={current === 'face'}
            onChange={(on) => toggle('face', on)}
          />
          <SwitchRow
            icon={Fingerprint}
            label={t('quick.finger')}
            description={t('quick.finger.hint')}
            checked={current === 'finger'}
            onChange={(on) => toggle('finger', on)}
          />
        </MenuList>
      </div>
      {asking && (
        <BiometricPrompt
          kind={asking}
          onSuccess={() => {
            session.setBiometric(asking)
            setCurrent(asking)
            setAsking(null)
            toast(t('security.on'))
          }}
          onCancel={() => setAsking(null)}
        />
      )}
    </div>
  )
}
