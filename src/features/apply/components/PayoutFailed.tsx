import { Clock } from 'lucide-react'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum } from '@/shared/lib/format'
import { ResultScreen } from '@/shared/ui/ResultScreen'

/**
 * Atmos could not send the money: the contract is signed, the payout is retried in the background
 * and an SMS comes when it arrives. The ariza shows «Pul qayta yuborilmoqda» meanwhile.
 */
export function PayoutFailed({
  amount,
  card,
  onDone,
  onBack,
}: {
  amount: number
  card: string
  onDone: () => void
  onBack?: () => void
}) {
  const { t } = useI18n()
  return (
    <ResultScreen
      tone="warning"
      icon={Clock}
      title={t('payoutFailed.title')}
      text={t('payoutFailed.text', { sum: formatSum(amount), card })}
      note={t('payoutFailed.schedule')}
      primary={{ label: t('payoutFailed.toArizalar'), onClick: onDone }}
      onBack={onBack}
    />
  )
}
