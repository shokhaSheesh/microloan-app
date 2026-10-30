import { ChevronRight, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from '@/shared/config/brand'
import { applyPath, productTermsPath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'

const millions = (sum: number) => `${sum / 1_000_000}`
const rateText = ([from, to]: [number, number]) => (from === to ? `${from}%` : `${from}–${to}%`)

/**
 * One product: its name and kind, who it is for, and its three numbers, opening the calculator;
 * «Batafsil shartlar» under them opens the product's full terms.
 */
export function ProductCard({ product }: { product: Product }) {
  const { t, tl } = useI18n()
  const facts = [
    t('home.product.max', { sum: millions(product.max) }),
    t('home.product.rate', { rate: rateText(product.rate) }),
    t('home.product.term', { months: String(product.termMax) }),
  ]
  return (
    <div className="flex flex-col overflow-hidden rounded-card border border-line bg-canvas">
      <Link to={applyPath(product.id)} className="flex flex-col gap-3 p-4 active:bg-neutral-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-lg font-bold">{product.name}</span>
            <span className="text-sm font-medium text-brand">{tl(product.kind)}</span>
          </div>
          <ChevronRight size={20} className="mt-1 shrink-0 text-ink-subtle" />
        </div>
        <p className="text-sm text-ink-muted">{tl(product.for)}</p>
        <div className="flex flex-wrap gap-1.5">
          {facts.map((fact, i) => (
            <span
              key={fact}
              className={cn(
                'rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums',
                i === 0 ? 'bg-accent-200 text-brand' : 'bg-surface text-ink-muted',
              )}
            >
              {fact}
            </span>
          ))}
        </div>
      </Link>
      <Link
        to={productTermsPath(product.id)}
        className="flex items-center gap-2 border-t border-line px-4 py-3 text-sm font-semibold text-brand active:bg-neutral-100"
      >
        <Info size={16} />
        <span className="flex-1">{t('terms.open')}</span>
        <ChevronRight size={18} className="text-ink-subtle" />
      </Link>
    </div>
  )
}
