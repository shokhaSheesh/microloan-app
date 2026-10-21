import { useState } from 'react'
import {
  REFUSAL_REASONS,
  updateAriza,
  type RefusalReason,
} from '@/entities/applications/applications'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { toast } from '@/shared/lib/toast'
import { Button } from '@/shared/ui/Button'
import { Sheet } from '@/shared/ui/Sheet'
import { TextAreaField } from '@/shared/ui/TextAreaField'

type Props = {
  owner: string
  arizaId: string
  onClose: () => void
  onRefused?: () => void
}

/**
 * Turning an approved offer down: one of the reason templates (required), and the borrower's
 * own words when it is "Boshqa sabab". The brand's admin sees the reason on the ariza.
 */
export function RefuseSheet({ owner, arizaId, onClose, onRefused }: Props) {
  const { t } = useI18n()
  const [reason, setReason] = useState<RefusalReason | null>(null)
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const needsNote = reason === 'other' && !note.trim()

  const refuse = () => {
    setSubmitted(true)
    if (!reason || needsNote) return
    updateAriza(owner, arizaId, {
      status: 'refused',
      refusal: { reason, note: reason === 'other' ? note.trim() : undefined },
    })
    toast(t('refuse.done'))
    onClose()
    onRefused?.()
  }

  return (
    <Sheet open onClose={onClose} title={t('refuse.title')}>
      <div className="flex flex-col gap-4 pt-1 pb-1">
        <div role="radiogroup" aria-label={t('refuse.title')} className="flex flex-col gap-2">
          {REFUSAL_REASONS.map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={reason === value}
              onClick={() => setReason(value)}
              className={cn(
                'flex items-center gap-3 rounded-control border-[1.5px] bg-canvas p-3.5 text-left font-medium',
                reason === value ? 'border-primary' : 'border-line',
              )}
            >
              <span className="flex-1">{t(`refuse.reason.${value}`)}</span>
              <span
                className={cn(
                  'grid size-5 place-items-center rounded-full border-2',
                  reason === value ? 'border-primary' : 'border-neutral-400',
                )}
              >
                {reason === value && <span className="size-2.5 rounded-full bg-primary" />}
              </span>
            </button>
          ))}
          {submitted && !reason && <p className="text-sm text-danger">{t('refuse.required')}</p>}
        </div>
        {reason === 'other' && (
          <TextAreaField
            label={t('refuse.note')}
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            error={submitted && needsNote ? t('error.required') : undefined}
          />
        )}
        <div className="flex flex-col gap-1">
          <Button variant="ghost" block onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" block onClick={refuse}>
            {t('refuse.confirm')}
          </Button>
        </div>
      </div>
    </Sheet>
  )
}
