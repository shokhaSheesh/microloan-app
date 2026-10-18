import type { ReactNode } from 'react'

/** Label and value pairs in one card. Used for read-only details. */
export function InfoList({ children }: { children: ReactNode }) {
  return <dl className="rounded-card border border-line bg-canvas px-4">{children}</dl>
}

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-3 last:border-b-0">
      <dt className="shrink-0 text-sm text-ink-muted">{label}</dt>
      <dd className="min-w-0 text-right font-semibold break-words">{value}</dd>
    </div>
  )
}
