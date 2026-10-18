import vodiyMark from '@/shared/assets/brands/vodiy-mark.png'
import { BRAND, type BrandId } from '@/shared/config/brand'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'

/** Fortuna's mark: three blue bars on the left, a red "B" of three rounded bars on the right. */
function FortunaMark({ className }: { className?: string }) {
  // Right-rounded bar from x0 to x1, y0 to y1
  const bar = (x0: number, x1: number, y0: number, y1: number, r: number) =>
    `M${x0} ${y0}H${x1 - r}A${r} ${r} 0 0 1 ${x1} ${y0 + r}V${y1 - r}A${r} ${r} 0 0 1 ${x1 - r} ${y1}H${x0}Z`
  return (
    <svg viewBox="0 0 270 200" className={className} aria-hidden>
      <g fill="#00A3E8">
        <rect x="0" y="0" width="152" height="59" />
        <rect x="0" y="69" width="113" height="61" />
        <rect x="0" y="138" width="72" height="62" />
      </g>
      <g fill="#ED1B24">
        <path d={bar(160, 246, 0, 59, 29)} />
        <path d={bar(121, 270, 69, 130, 30)} />
        <path d={bar(81, 270, 138, 200, 31)} />
      </g>
    </svg>
  )
}

/** Vodiy Taraqqiyot's mark: "VT" and a handshake in a red ring, cut from its site's logo. */
function VodiyMark({ className }: { className?: string }) {
  return <img src={vodiyMark} alt="" className={cn('rounded-full bg-white', className)} />
}

const MARKS: Record<BrandId, (props: { className?: string }) => React.JSX.Element> = {
  fortuna: FortunaMark,
  vodiy: VodiyMark,
}

/** The current brand's mark. */
export function BrandMark({
  className,
  brand = BRAND.id,
}: {
  className?: string
  brand?: BrandId
}) {
  const Mark = MARKS[brand]
  return <Mark className={className} />
}

/** The brand's mark with its name and kind beside it, as on the brand's site. */
export function BrandLogo({ size = 'md', className }: { size?: 'md' | 'lg'; className?: string }) {
  const { tl } = useI18n()
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <BrandMark className={size === 'lg' ? 'h-11 w-auto' : 'h-8 w-auto'} />
      <div className="flex flex-col leading-tight">
        <span className={cn('font-bold', size === 'lg' ? 'text-xl' : 'text-base')}>
          {BRAND.name}
        </span>
        <span className={cn('text-ink-muted', size === 'lg' ? 'text-sm' : 'text-xs')}>
          {tl(BRAND.kind)}
        </span>
      </div>
    </div>
  )
}
