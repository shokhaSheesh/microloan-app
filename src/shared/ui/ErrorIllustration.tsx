import type { ReactNode } from 'react'
import type { ErrorKind } from './errorKinds'

const line = { strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

/** What is drawn on the card for each kind. Navy lines, with one red detail that names the problem. */
const motifs: Record<ErrorKind, ReactNode> = {
  // Wi-Fi arcs, struck through
  offline: (
    <>
      <path d="M82 82a34 34 0 0 1 48 0" className="stroke-brand" {...line} />
      <path d="M90 92a22 22 0 0 1 32 0" className="stroke-brand" {...line} />
      <path d="M98 102a11 11 0 0 1 16 0" className="stroke-brand" {...line} />
      <circle cx="106" cy="112" r="3.5" className="fill-brand" />
      <path d="M84 66l44 50" className="stroke-canvas" strokeWidth="8" strokeLinecap="round" />
      <path d="M84 66l44 50" className="stroke-danger" {...line} />
    </>
  ),
  // Two server units and a warning badge
  server: (
    <>
      <rect x="80" y="64" width="52" height="20" rx="6" className="stroke-brand" {...line} />
      <rect x="80" y="90" width="52" height="20" rx="6" className="stroke-brand" {...line} />
      <circle cx="91" cy="74" r="3" className="fill-neutral-400" />
      <circle cx="91" cy="100" r="3" className="fill-neutral-400" />
      <path d="M101 74h14M101 100h8" className="stroke-neutral-200" {...line} />
      <circle cx="128" cy="112" r="12" className="fill-danger stroke-canvas" strokeWidth="3" />
      <path d="M128 106v7" className="stroke-canvas" {...line} />
      <circle cx="128" cy="118" r="1.8" className="fill-canvas" />
    </>
  ),
  // A clock whose time has run out
  session: (
    <>
      <circle cx="106" cy="88" r="27" className="stroke-brand" {...line} />
      <path d="M106 66v3M106 107v3M84 88h3M125 88h3" className="stroke-neutral-200" {...line} />
      <path d="M106 88V73" className="stroke-brand" {...line} />
      <path d="M106 88l12 8" className="stroke-danger" {...line} />
      <circle cx="106" cy="88" r="3" className="fill-brand" />
    </>
  ),
  // A magnifier that found a question mark
  notFound: (
    <>
      <circle cx="102" cy="84" r="21" className="stroke-brand" {...line} />
      <path d="M118 100l13 13" className="stroke-brand" strokeWidth="5" strokeLinecap="round" />
      <path
        d="M96 79a6.5 6.5 0 1 1 10 5.5c-2.5 1.6-4 2.6-4 5"
        className="stroke-danger"
        {...line}
      />
      <circle cx="102" cy="95.5" r="1.9" className="fill-danger" />
    </>
  ),
  // A closed padlock
  forbidden: (
    <>
      <path d="M94 86v-9a12 12 0 0 1 24 0v9" className="stroke-brand" {...line} />
      <rect
        x="84"
        y="86"
        width="44"
        height="32"
        rx="8"
        className="fill-surface stroke-brand"
        {...line}
      />
      <circle cx="106" cy="99" r="4" className="fill-danger" />
      <path d="M106 101v7" className="stroke-danger" {...line} />
    </>
  ),
}

type Props = { kind: ErrorKind; className?: string }

/**
 * The picture for a screen that could not be shown. It is the empty-state picture's sibling:
 * the same soft green ground and tilted card, with the problem drawn on the card.
 * Drawn with theme tokens, so it follows the light and dark themes.
 */
export function ErrorIllustration({ kind, className }: Props) {
  return (
    <svg viewBox="0 0 220 170" fill="none" aria-hidden="true" className={className}>
      <ellipse cx="110" cy="88" rx="96" ry="66" className="fill-accent-200" />
      <ellipse cx="110" cy="150" rx="58" ry="7" className="fill-neutral-100" />

      {/* back card */}
      <rect
        x="70"
        y="26"
        width="92"
        height="108"
        rx="14"
        transform="rotate(8 116 80)"
        className="fill-surface stroke-neutral-400"
        strokeWidth="2"
      />

      {/* front card with the problem on it */}
      <g transform="rotate(-4 106 86)">
        <rect
          x="58"
          y="32"
          width="96"
          height="112"
          rx="14"
          className="fill-canvas stroke-brand"
          strokeWidth="2.5"
        />
        {motifs[kind]}
      </g>

      {/* accents */}
      <circle cx="184" cy="48" r="5" className="fill-danger" />
      <circle cx="186" cy="104" r="4" className="fill-brand" />
      <circle cx="40" cy="72" r="4" className="fill-neutral-400" />
      <circle cx="48" cy="118" r="3" className="fill-neutral-400" />
    </svg>
  )
}
