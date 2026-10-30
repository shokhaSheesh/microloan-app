import {
  Bell,
  CalendarDays,
  ChevronRight,
  Clock,
  CreditCard,
  FileClock,
  Headset,
  Layers,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { isOffer, isPending, useArizalar, type Ariza } from '@/entities/applications/applications'
import { useNotifications } from '@/entities/notifications/notifications'
import { OverdueNotice } from '@/features/loans/components/OverdueNotice'
import { productOf, progressOf, type Loan, useLoans } from '@/entities/loans/loans'
import { session, useBorrower } from '@/entities/session/session'
import { BRAND } from '@/shared/config/brand'
import { loanPath, loansPath, payPath, ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatDate, formatSum } from '@/shared/lib/format'
import { BrandMark } from '@/shared/ui/BrandMark'
import { Button } from '@/shared/ui/Button'
import { Section } from '@/shared/ui/Section'
import { BannerCarousel } from '../components/BannerCarousel'

/**
 * Asosiy, top to bottom: an ariza still in play (being checked, or an offer to sign); the
 * running loan with "Toʻlash", or the offer with "Qarz olish"; four quick actions; the banners;
 * and, before the first loan, how it works. The quick actions show in both cases, and both
 * have Kreditlar, so the products are always one tap away now that banners took their place.
 */
export function HomePage() {
  const { t } = useI18n()
  const borrower = useBorrower()
  const loans = useLoans(borrower?.passport)
  const pending = useArizalar(borrower?.passport).find((item) => isPending(item.status))
  const unread = useNotifications(borrower?.passport).some((item) => !item.read)
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
        <Link
          to={ROUTES.notifications}
          aria-label={t('home.notifications')}
          className="relative grid size-11 place-items-center rounded-full border border-line bg-canvas text-brand active:bg-neutral-100"
        >
          <Bell size={22} />
          {unread && (
            <span className="absolute top-2.5 right-2.5 size-2.5 rounded-full bg-primary ring-2 ring-canvas" />
          )}
        </Link>
      </header>

      {pending && <PendingAriza ariza={pending} />}

      {active ? <ActiveLoan loan={active} /> : <Offer />}

      <QuickActions
        actions={
          active
            ? [
                [CalendarDays, 'home.action.schedule', loanPath(active.id)],
                [Wallet, 'home.action.pay', payPath(active.id)],
                [Layers, 'home.action.credits', ROUTES.credits],
                [Headset, 'home.action.support', ROUTES.chat],
              ]
            : [
                [Layers, 'home.action.credits', ROUTES.credits],
                [FileClock, 'home.action.applications', loansPath('applications')],
                [CreditCard, 'home.action.cards', ROUTES.cards],
                [Headset, 'home.action.support', ROUTES.chat],
              ]
        }
      />

      <BannerCarousel />

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
    </div>
  )
}

/** The running loan on a dark card: what is left, how far along, and the next payment. */
function ActiveLoan({ loan }: { loan: Loan }) {
  const { t } = useI18n()
  const { next, remaining, principalLeft, paid, total } = progressOf(loan)
  const product = productOf(loan)
  const late = !!loan.overdueSince

  return (
    <section className="flex flex-col gap-3">
      {late && <OverdueNotice loan={loan} />}
      <div className="relative flex flex-col gap-5 overflow-hidden rounded-[28px] bg-tile p-5 text-on-tile">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <span className="font-semibold">{product?.name}</span>
            <span className="text-xs opacity-60 tabular-nums">№ {loan.number}</span>
          </div>
          <Link
            to={loanPath(loan.id)}
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
              className="h-full rounded-full bg-white"
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
            <Link
              to={payPath(loan.id)}
              className="grid h-10 place-items-center rounded-control bg-white px-5 text-sm font-semibold text-primary-pressed active:bg-neutral-100"
            >
              {t('home.loan.pay')}
            </Link>
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

type Action = readonly [LucideIcon, Parameters<ReturnType<typeof useI18n>['t']>[0], string]

/** Four round-cornered buttons under the card. */
function QuickActions({ actions }: { actions: Action[] }) {
  const { t } = useI18n()
  return (
    <nav aria-label={t('home.actions')} className="grid grid-cols-4 gap-2">
      {actions.map(([Icon, label, to]) => (
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
    </nav>
  )
}

/** An ariza still in play: being checked, or an offer waiting for the signature. Opens Arizalar. */
function PendingAriza({ ariza }: { ariza: Ariza }) {
  const { t } = useI18n()
  const product = BRAND.products.find((item) => item.id === ariza.productId)
  const offer = isOffer(ariza.status)
  return (
    <Link
      to={loansPath('applications')}
      className="flex items-center gap-3 rounded-card border border-line bg-canvas p-4 active:bg-neutral-100"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-200 text-brand">
        <Clock size={20} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-semibold">{t(offer ? 'home.ariza.offer' : 'home.ariza.review')}</span>
        <span className="truncate text-sm text-ink-muted tabular-nums">
          {product?.name} · {formatSum(ariza.offered ?? ariza.amount)} · № {ariza.number}
        </span>
      </span>
      <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
    </Link>
  )
}
