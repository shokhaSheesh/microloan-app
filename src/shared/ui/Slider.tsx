type Props = {
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
  /** Read by screen readers. */
  label: string
}

// A native range input with its own look: our track and fill, a white handle with a red ring
const input =
  'absolute inset-0 h-7 w-full cursor-pointer appearance-none bg-transparent outline-none ' +
  '[&::-webkit-slider-thumb]:size-7 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-canvas [&::-webkit-slider-thumb]:shadow-md ' +
  '[&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-canvas ' +
  'focus-visible:[&::-webkit-slider-thumb]:ring-4 focus-visible:[&::-webkit-slider-thumb]:ring-accent-200'

/** One handle on a track, e.g. the loan sum. The part up to the handle is filled. */
export function Slider({ min, max, step, value, onChange, label }: Props) {
  const percent = ((value - min) / (max - min)) * 100
  return (
    <div className="relative mx-0.5 h-7">
      <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-neutral-200" />
      <div
        className="absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full bg-primary"
        style={{ width: `${percent}%` }}
      />
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={input}
      />
    </div>
  )
}
