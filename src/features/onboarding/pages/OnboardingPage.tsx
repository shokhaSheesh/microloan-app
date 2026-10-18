import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SLIDES } from '@/entities/onboarding/slides'
import { session } from '@/entities/session/session'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { SlideArt } from '../components/SlideArt'

/**
 * The intro, shown once after the first sign-in: full-screen slides swiped sideways, each with
 * the admin's image (or the drawn one), a title and a line. "Oʻtkazib yuborish" skips it.
 */
export function OnboardingPage() {
  const { t, tl, lang } = useI18n()
  const navigate = useNavigate()
  const strip = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const last = index === SLIDES.length - 1

  const done = () => {
    session.setOnboarded()
    navigate(ROUTES.home, { replace: true })
  }
  const next = () => {
    const el = strip.current
    if (last || !el) done()
    else el.scrollTo({ left: (index + 1) * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="flex h-full flex-col bg-page pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div className="flex h-10 shrink-0 items-center justify-end px-5">
        {!last && (
          <button
            type="button"
            onClick={done}
            className="h-10 rounded-full px-3 text-sm font-semibold text-ink-muted active:bg-neutral-100"
          >
            {t('onboarding.skip')}
          </button>
        )}
      </div>

      <div
        ref={strip}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={(e) =>
          setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))
        }
      >
        {SLIDES.map((slide) => (
          <section
            key={slide.id}
            className="flex w-full shrink-0 snap-center flex-col items-center justify-center gap-8 px-8 text-center"
          >
            {slide.image?.[lang] ? (
              <img
                src={slide.image[lang]}
                alt=""
                className="aspect-[280/230] w-full max-w-80 rounded-card object-cover"
              />
            ) : (
              <SlideArt art={slide.art} className="w-full max-w-80" />
            )}
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl leading-tight font-bold text-balance">{tl(slide.title)}</h1>
              <p className="text-ink-muted">{tl(slide.text)}</p>
            </div>
          </section>
        ))}
      </div>

      <div className="flex shrink-0 flex-col items-center gap-6 px-5 pt-4">
        <div aria-hidden className="flex gap-1.5">
          {SLIDES.map((slide, i) => (
            <span
              key={slide.id}
              className={cn(
                'h-2 rounded-full transition-all',
                i === index ? 'w-6 bg-primary' : 'w-2 bg-neutral-200',
              )}
            />
          ))}
        </div>
        <Button block onClick={next}>
          {t(last ? 'onboarding.start' : 'onboarding.next')}
        </Button>
      </div>
    </div>
  )
}
