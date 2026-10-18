import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { setDraft } from '@/entities/apply/draft'
import { quote, rateFor, termsOf } from '@/entities/loans/loans'
import { BRAND } from '@/shared/config/brand'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { formatSum } from '@/shared/lib/format'
import { Button } from '@/shared/ui/Button'
import { NumberField } from '@/shared/ui/NumberField'
import { Slider } from '@/shared/ui/Slider'
import { ScheduleSheet } from '../components/ScheduleSheet'

const MIN = 1_000_000
const STEP = 500_000
const clamp = (n: number, max: number) => Math.min(max, Math.max(MIN, Math.round(n / STEP) * STEP))

/**
 * Qarz olish, step one: the calculator. Pick a product, the sum and the term; the dark card
 * shows the monthly payment, yearly rate, interest and total, and the full schedule opens
 * from it. "Ariza berish" carries the choice into the application.
 */
export function ApplyPage() {
  const { t, tl } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [productId, setProductId] = useState(
    BRAND.products.find((p) => p.id === params.get('product'))?.id ?? BRAND.products[0].id,
  )
  const product = BRAND.products.find((p) => p.id === productId)!
  const [amount, setAmount] = useState(Math.min(10_000_000, product.max))
  const [typed, setTyped] = useState<number | null>(amount)
  const [term, setTerm] = useState(12)
  const [schedule, setSchedule] = useState(false)

  const terms = termsOf(product)
  const rate = rateFor(product, term)
  const { monthly, total, interest } = quote(amount, rate, term)
  const tooBig = typed !== null && typed > product.max
  const tooSmall = typed !== null && typed < MIN

  const pickProduct = (id: string) => {
    const next = BRAND.products.find((p) => p.id === id)!
    setProductId(id)
    const sum = clamp(amount, next.max)
    setAmount(sum)
    setTyped(sum)
    if (term > next.termMax) setTerm(next.termMax)
  }
  const slide = (sum: number) => {
    setAmount(sum)
    setTyped(sum)
  }
  const type = (sum: number | null) => {
    setTyped(sum)
    if (sum !== null && sum >= MIN && sum <= product.max) setAmount(sum)
  }

  return (
    <div className="flex min-h-full flex-col gap-6 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-tabbar">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{t('nav.apply')}</h1>
        <p className="text-ink-muted">{t('apply.subtitle')}</p>
      </div>

      <div role="radiogroup" aria-label={t('apply.product')} className="grid grid-cols-3 gap-2">
        {BRAND.products.map((item) => {
          const selected = item.id === productId
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => pickProduct(item.id)}
              className={cn(
                'flex flex-col items-start gap-0.5 rounded-control border-[1.5px] bg-canvas px-3 py-2.5 text-left transition-colors',
                selected ? 'border-primary' : 'border-line active:bg-neutral-100',
              )}
            >
              <span className="font-bold">{item.name}</span>
              <span className="text-xs text-ink-muted">
                {t('home.product.max', { sum: String(item.max / 1_000_000) })}
              </span>
            </button>
          )
        })}
      </div>
      <p className="-mt-3 text-sm text-ink-muted">
        {tl(product.kind)} · {tl(product.for)}
      </p>

      <section className="flex flex-col gap-4 rounded-card border border-line bg-canvas p-4">
        <NumberField
          label={t('apply.amount')}
          value={typed}
          onChange={type}
          suffix={t('common.currency')}
          error={
            tooBig
              ? t('apply.amount.max', { sum: formatSum(product.max) })
              : tooSmall
                ? t('apply.amount.min', { sum: formatSum(MIN) })
                : undefined
          }
        />
        <Slider
          label={t('apply.amount')}
          min={MIN}
          max={product.max}
          step={STEP}
          value={amount}
          onChange={slide}
        />
        <div className="-mt-2 flex justify-between text-xs text-ink-muted tabular-nums">
          <span>{formatSum(MIN)}</span>
          <span>{formatSum(product.max)}</span>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-bold">{t('apply.term')}</h2>
        <div role="radiogroup" aria-label={t('apply.term')} className="flex flex-wrap gap-2">
          {terms.map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={n === term}
              onClick={() => setTerm(n)}
              className={cn(
                'h-11 min-w-16 rounded-full border-[1.5px] px-4 font-semibold tabular-nums transition-colors',
                n === term
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-line bg-canvas active:bg-neutral-100',
              )}
            >
              {t('apply.months', { n: String(n) })}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-[28px] bg-tile p-5 text-on-tile">
        <div className="flex flex-col gap-1">
          <span className="text-sm opacity-60">{t('apply.monthly')}</span>
          <span className="text-[32px] leading-none font-bold tracking-tight tabular-nums">
            {formatSum(monthly)}
          </span>
        </div>
        <dl className="flex flex-col gap-2 text-sm">
          {(
            [
              ['apply.rate', t('apply.rate.value', { rate: String(rate) })],
              ['apply.interest', formatSum(interest)],
              ['apply.total', formatSum(total)],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3">
              <dt className="opacity-60">{t(label)}</dt>
              <dd className="font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          onClick={() => setSchedule(true)}
          className="flex items-center justify-between rounded-control bg-white/10 px-3 py-2.5 text-sm font-semibold"
        >
          {t('apply.schedule')}
          <ChevronRight size={18} className="opacity-70" />
        </button>
      </section>

      <Button
        block
        disabled={tooBig || tooSmall || typed === null}
        onClick={() => {
          setDraft({ productId, amount, term })
          navigate(ROUTES.application)
        }}
      >
        {t('apply.continue')}
      </Button>
      <p className="-mt-3 text-center text-xs text-ink-subtle">{t('apply.note')}</p>

      <ScheduleSheet
        open={schedule}
        onClose={() => setSchedule(false)}
        amount={amount}
        rate={rate}
        term={term}
      />
    </div>
  )
}
