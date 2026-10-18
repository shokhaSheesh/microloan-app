import { useI18n } from '@/shared/i18n/useI18n'
import { ScreenStub } from '@/shared/ui/ScreenStub'

/** Designed in a later step. */
export function PaymentsPage() {
  const { t } = useI18n()
  return <ScreenStub title={t('nav.payments')} />
}
