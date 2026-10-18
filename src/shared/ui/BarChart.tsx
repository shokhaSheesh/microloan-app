import { useState } from 'react'

export type Bar = {
  /** Axis label under the bar; leave empty to skip it when bars are dense. */
  label: string
  /** Full name of the bar for the readout and screen readers. */
  name: string
  value: number
}

type Props = {
  /** Describes the chart to screen readers. */
  label: string
  bars: Bar[]
  /** Text for the readout line, e.g. "3 ta ariza". */
  formatValue: (value: number) => string
  /** Shown in the readout until a bar is picked. */
  hint: string
}

const WIDTH = 320
const HEIGHT = 150
const LEFT = 22
const TOP = 14
const BASE = 118

/** Rounds the axis top up to an even number so the middle gridline is a whole count. */
const axisMax = (max: number) => Math.max(4, Math.ceil(max / 4) * 4)

/** One series of counts as vertical bars. Hover, focus or tap a bar to read its value. */
export function BarChart({ label, bars, formatValue, hint }: Props) {
  const [active, setActive] = useState<number | null>(null)
  const max = axisMax(Math.max(...bars.map((bar) => bar.value)))
  const step = (WIDTH - LEFT) / bars.length
  const barWidth = Math.min(16, step * 0.62)
  const peak = bars.reduce((best, bar, i) => (bar.value > bars[best].value ? i : best), 0)
  const y = (value: number) => BASE - ((BASE - TOP) * value) / max
  const shown = active === null ? null : bars[active]

  return (
    <div className="flex flex-col gap-2">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={label} className="w-full">
        {[0, max / 2, max].map((tick) => (
          <g key={tick}>
            <line x1={LEFT} x2={WIDTH} y1={y(tick)} y2={y(tick)} className="stroke-line" />
            <text
              x={LEFT - 6}
              y={y(tick) + 4}
              textAnchor="end"
              className="fill-ink-muted text-[11px]"
            >
              {tick}
            </text>
          </g>
        ))}
        {bars.map((bar, i) => {
          const center = LEFT + step * i + step / 2
          const top = y(bar.value)
          const radius = Math.min(4, barWidth / 2, (BASE - top) / 2)
          return (
            <g
              key={i}
              tabIndex={0}
              role="img"
              aria-label={`${bar.name}: ${formatValue(bar.value)}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className="outline-none"
            >
              {bar.value > 0 && (
                // Rounded at the data end, square on the baseline
                <path
                  d={`M${center - barWidth / 2} ${BASE}V${top + radius}a${radius} ${radius} 0 0 1 ${radius}-${radius}h${barWidth - 2 * radius}a${radius} ${radius} 0 0 1 ${radius} ${radius}V${BASE}Z`}
                  className={active === i ? 'fill-accent-500' : 'fill-primary'}
                />
              )}
              {i === peak && bar.value > 0 && (
                <text
                  x={center}
                  y={top - 5}
                  textAnchor="middle"
                  className="fill-ink text-[11px] font-semibold"
                >
                  {bar.value}
                </text>
              )}
              {bar.label && (
                <text
                  x={center}
                  y={BASE + 16}
                  textAnchor="middle"
                  className="fill-ink-muted text-[11px]"
                >
                  {bar.label}
                </text>
              )}
              {/* Wider than the bar, so thin bars are still easy to hit */}
              <rect
                x={center - step / 2}
                y={TOP}
                width={step}
                height={BASE - TOP + 22}
                fill="transparent"
              />
            </g>
          )
        })}
      </svg>
      <p className="min-h-5 text-sm text-ink-muted" aria-live="polite">
        {shown ? (
          <>
            <span className="font-semibold text-ink">{formatValue(shown.value)}</span> ·{' '}
            {shown.name}
          </>
        ) : (
          hint
        )}
      </p>
    </div>
  )
}
