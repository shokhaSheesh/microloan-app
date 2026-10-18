import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import type { TranslationKey } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'

export type Tab = {
  to: string
  label: TranslationKey
  icon: LucideIcon
  center?: boolean
  /** A count shown on the icon, e.g. items in the cart. Hidden at zero. */
  badge?: number
}

/** Floating glass tab bar. A tab marked `center` is drawn as a raised round button. */
export function TabBar({ tabs }: { tabs: Tab[] }) {
  const { t } = useI18n()

  return (
    <nav className="pointer-events-none absolute inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="glass pointer-events-auto flex h-16 items-center rounded-full px-2">
        {tabs.map(({ to, label, icon: Icon, center, badge }) =>
          center ? (
            <NavLink key={to} to={to} aria-label={t(label)} className="flex flex-1 justify-center">
              <span className="relative grid size-14 -translate-y-3 place-items-center rounded-full bg-primary text-on-primary shadow-[0_8px_18px_-6px_rgb(24_25_29/0.55)] ring-4 ring-canvas transition-transform active:scale-95">
                <Icon size={26} />
                {!!badge && (
                  <span className="absolute -top-1 -right-1 grid h-5.5 min-w-5.5 place-items-center rounded-full bg-accent-500 px-1 text-xs font-bold text-neutral-950 ring-2 ring-canvas">
                    {badge}
                  </span>
                )}
              </span>
            </NavLink>
          ) : (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                cn(
                  'flex h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-medium transition-colors',
                  isActive ? 'bg-primary/10 font-semibold text-primary' : 'text-ink-muted',
                )
              }
            >
              <Icon size={22} strokeWidth={2} />
              <span className="max-w-full truncate px-1">{t(label)}</span>
            </NavLink>
          ),
        )}
      </div>
    </nav>
  )
}
