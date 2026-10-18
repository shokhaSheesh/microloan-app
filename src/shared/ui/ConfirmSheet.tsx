import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from './Button'
import { Sheet } from './Sheet'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  message: string
  /** Label of the red button, e.g. "Oʻchirish". */
  confirmLabel: string
  /** Label of the quiet button, when "Bekor qilish" would be confusing. */
  cancelLabel?: string
  onConfirm: () => void
}

/** Asks before something that cannot be undone. Every delete in the app goes through this. */
export function ConfirmSheet({
  open,
  onClose,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
}: Props) {
  const { t } = useI18n()

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4 pt-1 pb-1">
        <p className="text-ink-muted">{message}</p>
        <div className="flex flex-col gap-1">
          <Button variant="ghost" block onClick={onClose}>
            {cancelLabel ?? t('common.cancel')}
          </Button>
          <Button
            variant="danger"
            block
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Sheet>
  )
}
