import { LogOut, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { sessionsStore, type Session } from '@/entities/session/sessions'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatDateTime } from '@/shared/lib/format'
import { toast } from '@/shared/lib/toast'
import { Button } from '@/shared/ui/Button'
import { ConfirmSheet } from '@/shared/ui/ConfirmSheet'
import { PageHeader } from '@/shared/ui/PageHeader'
import { StatusBadge } from '@/shared/ui/StatusBadge'

/**
 * Profil → Aktiv sessiyalar: every phone signed in to this account, this one first
 * and marked. Any other can be ended; it is signed out at once and needs the password and MyID
 * again.
 */
export function SessionsPage() {
  const { t } = useI18n()
  const sessions = sessionsStore.useAll()
  const [ending, setEnding] = useState<Session | null>(null)
  const sorted = [...sessions].sort(
    (a, b) => Number(!!b.current) - Number(!!a.current) || +b.startedAt - +a.startedAt,
  )

  return (
    <div className="flex h-full flex-col bg-page">
      <PageHeader title={t('sessions.title')} />
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pt-2 pb-6">
        <p className="text-sm text-ink-muted">{t('sessions.hint')}</p>
        {sorted.map((session) => (
          <div
            key={session.id}
            className="flex flex-col gap-3 rounded-card border border-line bg-canvas p-4"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent-200 text-brand">
                <Smartphone size={22} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{session.device}</p>
                  {session.current && (
                    <StatusBadge tone="success">{t('sessions.current')}</StatusBadge>
                  )}
                </div>
                <p className="text-sm text-ink-muted">
                  {session.os} · {session.client}
                </p>
                <p className="text-sm text-ink-muted tabular-nums">
                  IP {session.ip} · {formatDateTime(session.startedAt)}
                </p>
              </div>
            </div>
            {!session.current && (
              <Button
                variant="secondary"
                block
                className="text-danger!"
                onClick={() => setEnding(session)}
              >
                <LogOut size={20} />
                {t('sessions.end')}
              </Button>
            )}
          </div>
        ))}
      </div>

      <ConfirmSheet
        open={!!ending}
        onClose={() => setEnding(null)}
        title={t('sessions.end.title')}
        message={t('sessions.end.message', { device: ending?.device ?? '' })}
        confirmLabel={t('sessions.end')}
        onConfirm={() => {
          if (!ending) return
          sessionsStore.remove(ending.id)
          toast(t('sessions.ended'))
        }}
      />
    </div>
  )
}
