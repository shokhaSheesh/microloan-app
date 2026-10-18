import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { OVERLAY_ROOT_ID } from '@/shared/config/overlay'
import { useI18n } from '@/shared/i18n/useI18n'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/** Bottom sheet. Every picker (dropdown, calendar, language) opens in one of these. */
export function Sheet({ open, onClose, title, children }: Props) {
  const { t } = useI18n()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const root = open ? document.getElementById(OVERLAY_ROOT_ID) : null
  if (!root) return null

  return createPortal(
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="sheet-backdrop absolute inset-0 bg-neutral-950/45" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="sheet-panel relative flex max-h-[85%] flex-col rounded-t-[28px] bg-canvas px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto mb-2 h-1 w-10 shrink-0 rounded-full bg-neutral-200" />
        <div className="mb-2 flex shrink-0 items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="-mr-2 grid size-10 place-items-center rounded-full text-ink-muted active:bg-neutral-100"
          >
            <X size={22} />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto">{children}</div>
      </div>
    </div>,
    root,
  )
}
