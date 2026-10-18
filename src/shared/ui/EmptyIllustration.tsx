import { useId } from 'react'
import { BRAND, type BrandId } from '@/shared/config/brand'

const sparkle = 'M0-9C1-2.5 2.5-1 9 0 2.5 1 1 2.5 0 9-1 2.5-2.5 1-9 0-2.5-1-1-2.5 0-9Z'

// Right-rounded bar from x0 to x1, y0 to y1, like the bars of Fortuna's "B"
const bar = (x0: number, x1: number, y0: number, y1: number) => {
  const r = (y1 - y0) / 2
  return `M${x0} ${y0}H${x1 - r}A${r} ${r} 0 0 1 ${x1 - r} ${y1}H${x0}Z`
}

/** Fortuna: its logo's blue and red bars lifting out of an empty tray. */
function FortunaEmpty({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 170" fill="none" aria-hidden="true" className={className}>
      <circle cx="110" cy="84" r="72" className="fill-accent-200" />
      <ellipse cx="110" cy="152" rx="62" ry="7" className="fill-neutral-100" />

      {/* the logo's bars, pulled apart and floating */}
      <g transform="rotate(-7 110 46)">
        <rect x="70" y="22" width="40" height="12" rx="2" className="fill-accent-500" />
        <rect x="70" y="38" width="30" height="12" rx="2" className="fill-accent-500" />
        <rect x="70" y="54" width="20" height="12" rx="2" className="fill-accent-500" />
        <path d={bar(116, 146, 22, 34)} className="fill-primary" />
        <path d={bar(106, 152, 38, 50)} className="fill-primary" />
        <path d={bar(96, 152, 54, 66)} className="fill-primary" />
      </g>

      {/* the empty tray */}
      <rect
        x="46"
        y="84"
        width="128"
        height="60"
        rx="16"
        className="fill-canvas stroke-brand"
        strokeWidth="2.5"
      />
      <rect
        x="62"
        y="98"
        width="96"
        height="32"
        rx="10"
        className="stroke-neutral-400"
        strokeWidth="2"
        strokeDasharray="5 6"
        strokeLinecap="round"
      />

      <path d={sparkle} transform="translate(184 40)" className="fill-accent-500" />
      <path d={sparkle} transform="translate(36 66) scale(0.6)" className="fill-primary" />
      <circle cx="188" cy="104" r="4" className="fill-brand" />
      <circle cx="34" cy="116" r="3" className="fill-neutral-400" />
    </svg>
  )
}

/** Vodiy Taraqqiyot: an empty card in a green valley, a sprout beside it, the logo's ring as the sun. */
function VodiyEmpty({ className }: { className?: string }) {
  const clip = useId()
  return (
    <svg viewBox="0 0 220 170" fill="none" aria-hidden="true" className={className}>
      <defs>
        <clipPath id={clip}>
          <circle cx="110" cy="84" r="72" />
        </clipPath>
      </defs>
      <circle cx="110" cy="84" r="72" className="fill-accent-100" />
      <circle cx="152" cy="42" r="13" className="stroke-brand" strokeWidth="3" />
      <g clipPath={`url(#${clip})`}>
        <path d="M30 118Q72 84 118 108T196 100V160H30Z" className="fill-accent-300" />
        <path d="M24 134Q88 104 148 126T200 120V160H24Z" className="fill-accent-500" />
      </g>
      <ellipse cx="110" cy="152" rx="62" ry="7" className="fill-neutral-100" />

      {/* the empty card */}
      <g transform="rotate(-4 104 96)">
        <rect
          x="70"
          y="50"
          width="68"
          height="86"
          rx="12"
          className="fill-canvas stroke-brand"
          strokeWidth="2.5"
        />
        <rect x="82" y="64" width="34" height="5" rx="2.5" className="fill-neutral-200" />
        <rect x="82" y="74" width="22" height="5" rx="2.5" className="fill-neutral-100" />
        <rect
          x="82"
          y="90"
          width="44"
          height="32"
          rx="8"
          className="stroke-neutral-400"
          strokeWidth="2"
          strokeDasharray="5 6"
          strokeLinecap="round"
        />
      </g>

      {/* a sprout: growth */}
      <path
        d="M158 140V112"
        className="stroke-accent-600"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M158 120C158 108 168 102 178 104 176 114 168 120 158 120Z"
        className="fill-accent-500"
      />
      <path
        d="M158 126C158 116 150 110 141 112 143 121 150 126 158 126Z"
        className="fill-accent-600"
      />

      <path d={sparkle} transform="translate(46 54) scale(0.7)" className="fill-accent-500" />
      <circle cx="190" cy="76" r="3" className="fill-neutral-400" />
    </svg>
  )
}

const PICTURES: Record<BrandId, (props: { className?: string }) => React.JSX.Element> = {
  fortuna: FortunaEmpty,
  vodiy: VodiyEmpty,
}

/**
 * The empty-state picture, one per brand. It shows no particular object, so it fits an empty
 * list, search or inbox alike. Drawn with theme tokens, so it follows light and dark.
 */
export function EmptyIllustration({ className }: { className?: string }) {
  const Picture = PICTURES[BRAND.id]
  return <Picture className={className} />
}
