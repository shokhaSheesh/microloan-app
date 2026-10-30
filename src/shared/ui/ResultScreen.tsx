import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { Button } from './Button'
import { FormScreen } from './FormScreen'

type Action = { label: string; onClick: () => void }

const tones = {
  danger: 'bg-danger-soft text-danger',
  warning: 'bg-warning-soft text-warning',
  success: 'bg-success text-white',
}

/** A full-screen outcome: an icon, what happened, and what to do next. */
export function ResultScreen({
  tone,
  icon: Icon,
  title,
  text,
  note,
  primary,
  secondary,
  onBack,
}: {
  tone: keyof typeof tones
  icon: LucideIcon
  title: string
  text: string
  /** A boxed line under the text, e.g. what happens next. */
  note?: ReactNode
  primary: Action
  secondary?: Action
  onBack?: () => void
}) {
  return (
    <FormScreen
      onSubmit={primary.onClick}
      onBack={onBack}
      footer={
        <div className="flex flex-col gap-1">
          {secondary && (
            <Button variant="ghost" block onClick={secondary.onClick}>
              {secondary.label}
            </Button>
          )}
          <Button type="submit" block>
            {primary.label}
          </Button>
        </div>
      }
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <span className={cn('grid size-20 place-items-center rounded-full', tones[tone])}>
          <Icon size={36} />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-balance">{title}</h1>
          <p className="text-ink-muted">{text}</p>
        </div>
        {note && (
          <p className="rounded-control border border-line bg-canvas px-4 py-3 text-sm">{note}</p>
        )}
      </div>
    </FormScreen>
  )
}
