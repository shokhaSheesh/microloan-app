import { Phone } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MARITAL_STATUSES,
  session,
  useBorrower,
  type Borrower,
  type MaritalStatus,
} from '@/entities/session/session'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone } from '@/shared/lib/phone'
import { toast } from '@/shared/lib/toast'
import { Button } from '@/shared/ui/Button'
import { InfoList, InfoRow } from '@/shared/ui/InfoList'
import { NumberField } from '@/shared/ui/NumberField'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Section } from '@/shared/ui/Section'
import { Select } from '@/shared/ui/Select'

/**
 * The borrower as MyID confirmed them, read only; marital status and income from sign-up, which
 * they can update here instead of in every ariza; and the phone number, which they can change.
 */
export function PersonalPage() {
  const { t } = useI18n()
  const borrower = useBorrower()
  if (!borrower) return null
  return (
    <div className="flex h-full flex-col bg-page">
      <PageHeader sample title={t('profile.personal')} />
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
        <ExtraFields
          key={`${borrower.maritalStatus}-${borrower.monthlyIncome}`}
          borrower={borrower}
        />
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

function ExtraFields({ borrower }: { borrower: Borrower }) {
  const { t } = useI18n()
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus | null>(
    borrower.maritalStatus ?? null,
  )
  const [monthlyIncome, setMonthlyIncome] = useState<number | null>(borrower.monthlyIncome ?? null)
  const changed =
    maritalStatus !== (borrower.maritalStatus ?? null) ||
    monthlyIncome !== (borrower.monthlyIncome ?? null)
  const save = () => {
    if (!maritalStatus || !monthlyIncome) return
    session.setBorrower({ ...borrower, maritalStatus, monthlyIncome })
    toast(t('personal.saved'))
  }
  return (
    <Section title={t('personal.extra')}>
      <div className="flex flex-col gap-4">
        <Select
          label={t('field.maritalStatus')}
          options={MARITAL_STATUSES.map((value) => ({ value, label: t(`marital.${value}`) }))}
          value={maritalStatus}
          onChange={setMaritalStatus}
        />
        <NumberField
          label={t('field.monthlyIncome')}
          value={monthlyIncome}
          onChange={setMonthlyIncome}
          suffix={t('common.currency')}
          hint={t('field.monthlyIncome.hint')}
          error={!monthlyIncome ? t('error.required') : undefined}
        />
        {changed && (
          <Button block disabled={!maritalStatus || !monthlyIncome} onClick={save}>
            {t('common.save')}
          </Button>
        )}
      </div>
    </Section>
  )
}
