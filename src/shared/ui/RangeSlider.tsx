type Props = {
  min: number
  max: number
  step: number
  /** Lower and upper ends of the chosen range. */
  value: [number, number]
  onChange: (value: [number, number]) => void
  /** Screen-reader names for the two handles. */
  labels: [string, string]
}

// Two native range inputs laid over one track. Only their handles take touches,
// so each handle can be dragged even where the inputs overlap.
const handle =
  'pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent outline-none ' +
  '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-canvas ' +
  '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-[18px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-canvas ' +
  'focus-visible:[&::-webkit-slider-thumb]:ring-3 focus-visible:[&::-webkit-slider-thumb]:ring-accent-200'

/** A track with two handles for picking a from–to range, e.g. a price range in a filter. */
export function RangeSlider({ min, max, step, value, onChange, labels }: Props) {
  const [low, high] = value
  const percent = (n: number) => ((n - min) / (max - min)) * 100

  return (
    <div className="relative mx-0.5 h-6">
      <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-neutral-200" />
      <div
        className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
        style={{ left: `${percent(low)}%`, right: `${100 - percent(high)}%` }}
      />
      <input
        type="range"
        aria-label={labels[0]}
        min={min}
        max={max}
        step={step}
        value={low}
        onChange={(e) => onChange([Math.min(Number(e.target.value), high - step), high])}
        className={handle}
      />
      <input
        type="range"
        aria-label={labels[1]}
        min={min}
        max={max}
        step={step}
        value={high}
        onChange={(e) => onChange([low, Math.max(Number(e.target.value), low + step)])}
        className={handle}
      />
    </div>
  )
}
