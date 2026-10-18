import { ShieldCheck } from 'lucide-react'
import { useBorrower } from '@/entities/session/session'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone } from '@/shared/lib/phone'
import { InfoList, InfoRow } from '@/shared/ui/InfoList'
import { PageHeader } from '@/shared/ui/PageHeader'

/** The borrower as MyID confirmed them. Read only: a change goes through MyID again. */
export function PersonalPage() {
  const { t } = useI18n()
  const borrower = useBorrower()
  if (!borrower) return null
  return (
    <div className="flex h-full flex-col bg-page">
      <PageHeader title={t('profile.personal')} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-2 pb-6">
        <InfoList>
          <InfoRow label={t('myid.name')} value={borrower.fullName} />
          <InfoRow label={t('myid.birth')} value={borrower.birthDate} />
          <InfoRow
            label={t('myid.document')}
            value={`${borrower.passport.slice(0, 2)} ${borrower.passport.slice(2)}`}
          />
          <InfoRow label={t('myid.address')} value={borrower.address} />
          <InfoRow label={t('field.phone')} value={formatPhone(borrower.phone)} />
        </InfoList>
        <p className="flex items-start gap-2.5 px-1 text-sm text-ink-muted">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-success" />
          {t('personal.note')}
        </p>
      </div>
    </div>
  )
}
