import type { ReactNode } from 'react'

/** A titled block on a detail screen. */
type Props = {
  title: string
  hint?: string
  /** A small link at the right of the title, e.g. "Hammasi". */
  action?: ReactNode
  children: ReactNode
}

export function Section({ title, hint, action, children }: Props) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-bold">{title}</h2>
          {action}
        </div>
        {hint && <p className="text-sm text-ink-muted">{hint}</p>}
      </div>
      {children}
    </section>
  )
}
