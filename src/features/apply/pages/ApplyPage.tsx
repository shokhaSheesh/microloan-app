import { ChevronRight, Info } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { setDraft } from '@/entities/apply/draft'
import { DEFAULT_PAY_DAY, PAY_DAYS, quote, rateFor, termsOf } from '@/entities/loans/loans'
import { BRAND, type PayType, type Product } from '@/shared/config/brand'
import { productTermsPath, ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { formatSum } from '@/shared/lib/format'
import { Button } from '@/shared/ui/Button'
import { NumberField } from '@/shared/ui/NumberField'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Slider } from '@/shared/ui/Slider'
import { ScheduleSheet } from '../components/ScheduleSheet'

const MIN = 1_000_000
const STEP = 500_000
const minOf = (product: Product) => product.min ?? MIN
const clamp = (n: number, product: Product) =>
  Math.min(product.max, Math.max(minOf(product), Math.round(n / STEP) * STEP))

/**
 * Qarz olish, step one: the calculator. Pick a product, the sum, the term, the payment day (1–10)
 * and, when the product allows both, the payment type; the dark card shows the monthly payment
 * (the first and last for falling payments), yearly rate, interest and total, and the full
 * schedule opens from it. «Batafsil shartlar» under the products opens the product's terms. A pushed screen without the tab bar, so "Ariza berish" sits at the bottom and carries
 * the choice into the application.
 */
export function ApplyPage() {
  const { t, tl } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [productId, setProductId] = useState(
    BRAND.products.find((p) => p.id === params.get('product'))?.id ?? BRAND.products[0].id,
  )
  const product = BRAND.products.find((p) => p.id === productId)!
  const [amount, setAmount] = useState(clamp(10_000_000, product))
  const [typed, setTyped] = useState<number | null>(amount)
  const [term, setTerm] = useState(Math.min(12, product.termMax))
  const [payDay, setPayDay] = useState(DEFAULT_PAY_DAY)
  const [payType, setPayType] = useState<PayType>(product.payTypes[0])
  const [schedule, setSchedule] = useState(false)

  const terms = termsOf(product)
  const rate = rateFor(product, term)
  const { monthly, last, total, interest } = quote(amount, rate, term, payType)
  const falling = payType === 'differentiated'
  const tooBig = typed !== null && typed > product.max
  const min = minOf(product)
  const tooSmall = typed !== null && typed < min

  const pickProduct = (id: string) => {
    const next = BRAND.products.find((p) => p.id === id)!
    setProductId(id)
    const sum = clamp(amount, next)
    setAmount(sum)
    setTyped(sum)
    if (term > next.termMax) setTerm(next.termMax)
    if (term < (next.termMin ?? 3)) setTerm(next.termMin ?? 3)
    if (!next.payTypes.includes(payType)) setPayType(next.payTypes[0])
  }
  const slide = (sum: number) => {
    setAmount(sum)
    setTyped(sum)
  }
  const type = (sum: number | null) => {
    setTyped(sum)
    if (sum !== null && sum >= min && sum <= product.max) setAmount(sum)
  }

  return (
    <div className="flex h-full flex-col bg-page">
      <PageHeader title={t('nav.apply')} />
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pt-2 pb-6">
        <p className="-mt-1 text-ink-muted">{t('apply.subtitle')}</p>

        <div
          role="radiogroup"
          aria-label={t('apply.product')}
          // Up to three fit side by side; more scroll sideways
          className={cn(
            BRAND.products.length > 3
              ? '-mx-5 flex shrink-0 gap-2 overflow-x-auto px-5 [&>*]:w-[30%] [&>*]:shrink-0'
              : 'grid grid-cols-3 gap-2',
          )}
        >
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
        <div className="-mt-3 flex flex-col items-start gap-1.5">
          <p className="text-sm text-ink-muted">
            {tl(product.kind)} · {tl(product.for)}
          </p>
          <Link
            to={productTermsPath(product.id)}
            state={{ fromCalculator: true }}
            className="-mx-1 flex items-center gap-1.5 rounded-full px-1 py-0.5 text-sm font-semibold text-brand active:bg-neutral-100"
          >
            <Info size={16} />
            {t('terms.open')}
          </Link>
        </div>

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
                  ? t('apply.amount.min', { sum: formatSum(min) })
                  : undefined
            }
          />
          <Slider
            label={t('apply.amount')}
            min={min}
            max={product.max}
            step={STEP}
            value={amount}
            onChange={slide}
          />
          <div className="-mt-2 flex justify-between text-xs text-ink-muted tabular-nums">
            <span>{formatSum(min)}</span>
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

        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="font-bold">{t('apply.payDay')}</h2>
            <p className="text-sm text-ink-muted">{t('apply.payDay.hint')}</p>
          </div>
          <div role="radiogroup" aria-label={t('apply.payDay')} className="grid grid-cols-5 gap-2">
            {PAY_DAYS.map((day) => (
              <button
                key={day}
                type="button"
                role="radio"
                aria-checked={day === payDay}
                onClick={() => setPayDay(day)}
                className={cn(
                  'h-11 rounded-full border-[1.5px] font-semibold tabular-nums transition-colors',
                  day === payDay
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-line bg-canvas active:bg-neutral-100',
                )}
              >
                {day}
              </button>
            ))}
          </div>
        </section>

        {product.payTypes.length > 1 && (
          <section className="flex flex-col gap-3">
            <h2 className="font-bold">{t('apply.payType')}</h2>
            <div
              role="radiogroup"
              aria-label={t('apply.payType')}
              className="grid grid-cols-2 gap-2"
            >
              {product.payTypes.map((item) => {
                const selected = item === payType
                return (
                  <button
                    key={item}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setPayType(item)}
                    className={cn(
                      'flex flex-col items-start gap-0.5 rounded-control border-[1.5px] bg-canvas px-3 py-2.5 text-left transition-colors',
                      selected ? 'border-primary' : 'border-line active:bg-neutral-100',
                    )}
                  >
                    <span className="font-bold">{t(`payType.${item}`)}</span>
                    <span className="text-xs text-ink-muted">{t(`payType.${item}.hint`)}</span>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-4 rounded-[28px] bg-tile p-5 text-on-tile">
          <div className="flex flex-col gap-1">
            <span className="text-sm opacity-60">
              {t(falling ? 'apply.monthly.first' : 'apply.monthly')}
            </span>
            <span className="text-[32px] leading-none font-bold tracking-tight tabular-nums">
              {formatSum(monthly)}
            </span>
          </div>
          <dl className="flex flex-col gap-2 text-sm">
            {(
              [
                ['apply.rate', t('apply.rate.value', { rate: String(rate) })],
                ['apply.payType', t(`payType.${payType}`)],
                ...(falling ? [['apply.monthly.last', formatSum(last)] as const] : []),
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
      </div>

      <div className="flex shrink-0 flex-col gap-1.5 border-t border-line bg-page px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button
          block
          disabled={tooBig || tooSmall || typed === null}
          onClick={() => {
            setDraft({ productId, amount, term, payDay, payType })
            navigate(ROUTES.application)
          }}
        >
          {t('apply.continue')}
        </Button>
        <p className="text-center text-xs text-ink-subtle">{t('apply.note')}</p>
      </div>

      <ScheduleSheet
        open={schedule}
        onClose={() => setSchedule(false)}
        amount={amount}
        rate={rate}
        term={term}
        payDay={payDay}
        payType={payType}
      />
    </div>
  )
}
