import { useNavigate } from 'react-router-dom'
import { BRAND } from '@/shared/config/brand'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum } from '@/shared/lib/format'
import { BrandMark } from '@/shared/ui/BrandMark'
import { Button } from '@/shared/ui/Button'

/** No loan yet: the biggest sum on offer and the way in. */
export function OfferCard() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const max = BRAND.maxAmount
  return (
    <section className="relative flex flex-col gap-4 overflow-hidden rounded-[28px] bg-tile p-5 text-on-tile">
      <BrandMark className="absolute top-5 right-5 h-8 w-auto" />
      <div className="flex flex-col gap-1">
        <span className="text-sm opacity-60">{t('home.offer.label')}</span>
        <span className="text-[32px] leading-none font-bold tracking-tight tabular-nums">
          {formatSum(max, false)}
        </span>
        <span className="text-sm opacity-60">{t('home.offer.upTo')}</span>
      </div>
      <p className="text-sm opacity-80">{t('home.offer.hint')}</p>
      <Button block onClick={() => navigate(ROUTES.apply)}>
        {t('home.offer.cta')}
      </Button>
    </section>
  )
}
