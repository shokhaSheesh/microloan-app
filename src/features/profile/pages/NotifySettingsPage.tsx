import { useState } from 'react'
import { NOTIFY_KEYS, session } from '@/entities/session/session'
import { useI18n } from '@/shared/i18n/useI18n'
import { MenuList } from '@/shared/ui/MenuList'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Section } from '@/shared/ui/Section'
import { SwitchRow } from '@/shared/ui/Switch'

/** Which messages arrive, as push and as SMS: payments, the application, news. */
export function NotifySettingsPage() {
  const { t } = useI18n()
  const [prefs, setPrefs] = useState(session.notify)

  return (
    <div className="flex h-full flex-col bg-page">
      <PageHeader title={t('profile.notifications')} />
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pt-2 pb-6">
        {(['push', 'sms'] as const).map((channel) => (
          <Section key={channel} title={t(`notify.${channel}`)}>
            <MenuList>
              {NOTIFY_KEYS.map((kind) => {
                const key = `${kind}.${channel}` as const
                return (
                  <SwitchRow
                    key={key}
                    label={t(`notify.${kind}`)}
                    description={t(`notify.${kind}.hint`)}
                    checked={prefs[key]}
                    onChange={(on) => {
                      const next = { ...prefs, [key]: on }
                      setPrefs(next)
                      session.setNotify(next)
                    }}
                  />
                )
              })}
            </MenuList>
          </Section>
        ))}
        <p className="px-1 text-sm text-ink-muted">{t('notify.note')}</p>
      </div>
    </div>
  )
}
