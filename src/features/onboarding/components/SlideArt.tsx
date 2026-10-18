import type { ReactNode } from 'react'
import type { SlideArt as Art } from '@/entities/onboarding/slides'

const line = {
  strokeWidth: 4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
} as const

/** What is drawn on the card for each slide, in the brand's colours. */
const motifs: Record<Art, ReactNode> = {
  // The calculator: an amount, a slider and term chips, one chosen
  calculator: (
    <>
      <rect x="70" y="58" width="60" height="9" rx="4.5" className="fill-neutral-200" />
      <rect x="70" y="76" width="130" height="20" rx="10" className="fill-ink" />
      <rect x="70" y="114" width="150" height="8" rx="4" className="fill-neutral-100" />
      <rect x="70" y="114" width="96" height="8" rx="4" className="fill-primary" />
      <circle cx="166" cy="118" r="11" className="fill-canvas stroke-primary" strokeWidth="5" />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={70 + i * 38}
          y="142"
          width="32"
          height="22"
          rx="8"
          className={i === 1 ? 'fill-accent-500' : 'fill-neutral-100'}
        />
      ))}
    </>
  ),
  // The decision: a form with a big tick on it
  decision: (
    <>
      <rect x="78" y="56" width="104" height="120" rx="14" className="fill-surface" />
      {[78, 96, 114].map((y) => (
        <rect
          key={y}
          x="94"
          y={y}
          width={y === 114 ? 44 : 72}
          height="8"
          rx="4"
          className="fill-neutral-200"
        />
      ))}
      <circle cx="176" cy="150" r="30" className="fill-accent-500" />
      <path d="M162 150l10 10 18-20" className="stroke-white" {...line} strokeWidth="6" />
    </>
  ),
  // Money to the card: a bank card and an arrow coming into it
  card: (
    <>
      <rect x="62" y="84" width="150" height="92" rx="14" className="fill-ink" />
      <rect x="78" y="104" width="26" height="20" rx="5" className="fill-accent-300" />
      <rect x="78" y="146" width="80" height="8" rx="4" className="fill-neutral-400" />
      <circle cx="196" cy="70" r="26" className="fill-primary" />
      <path d="M196 56v26M184 72l12 12 12-12" className="stroke-white" {...line} />
    </>
  ),
  // Repaying: a calendar, paid days ticked, the next one marked
  repay: (
    <>
      <rect x="66" y="56" width="148" height="122" rx="14" className="fill-surface" />
      <rect x="66" y="56" width="148" height="26" rx="13" className="fill-ink" />
      {Array.from({ length: 8 }, (_, i) => {
        const x = 82 + (i % 4) * 32
        const y = 96 + Math.floor(i / 4) * 36
        return i < 5 ? (
          <g key={i}>
            <circle cx={x + 10} cy={y + 12} r="12" className="fill-accent-200" />
            <path
              d={`M${x + 4} ${y + 12}l4 4 8-8`}
              className="stroke-brand"
              {...line}
              strokeWidth="3"
            />
          </g>
        ) : (
          <circle
            key={i}
            cx={x + 10}
            cy={y + 12}
            r="12"
            className={i === 5 ? 'fill-primary' : 'fill-neutral-100'}
          />
        )
      })}
    </>
  ),
}

/** A soft round card with the brand's bars behind it and the slide's motif on it. */
export function SlideArt({ art, className }: { art: Art; className?: string }) {
  return (
    <svg viewBox="0 0 280 230" className={className} aria-hidden>
      <rect x="18" y="28" width="96" height="22" rx="0" className="fill-accent-500" opacity="0.9" />
      <path
        d="M190 192H246A14 14 0 0 1 260 206V206A14 14 0 0 1 246 220H190Z"
        className="fill-primary"
      />
      <rect
        x="40"
        y="36"
        width="200"
        height="164"
        rx="26"
        className="fill-canvas stroke-line"
        strokeWidth="2"
      />
      {motifs[art]}
    </svg>
  )
}
