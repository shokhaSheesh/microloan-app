import { Check, ReceiptText } from 'lucide-react'
import { useState } from 'react'
import { BRAND } from '@/shared/config/brand'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatDateTime, formatSum } from '@/shared/lib/format'
import { Button } from '@/shared/ui/Button'
import { FiscalReceipt } from '@/shared/ui/FiscalReceipt'
import { InfoList, InfoRow } from '@/shared/ui/InfoList'
import { Sheet } from '@/shared/ui/Sheet'

/** One payment from Toʻlovlar tarixi. A monthly one also says how much of it was interest. */
export type PaidItem = {
  key: string
  at: Date
  amount: number
  label: string
  card: string
  product: string
  contract: string
  principal?: number
  interest?: number
}

/** A payment's details, and its fiscal cheque one tap away in the same sheet. */
export function PaymentDetailSheet({ item, onClose }: { item: PaidItem; onClose: () => void }) {
  const { t } = useI18n()
  const [receipt, setReceipt] = useState(false)

  if (receipt)
    return (
      <Sheet open onClose={onClose} title={t('receipt.title')}>
        <div className="flex flex-col gap-3 overflow-y-auto pb-2">
          <FiscalReceipt
            receipt={{
              seller: BRAND.name,
              tin: BRAND.tin,
              title: item.label,
              amount: item.amount,
              at: item.at,
              card: item.card,
              seed: item.key,
            }}
          />
          <Button variant="ghost" block onClick={() => setReceipt(false)}>
            {t('common.back')}
          </Button>
        </div>
      </Sheet>
    )

  return (
    <Sheet open onClose={onClose} title={t('history.detail')}>
      <div className="flex flex-col gap-5 overflow-y-auto pb-2">
        <div className="flex flex-col items-center gap-2 pt-1 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-success-soft text-success">
            <Check size={28} strokeWidth={2.5} />
          </span>
          <span className="text-3xl font-bold tabular-nums">{formatSum(item.amount)}</span>
          <span className="text-sm text-ink-muted">{item.label}</span>
        </div>
        <InfoList>
          <InfoRow label={t('history.status')} value={t('history.status.paid')} />
          <InfoRow label={t('history.date')} value={formatDateTime(item.at)} />
          <InfoRow label={t('history.card')} value={item.card} />
          <InfoRow label={t('history.loan')} value={item.product} />
          <InfoRow label={t('loan.number')} value={item.contract} />
          {item.principal !== undefined && (
            <InfoRow label={t('history.principal')} value={formatSum(item.principal)} />
          )}
          {item.interest !== undefined && (
            <InfoRow label={t('history.interest')} value={formatSum(item.interest)} />
          )}
        </InfoList>
        <Button variant="secondary" block onClick={() => setReceipt(true)}>
          <ReceiptText size={20} />
          {t('receipt.show')}
        </Button>
      </div>
    </Sheet>
  )
}
