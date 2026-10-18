import {
  Bell,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  CreditCard,
  Headset,
  Phone,
  Zap,
} from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { productOf, progressOf, type Loan, useLoans } from '@/entities/loans/loans'
import { session, useBorrower } from '@/entities/session/session'
import { BRAND, type Product } from '@/shared/config/brand'
import { applyPath, ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { formatDate, formatSum } from '@/shared/lib/format'
import { formatPhone } from '@/shared/lib/phone'
import { BrandMark } from '@/shared/ui/BrandMark'
import { Button } from '@/shared/ui/Button'
import { Section } from '@/shared/ui/Section'

const millions = (sum: number) => `${sum / 1_000_000}`
const rateText = ([from, to]: [number, number]) => (from === to ? `${from}%` : `${from}–${to}%`)

/**
 * Asosiy. With a running loan: what is left and the next payment first, with "Toʻlash", then
 * quick actions. Without one: the offer and "Qarz olish", the products, how it works. Support
 * is at the bottom either way.
 */
export function HomePage() {
  const { t } = useI18n()
  const borrower = useBorrower()
  const loans = useLoans(borrower?.phone)
  if (!borrower || !session.hasPin()) return <Navigate to={ROUTES.auth} replace />
  const active = loans.find((loan) => !loan.closedAt)
  const initials = borrower.fullName
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')

  return (
    <div className="flex min-h-full flex-col gap-7 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-tabbar">
      <header className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent-200 text-sm font-bold text-brand">
          {initials}
        </span>
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <p className="truncate text-lg font-bold">
            {t('home.greeting', { name: borrower.firstName })}
          </p>
          <p className="text-sm text-ink-muted">{BRAND.name}</p>
        </div>
        <button
          type="button"
          aria-label={t('home.notifications')}
          className="relative grid size-11 place-items-center rounded-full border border-line bg-canvas text-brand active:bg-neutral-100"
        >
          <Bell size={22} />
          <span className="absolute top-2.5 right-2.5 size-2.5 rounded-full bg-primary ring-2 ring-canvas" />
        </button>
      </header>

      {active ? <ActiveLoan loan={active} /> : <Offer />}

      {active && (
        <div className="grid grid-cols-4 gap-2">
          {(
            [
              [CalendarDays, 'home.action.schedule', ROUTES.loans],
              [Zap, 'home.action.early', ROUTES.loans],
              [CreditCard, 'home.action.cards', ROUTES.payments],
              [Headset, 'home.action.support', ROUTES.profile],
            ] as const
          ).map(([Icon, label, to]) => (
            <Link
              key={label}
              to={to}
              className="flex flex-col items-center gap-2 text-center text-xs leading-tight font-medium"
            >
              <span className="grid size-14 place-items-center rounded-card border border-line bg-canvas text-brand">
                <Icon size={24} />
              </span>
              {t(label)}
            </Link>
          ))}
        </div>
      )}

      <Section title={t(active ? 'home.more' : 'home.products')}>
        <ul className="flex flex-col gap-3">
          {BRAND.products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </Section>

      {!active && (
        <Section title={t('home.how')}>
          <ol className="flex flex-col rounded-card border border-line bg-canvas px-4">
            {(['calc', 'apply', 'sign', 'card'] as const).map((step, i) => (
              <li
                key={step}
                className="flex items-start gap-3 border-b border-line py-3.5 last:border-b-0"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-200 text-sm font-bold text-brand">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-0.5">
                  <p className="font-semibold">{t(`home.how.${step}`)}</p>
                  <p className="text-sm text-ink-muted">{t(`home.how.${step}.hint`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      <section className="flex items-center gap-3 rounded-card border border-line bg-canvas p-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-surface text-brand">
          <Phone size={20} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="font-semibold">{t('home.support')}</p>
          <p className="text-sm text-ink-muted tabular-nums">{formatPhone(BRAND.phone)}</p>
        </div>
        <Link
          to={ROUTES.profile}
          className="h-10 rounded-full border border-line px-4 text-sm leading-10 font-semibold text-brand active:bg-neutral-100"
        >
          {t('home.chat')}
        </Link>
      </section>
    </div>
  )
}

/** The running loan on a dark card: what is left, how far along, and the next payment. */
function ActiveLoan({ loan }: { loan: Loan }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { next, remaining, principalLeft, paid, total } = progressOf(loan)
  const product = productOf(loan)
  const late = !!loan.overdueSince

  return (
    <section className="flex flex-col gap-3">
      {late && (
        <p className="flex items-center gap-2.5 rounded-control bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">
          <CircleAlert size={20} className="shrink-0" />
          {t('home.loan.late')}
        </p>
      )}
      <div className="relative flex flex-col gap-5 overflow-hidden rounded-[28px] bg-tile p-5 text-on-tile">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <span className="font-semibold">{product?.name}</span>
            <span className="text-xs opacity-60 tabular-nums">№ {loan.number}</span>
          </div>
          <Link
            to={ROUTES.loans}
            className="flex items-center gap-0.5 text-sm font-semibold opacity-80"
          >
            {t('home.loan.details')}
            <ChevronRight size={16} />
          </Link>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm opacity-60">{t('home.loan.left')}</span>
          <span className="text-[32px] leading-none font-bold tracking-tight tabular-nums">
            {formatSum(principalLeft)}
          </span>
          <span className="text-xs opacity-60 tabular-nums">
            {t('home.loan.withInterest', { sum: formatSum(remaining) })}
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="h-2 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-accent-500"
              style={{ width: `${(paid / total) * 100}%` }}
            />
          </div>
          <span className="text-xs opacity-60 tabular-nums">
            {t('home.loan.progress', { paid: String(paid), total: String(total) })}
          </span>
        </div>
        {next && (
          <div className="relative flex items-center gap-3 rounded-control bg-white/10 p-3">
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-xs opacity-70">
                {t('home.loan.next', { date: formatDate(next.due) })}
              </span>
              <span className="text-lg font-bold tabular-nums">{formatSum(next.amount)}</span>
            </div>
            <Button size="sm" className="px-5!" onClick={() => navigate(ROUTES.payments)}>
              {t('home.loan.pay')}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

/** No loan yet: the biggest sum on offer and the way in. */
function Offer() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const max = Math.max(...BRAND.products.map((product) => product.max))
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

/** One product: its name and kind, who it is for, and its three numbers. */
function ProductCard({ product }: { product: Product }) {
  const { t, tl } = useI18n()
  const facts = [
    t('home.product.max', { sum: millions(product.max) }),
    t('home.product.rate', { rate: rateText(product.rate) }),
    t('home.product.term', { months: String(product.termMax) }),
  ]
  return (
    <Link
      to={applyPath(product.id)}
      className="flex flex-col gap-3 rounded-card border border-line bg-canvas p-4 active:bg-neutral-100"
    >
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
  )
}
