import {
  ChevronRight,
  Clock,
  CreditCard,
  Headset,
  Layers,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { isOffer, isPending, useArizalar, type Ariza } from '@/entities/applications/applications'
import { useNotifications } from '@/entities/notifications/notifications'
import { OverdueNotice } from '@/features/loans/components/OverdueNotice'
import { useLoans } from '@/entities/loans/loans'
import { session, useBorrower } from '@/entities/session/session'
import { BRAND } from '@/shared/config/brand'
import { loansPath, payPath, ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum } from '@/shared/lib/format'
import { Section } from '@/shared/ui/Section'
import { BannerCarousel } from '../components/BannerCarousel'
import { HomeHero } from '../components/HomeHero'

/**
 * Asosiy, top to bottom: the theme header with the greeting and the story tiles; an ariza still
 * in play (being checked, or an offer to sign); the overdue card when a payment is late; the
 * four quick actions (Kreditlar, Toʻlov, Kartalar, Yordam); the banners; and how a loan is
 * taken, always. The running loan itself is on Qarzlarim.
 */
export function HomePage() {
  const { t } = useI18n()
  const borrower = useBorrower()
  const loans = useLoans(borrower?.passport)
  const pending = useArizalar(borrower?.passport).find((item) => isPending(item.status))
  const unread = useNotifications(borrower?.passport).some((item) => !item.read)
  if (!borrower || !session.hasPin()) return <Navigate to={ROUTES.auth} replace />
  const active = loans.find((loan) => !loan.closedAt)

  return (
    <div className="flex min-h-full flex-col gap-7 px-5 pb-tabbar">
      <HomeHero borrower={borrower} unread={unread} />

      {pending && <PendingAriza ariza={pending} />}

      {/* The loan itself lives in Qarzlarim; Asosiy only warns when a payment is late */}
      {active?.overdueSince && <OverdueNotice loan={active} />}

      {/* Kreditlar, Toʻlov, Kartalar, Yordam, as the brand's admin orders them */}
      <QuickActions
        actions={[
          [Layers, 'home.action.credits', ROUTES.credits],
          [Wallet, 'home.action.pay', active ? payPath(active.id) : ROUTES.payments],
          [CreditCard, 'home.action.cards', ROUTES.cards],
          [Headset, 'home.action.support', ROUTES.chat],
        ]}
      />

      <BannerCarousel />

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
    </div>
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
