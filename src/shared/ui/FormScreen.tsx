import { ArrowLeft } from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'

type Props = {
  onSubmit: () => void
  /** Shows a back arrow at the top left when set. */
  onBack?: () => void
  /** Content for the top right corner. */
  headerEnd?: ReactNode
  /** Step indicator for multi-step flows. `step` starts at 1. */
  progress?: { step: number; total: number }
  /** The primary button, pinned to the bottom of the screen. Omit when the body holds the choices. */
  footer?: ReactNode
  children: ReactNode
}

/** The frame for every form and step-by-step flow: top bar, scrolling body, pinned button. */
export function FormScreen({ onSubmit, onBack, headerEnd, progress, footer, children }: Props) {
  const { t } = useI18n()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex h-full flex-col bg-page">
      <header className="flex min-h-10 shrink-0 items-center justify-between gap-4 px-5 pt-[max(0.75rem,env(safe-area-inset-top))]">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label={t('common.back')}
            className="-ml-2 grid size-10 shrink-0 place-items-center rounded-full text-brand active:bg-neutral-100"
          >
            <ArrowLeft size={24} />
          </button>
        ) : (
          <span />
        )}
        {progress && (
          <div
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={progress.total}
            aria-valuenow={progress.step}
            className="flex max-w-40 flex-1 gap-1.5"
          >
            {Array.from({ length: progress.total }, (_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 flex-1 rounded-full',
                  i < progress.step ? 'bg-accent-500' : 'bg-neutral-100',
                )}
              />
            ))}
          </div>
        )}
        {headerEnd ?? <span className="w-8" />}
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pt-6 pb-4">
        {children}
      </div>
      {footer && (
        <footer className="shrink-0 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {footer}
        </footer>
      )}
    </form>
  )
}
