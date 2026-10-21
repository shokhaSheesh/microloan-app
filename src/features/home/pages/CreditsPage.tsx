import { useSearchParams } from 'react-router-dom'
import { BRAND } from '@/shared/config/brand'
import { useI18n } from '@/shared/i18n/useI18n'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ProductCard } from '../components/ProductCard'

/**
 * Kreditlar: every loan product, each opening its calculator. Reached from Asosiy's quick
 * actions, or from a banner with several products (`?ids=`), then only those.
 */
export function CreditsPage() {
  const { t } = useI18n()
  const [params] = useSearchParams()
  const ids = params.get('ids')?.split(',').filter(Boolean)
  const shown = ids ? BRAND.products.filter((product) => ids.includes(product.id)) : BRAND.products
  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('home.action.credits')} />
      <ul className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pt-2 pb-6">
        {shown.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </div>
  )
}
