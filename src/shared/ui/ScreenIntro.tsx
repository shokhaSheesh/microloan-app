type Props = { title: string; subtitle?: string }

/** Title and one supporting line at the top of a form screen. */
export function ScreenIntro({ title, subtitle }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="text-2xl font-bold">{title}</h1>
      {subtitle && <p className="text-ink-muted">{subtitle}</p>}
    </div>
  )
}
