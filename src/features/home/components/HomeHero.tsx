import { Bell } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Borrower } from '@/entities/session/session'
import { STORIES, type Story } from '@/entities/stories/stories'
import { BRAND } from '@/shared/config/brand'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { StoryViewer } from './StoryViewer'

// Opened tiles stay marked as seen while the app runs
const seen = new Set<string>()

/**
 * The top of Asosiy in the brand's theme: the brand colour with soft circles, the greeting and
 * the bell, and the story tiles (like AVO's) in a row that scrolls sideways. A tile opens its
 * story; unseen ones have a bright ring.
 */
export function HomeHero({ borrower, unread }: { borrower: Borrower; unread: boolean }) {
  const { t, tl } = useI18n()
  const [open, setOpen] = useState<number | null>(null)
  const [, rerender] = useState(0)
  const initials = borrower.fullName
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
  const show = (story: Story) => {
    seen.add(story.id)
    rerender((n) => n + 1)
  }

  return (
    <section className="relative -mx-5 overflow-hidden rounded-b-[32px] bg-tile px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5 text-on-tile">
      {/* The theme: two soft circles in the accent colour */}
      <span
        aria-hidden
        className="absolute -top-24 -right-16 size-64 rounded-full bg-accent-500 opacity-30 blur-2xl"
      />
      <span
        aria-hidden
        className="absolute -bottom-20 -left-20 size-56 rounded-full bg-primary opacity-20 blur-2xl"
      />

      <header className="relative flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/15 text-sm font-bold">
          {initials}
        </span>
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <p className="truncate text-lg font-bold">
            {t('home.greeting', { name: borrower.firstName })}
          </p>
          <p className="text-sm opacity-70">{BRAND.name}</p>
        </div>
        <Link
          to={ROUTES.notifications}
          aria-label={t('home.notifications')}
          className="relative grid size-11 place-items-center rounded-full bg-white/15 active:bg-white/25"
        >
          <Bell size={22} />
          {unread && (
            <span className="absolute top-2.5 right-2.5 size-2.5 rounded-full bg-primary ring-2 ring-tile" />
          )}
        </Link>
      </header>

      <ul
        aria-label={t('home.stories')}
        className="relative -mx-5 mt-4 flex gap-3 overflow-x-auto px-5 py-1 [scrollbar-width:none]"
      >
        {STORIES.map((story, i) => (
          <li key={story.id} className="shrink-0">
            <button
              type="button"
              onClick={() => {
                show(story)
                setOpen(i)
              }}
              className={cn(
                'flex size-[84px] flex-col justify-between rounded-2xl bg-white/12 p-2.5 text-left ring-2 transition-colors active:bg-white/20',
                seen.has(story.id) ? 'ring-white/15' : 'ring-accent-300',
              )}
            >
              <story.icon size={22} />
              <span className="line-clamp-2 text-xs leading-tight font-bold">
                {tl(story.title)}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {open !== null && (
        <StoryViewer stories={STORIES} start={open} onSeen={show} onClose={() => setOpen(null)} />
      )}
    </section>
  )
}
