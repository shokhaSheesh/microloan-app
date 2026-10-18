import type { LucideIcon } from 'lucide-react'

export function IconBadge({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="grid size-14 shrink-0 place-items-center rounded-full bg-accent-200 text-brand">
      <Icon size={26} />
    </span>
  )
}
