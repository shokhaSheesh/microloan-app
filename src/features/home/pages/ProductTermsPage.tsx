import { Check, ChevronRight, FileText } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { PAY_DAYS, quote, rateFor, scheduleOf, termsOf } from '@/entities/loans/loans'
import { BRAND, type PayType, type Product } from '@/shared/config/brand'
import { applyPath, ROUTES } from '@/shared/config/routes'
import type { TranslationKey } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum } from '@/shared/lib/format'
import { Button } from '@/shared/ui/Button'
import { InfoList, InfoRow } from '@/shared/ui/InfoList'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Section } from '@/shared/ui/Section'

const SAMPLE_SUM = 10_000_000
const SAMPLE_TERM = 12

const REQUIREMENTS: TranslationKey[] = [
  'terms.req.age',
  'terms.req.passport',
  'terms.req.phone',
  'terms.req.card',
  'terms.req.income',
]
const EARLY: TranslationKey[] = ['terms.early.any', 'terms.early.fee', 'terms.early.partial']
const LATE: TranslationKey[] = ['terms.late.remind', 'terms.late.penalty', 'terms.late.history']

/** The terms grouped by rate: e.g. 3–12 months at the lower rate, 18–24 at the higher one. */
function rateRows(product: Product) {
  const rows: { from: number; to: number; rate: number }[] = []
  for (const term of termsOf(product)) {
    const rate = rateFor(product, term)
    const last = rows.at(-1)
    if (last && last.rate === rate) last.to = term
    else rows.push({ from: term, to: term, rate })
  }
  return rows
}

/**
 * «Batafsil shartlar»: everything about one product before applying. The sums and terms, the
 * rate by term, the payment day, each payment type the product allows with a sample schedule,
 * early repayment, what is needed, what happens when a payment is late, and the offer. Opened
 * from a product's card on Kreditlar and from the calculator; "Hisoblash" goes (back) to the
 * calculator with this product.
 */
export function ProductTermsPage() {
  const { t, tl } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const fromCalculator = !!(useLocation().state as { fromCalculator?: boolean } | null)
    ?.fromCalculator
  const product = BRAND.products.find((item) => item.id === id)
  if (!product) return <Navigate to={ROUTES.credits} replace />

  const terms = termsOf(product)
  const months = (from: number, to: number) =>
    from === to
      ? t('apply.months', { n: String(from) })
      : t('terms.months.range', { from: String(from), to: String(to) })
  const rates = rateRows(product)

  return (
    <div className="flex h-full flex-col bg-page">
      <PageHeader title={t('terms.open')} />
      <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-5 pt-2 pb-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <span className="text-sm font-medium text-brand">{tl(product.kind)}</span>
          <p className="mt-1 text-ink-muted">{tl(product.for)}</p>
        </div>

        <Section title={t('terms.main')}>
          <InfoList>
            <InfoRow
              label={t('apply.amount')}
              value={`${formatSum(product.min ?? 1_000_000)} – ${formatSum(product.max)}`}
            />
            <InfoRow label={t('apply.term')} value={months(terms[0], terms.at(-1)!)} />
            {rates.length === 1 ? (
              <InfoRow
                label={t('apply.rate')}
                value={t('apply.rate.value', { rate: String(rates[0].rate) })}
              />
            ) : (
              rates.map((row) => (
                <InfoRow
                  key={row.from}
                  label={t('terms.rateFor', { months: months(row.from, row.to) })}
                  value={t('apply.rate.value', { rate: String(row.rate) })}
                />
              ))
            )}
            <InfoRow
              label={t('apply.payDay')}
              value={t('terms.payDay', {
                from: String(PAY_DAYS[0]),
                to: String(PAY_DAYS.at(-1)),
              })}
            />
          </InfoList>
        </Section>

        <Section
          title={t('apply.payType')}
          hint={t('terms.sample', {
            sum: formatSum(SAMPLE_SUM),
            months: String(Math.min(SAMPLE_TERM, product.termMax)),
          })}
        >
          {product.payTypes.map((payType) => (
            <PayTypeCard key={payType} product={product} payType={payType} />
          ))}
        </Section>

        <Section title={t('early.title')}>
          <Bullets items={EARLY} />
        </Section>

        <Section title={t('terms.req')}>
          <Bullets items={REQUIREMENTS} />
        </Section>

        <Section title={t('terms.late')}>
          <Bullets items={LATE} />
        </Section>

        <button
          type="button"
          className="flex items-center gap-3 rounded-card border border-line bg-canvas px-4 py-3.5 text-left active:bg-neutral-100"
        >
          <FileText size={20} className="shrink-0 text-brand" />
          <span className="flex-1 font-medium">{t('contract.offer')}</span>
          <ChevronRight size={18} className="text-ink-subtle" />
        </button>
      </div>

      <div className="shrink-0 border-t border-line bg-page px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button
          block
          onClick={() => (fromCalculator ? navigate(-1) : navigate(applyPath(product.id)))}
        >
          {t('terms.calculate')}
        </Button>
      </div>
    </div>
  )
}

/** One payment type: what it means and the sample loan's payments, the middle months folded. */
function PayTypeCard({ product, payType }: { product: Product; payType: PayType }) {
  const { t } = useI18n()
  const [today] = useState(() => new Date())
  const term = Math.min(SAMPLE_TERM, product.termMax)
  const amount = Math.min(product.max, Math.max(product.min ?? 0, SAMPLE_SUM))
  const rate = rateFor(product, term)
  const schedule = scheduleOf({ amount, rate, term, issuedAt: today, payDay: 5, payType })
  const { total, interest } = quote(amount, rate, term, payType)
  const shown = schedule.length > 4 ? [...schedule.slice(0, 3), null, schedule.at(-1)!] : schedule
  return (
    <div className="flex flex-col gap-3 rounded-card border border-line bg-canvas p-4">
      <div className="flex flex-col gap-0.5">
        <span className="font-bold">{t(`payType.${payType}`)}</span>
        <span className="text-sm text-ink-muted">{t(`payType.${payType}.about`)}</span>
      </div>
      <dl className="flex flex-col gap-1.5 rounded-control bg-surface px-3 py-2.5 text-sm">
        {shown.map((item) =>
          item ? (
            <div key={item.n} className="flex justify-between gap-3">
              <dt className="text-ink-muted">{t('terms.month', { n: String(item.n) })}</dt>
              <dd className="font-medium tabular-nums">{formatSum(item.amount)}</dd>
            </div>
          ) : (
            <div key="more" aria-hidden className="text-center leading-none text-ink-subtle">
              ⋯
            </div>
          ),
        )}
        <div className="mt-1 flex justify-between gap-3 border-t border-line pt-2">
          <dt className="text-ink-muted">{t('apply.interest')}</dt>
          <dd className="font-medium tabular-nums">{formatSum(interest)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-muted">{t('apply.total')}</dt>
          <dd className="font-bold tabular-nums">{formatSum(total)}</dd>
        </div>
      </dl>
    </div>
  )
}

function Bullets({ items }: { items: TranslationKey[] }) {
  const { t } = useI18n()
  return (
    <ul className="flex flex-col gap-2.5 rounded-card border border-line bg-canvas p-4">
      {items.map((key) => (
        <li key={key} className="flex gap-2.5">
          <Check size={18} className="mt-0.5 shrink-0 text-brand" />
          <span className="text-sm">{t(key)}</span>
        </li>
      ))}
    </ul>
  )
}
