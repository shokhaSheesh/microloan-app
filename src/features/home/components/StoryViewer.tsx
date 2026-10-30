import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Story } from '@/entities/stories/stories'
import { BRAND } from '@/shared/config/brand'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'

const SECONDS = 6

/**
 * A story full screen: bars on top for each one, the icon, title and text. It moves on by itself
 * after a few seconds; a tap on the right goes forward, on the left back, the cross closes it.
 */
export function StoryViewer({
  stories,
  start,
  onSeen,
  onClose,
}: {
  stories: Story[]
  start: number
  onSeen: (story: Story) => void
  onClose: () => void
}) {
  const { t, tl } = useI18n()
  const [index, setIndex] = useState(start)
  const story = stories[index]

  const go = (by: number) => {
    const next = index + by
    if (next < 0) return
    if (next >= stories.length) onClose()
    else {
      onSeen(stories[next])
      setIndex(next)
    }
  }
  useEffect(() => {
    const timer = setTimeout(() => go(1), SECONDS * 1000)
    return () => clearTimeout(timer)
    // Restarts for each story
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  // Over the whole phone frame, tab bar included
  return createPortal(
    <div
      role="dialog"
      aria-label={tl(story.title)}
      className="fixed inset-y-0 left-1/2 z-50 flex w-full max-w-[430px] -translate-x-1/2 flex-col overflow-hidden bg-tile text-on-tile"
    >
      <span
        aria-hidden
        className="absolute -top-32 -right-24 size-96 rounded-full bg-accent-500 opacity-30 blur-3xl"
      />
      <div className="relative flex gap-1 px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        {stories.map((item, i) => (
          <span key={item.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
            <span
              key={i === index ? `run-${index}` : 'still'}
              className={cn(
                'block h-full bg-white',
                i < index ? 'w-full' : i === index ? 'animate-[story_linear_forwards]' : 'w-0',
              )}
              style={i === index ? { animationDuration: `${SECONDS}s` } : undefined}
            />
          </span>
        ))}
      </div>
      <div className="relative flex items-center justify-between px-4 pt-3">
        <span className="text-sm font-semibold opacity-80">{BRAND.name}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="grid size-10 place-items-center rounded-full active:bg-white/15"
        >
          <X size={24} />
        </button>
      </div>
      <div className="relative flex flex-1 flex-col justify-center gap-5 px-7 pb-24">
        <span className="grid size-20 place-items-center rounded-3xl bg-white/15">
          <story.icon size={40} />
        </span>
        <h2 className="text-3xl leading-tight font-bold">{tl(story.title)}</h2>
        <p className="text-lg leading-relaxed opacity-90">{tl(story.text)}</p>
      </div>
      {/* Tap zones: back on the left third, forward on the rest */}
      <button
        type="button"
        aria-label={t('common.back')}
        onClick={() => go(-1)}
        className="absolute top-28 bottom-0 left-0 w-1/3"
      />
      <button
        type="button"
        aria-label={t('stories.next')}
        onClick={() => go(1)}
        className="absolute top-28 right-0 bottom-0 w-2/3"
      />
    </div>,
    document.body,
  )
}
