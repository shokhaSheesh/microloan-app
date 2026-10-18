import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '@/shared/i18n/useI18n'

type Props = {
  title?: string
  /** Icon buttons for the top right corner. */
  end?: ReactNode
}

/** Top bar of a pushed screen: back arrow, a short title, and optional actions on the right. */
export function PageHeader({ title, end }: Props) {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <header className="flex shrink-0 items-center gap-2 px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label={t('common.back')}
        className="-ml-2 grid size-10 shrink-0 place-items-center rounded-full text-brand active:bg-neutral-100"
      >
        <ArrowLeft size={24} />
      </button>
      <h1 className="min-w-0 flex-1 truncate text-lg font-bold">{title}</h1>
      {end && <div className="-mr-2 flex shrink-0 items-center">{end}</div>}
    </header>
  )
}
