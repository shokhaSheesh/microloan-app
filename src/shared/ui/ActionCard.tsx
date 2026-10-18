import { ChevronRight, type LucideIcon } from 'lucide-react'

type Props = {
  icon: LucideIcon
  title: string
  description?: string
  onClick: () => void
}

/** A large tappable choice. Used when a screen offers two or three ways to continue. */
export function ActionCard({ icon: Icon, title, description, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-card border border-line bg-canvas p-4 text-left transition-colors focus-visible:ring-3 focus-visible:ring-accent-200 focus-visible:outline-none active:bg-neutral-100"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-surface text-brand">
        <Icon size={24} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-semibold">{title}</span>
        {description && <span className="text-sm text-ink-muted">{description}</span>}
      </span>
      <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
    </button>
  )
}
