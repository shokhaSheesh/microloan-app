import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { banners } from '@/entities/banners/banners'
import { applyPath, creditsPath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'

/**
 * The banners on Asosiy, where the product cards used to be: swiped sideways, the next one
 * peeking in, dots under them. An uploaded picture fills the banner; a seeded one is drawn from
 * its title. One product opens its calculator, several open Kreditlar
 * with just those. Light and dark alternate.
 */
export function BannerCarousel() {
  const { t, tl, lang } = useI18n()
  const row = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)

  const onScroll = () => {
    const el = row.current
    const first = el?.firstElementChild as HTMLElement | null
    if (!el || !first) return
    setCurrent(Math.round(el.scrollLeft / (first.offsetWidth + 12)))
  }

  return (
    <section aria-label={t('home.banners')} className="flex flex-col gap-2.5">
      <div
        ref={row}
        onScroll={onScroll}
        className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 [scrollbar-width:none]"
      >
        {banners.map((banner, index) => {
          const dark = index % 2 === 1
          const to =
            banner.productIds.length === 1
              ? applyPath(banner.productIds[0])
              : creditsPath(banner.productIds)
          const image = banner.image?.[lang] ?? Object.values(banner.image ?? {})[0]
          if (image)
            return (
              <Link
                key={banner.id}
                to={to}
                aria-label={tl(banner.title)}
                className="h-38 w-[82%] shrink-0 snap-start overflow-hidden rounded-card"
              >
                <img src={image} alt="" className="size-full object-cover" />
              </Link>
            )
          return (
            <Link
              key={banner.id}
              to={to}
              className={cn(
                'flex h-38 w-[82%] shrink-0 snap-start flex-col justify-between rounded-card p-4.5',
                dark ? 'bg-tile text-on-tile' : 'bg-accent-200 text-ink',
              )}
            >
              <span className="text-lg leading-tight font-bold">{tl(banner.title)}</span>
              <span
                className={cn(
                  'self-start rounded-full px-3.5 py-1.5 text-sm font-semibold',
                  dark ? 'bg-white text-neutral-950' : 'bg-canvas text-brand',
                )}
              >
                {t('home.banner.more')}
              </span>
            </Link>
          )
        })}
      </div>
      {banners.length > 1 && (
        <div aria-hidden className="flex justify-center gap-1.5">
          {banners.map((banner, index) => (
            <span
              key={banner.id}
              className={cn(
                'h-1.5 rounded-full transition-all',
                index === current ? 'w-5 bg-brand' : 'w-1.5 bg-neutral-200',
              )}
            />
          ))}
        </div>
      )}
    </section>
  )
}
