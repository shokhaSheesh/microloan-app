import { Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useBorrower } from '@/entities/session/session'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone } from '@/shared/lib/phone'
import { InfoList, InfoRow } from '@/shared/ui/InfoList'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Section } from '@/shared/ui/Section'

/** The borrower as MyID confirmed them, read only, and the phone number, which they can change. */
export function PersonalPage() {
  const { t } = useI18n()
  const borrower = useBorrower()
  if (!borrower) return null
  return (
    <div className="flex h-full flex-col bg-page">
      <PageHeader title={t('profile.personal')} />
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pt-2 pb-6">
        <InfoList>
          <InfoRow label={t('myid.name')} value={borrower.fullName} />
          <InfoRow label={t('myid.birth')} value={borrower.birthDate} />
          <InfoRow
            label={t('myid.document')}
            value={`${borrower.passport.slice(0, 2)} ${borrower.passport.slice(2)}`}
          />
          <InfoRow label={t('myid.address')} value={borrower.address} />
        </InfoList>
        <Section title={t('personal.contact')}>
          <div className="flex items-center gap-3 rounded-card border border-line bg-canvas p-4">
            <Phone size={22} className="shrink-0 text-brand" />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm text-ink-muted">{t('field.phone')}</span>
              <span className="font-semibold tabular-nums">{formatPhone(borrower.phone)}</span>
            </div>
            <Link
              to={ROUTES.changePhone}
              className="h-10 rounded-full border border-line px-4 text-sm leading-10 font-semibold text-brand active:bg-neutral-100"
            >
              {t('personal.change')}
            </Link>
          </div>
        </Section>
      </div>
    </div>
  )
}
