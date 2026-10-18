import { ChevronRight, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

/** A card of navigation rows, e.g. the sections of the Menyu tab. */
export function MenuList({ children }: { children: ReactNode }) {
  return <ul className="rounded-card border border-line bg-canvas px-4">{children}</ul>
}

type RowProps = {
  icon: LucideIcon
  label: string
  to: string
  /** The current setting, shown greyed before the chevron, e.g. "Tizim". */
  value?: string
}

export function MenuRow({ icon: Icon, label, to, value }: RowProps) {
  return (
    <li className="border-b border-line last:border-b-0">
      <Link to={to} className="flex min-h-13 items-center gap-3 py-2">
        <Icon size={22} className="shrink-0 text-brand" />
        <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
        {value && <span className="shrink-0 text-ink-muted">{value}</span>}
        <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
      </Link>
    </li>
  )
}
