import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { RefuseSheet } from '@/features/apply/components/RefuseSheet'
import {
  isOffer,
  useArizalar,
  type Ariza,
  type ArizaStatus,
} from '@/entities/applications/applications'
import { productOf, progressOf, useLoans, type Loan } from '@/entities/loans/loans'
import { useBorrower } from '@/entities/session/session'
import { BRAND } from '@/shared/config/brand'
import { loanPath, ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { formatDate, formatDateTime, formatSum } from '@/shared/lib/format'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ActiveLoanCard } from '../components/ActiveLoanCard'
import { SegmentedTabs } from '@/shared/ui/SegmentedTabs'
import { StatusBadge, type StatusTone } from '@/shared/ui/StatusBadge'

type Tab = 'active' | 'applications' | 'closed'

const TONES: Record<ArizaStatus, StatusTone> = {
  review: 'info',
  approved: 'warning',
  counter: 'warning',
  signed: 'info',
  payoutRetry: 'warning',
  paidOut: 'success',
  declined: 'danger',
  expired: 'neutral',
  refused: 'neutral',
}

/**
 * Qarzlarim: the running loans, the arizalar with where each stands, or the closed loans. The
 * tab is in the address (`?tab=applications`), so Asosiy can open Arizalar directly.
 */
export function LoansPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const borrower = useBorrower()
  const loans = useLoans(borrower?.passport)
  const active = loans.filter((loan) => !loan.closedAt)
  const closed = loans.filter((loan) => loan.closedAt)
  const arizalar = useArizalar(borrower?.passport)
  const [params, setParams] = useSearchParams()
  const asked = params.get('tab')
  const tab: Tab =
    asked === 'applications' || asked === 'closed'
      ? asked
      : active.length || !closed.length
        ? 'active'
        : 'closed'
  const setTab = (next: Tab) => setParams(next === 'active' ? {} : { tab: next }, { replace: true })
  const shown = tab === 'active' ? active : closed

  return (
    <div className="flex min-h-full flex-col gap-5 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-tabbar">
      <h1 className="text-2xl font-bold">{t('nav.loans')}</h1>
      <SegmentedTabs
        label={t('nav.loans')}
        options={[
          { value: 'active', label: t('loans.active', { count: String(active.length) }) },
          {
            value: 'applications',
            label: t('loans.applications', { count: String(arizalar.length) }),
          },
          { value: 'closed', label: t('loans.closed', { count: String(closed.length) }) },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'applications' ? (
        arizalar.length === 0 ? (
          <EmptyState title={t('loans.empty.applications')} />
        ) : (
          <ul className="flex flex-col gap-3">
            {arizalar.map((ariza) => (
              <li key={ariza.id}>
                <ArizaCard ariza={ariza} />
              </li>
            ))}
          </ul>
        )
      ) : shown.length === 0 ? (
        <div className="flex flex-col items-center gap-4">
          <EmptyState
            title={t(tab === 'active' ? 'loans.empty.active' : 'loans.empty.closed')}
            hint={tab === 'active' ? t('loans.empty.hint') : undefined}
          />
          {tab === 'active' && (
            <Button onClick={() => navigate(ROUTES.apply)}>{t('home.offer.cta')}</Button>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((loan) => (
            <li key={loan.id}>
              {loan.closedAt ? <LoanCard loan={loan} /> : <ActiveLoanCard loan={loan} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** One loan: product and number, what is left (or when it closed), progress, the next payment. */
function LoanCard({ loan }: { loan: Loan }) {
  const { t } = useI18n()
  const { next, principalLeft, paid, total } = progressOf(loan)
  const product = productOf(loan)
  return (
    <Link
      to={loanPath(loan.id)}
      className="flex flex-col gap-4 rounded-card border border-line bg-canvas p-4 active:bg-neutral-100"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <span className="font-bold">{product?.name}</span>
          <span className="text-xs text-ink-muted tabular-nums">
            № {loan.number} · {formatSum(loan.amount)}
          </span>
        </div>
        <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
      </div>
      {loan.closedAt ? (
        <p className="flex items-center gap-2 text-sm font-semibold text-success">
          {t('loans.closedOn', { date: formatDate(loan.closedAt) })}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-ink-muted">{t('home.loan.left')}</span>
            <span className="text-2xl leading-none font-bold tabular-nums">
              {formatSum(principalLeft)}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-accent-500"
                style={{ width: `${(paid / total) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-ink-muted tabular-nums">
              <span>{t('home.loan.progress', { paid: String(paid), total: String(total) })}</span>
              {next && (
                <span className={cn(loan.overdueSince && 'font-semibold text-danger')}>
                  {t('loans.next', { date: formatDate(next.due), sum: formatSum(next.amount) })}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </Link>
  )
}

/**
 * One ariza: number, product and when it was sent, its status; the sum and term; for an offer
 * the sum offered and "Imzolash", after a decline the day a new one is accepted. A paid-out
 * ariza opens its loan.
 */
function ArizaCard({ ariza }: { ariza: Ariza }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const borrower = useBorrower()
  const [refusing, setRefusing] = useState(false)
  const product = BRAND.products.find((item) => item.id === ariza.productId)
  const sum = ariza.offered ?? ariza.amount
  // One line under the title saying what happens next, by status
  const note =
    ariza.status === 'review'
      ? t('ariza.note.review')
      : isOffer(ariza.status) && ariza.expiresOn
        ? t('ariza.note.validUntil', { date: formatDate(ariza.expiresOn) })
        : ariza.status === 'signed'
          ? t('ariza.note.signed')
          : ariza.status === 'expired' && ariza.expiresOn
            ? t('ariza.note.expired', { date: formatDate(ariza.expiresOn) })
            : ariza.status === 'refused' && ariza.refusal
              ? `${t('refuse.because')} ${t(`refuse.reason.${ariza.refusal.reason}`).toLowerCase()}${ariza.refusal.note ? `: ${ariza.refusal.note}` : ''}`
              : null
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="font-semibold tabular-nums">№ {ariza.number}</span>
          <span className="text-sm text-ink-muted tabular-nums">
            {product?.name} · {formatDateTime(ariza.createdAt)}
          </span>
        </div>
        <StatusBadge tone={TONES[ariza.status]}>{t(`ariza.status.${ariza.status}`)}</StatusBadge>
      </div>
      {ariza.status === 'declined' && (
        <div className="flex flex-col gap-1 rounded-control bg-danger-soft px-3 py-2.5 text-sm">
          {ariza.reason && (
            <p className="font-medium text-danger">{t(`ariza.reason.${ariza.reason}`)}</p>
          )}
          {ariza.reapplyOn && (
            <p className="text-ink-muted">
              {t('ariza.reapply', { date: formatDate(ariza.reapplyOn) })}
            </p>
          )}
        </div>
      )}
      {ariza.status === 'counter' && (
        <p className="text-sm text-ink-muted">
          {t('ariza.counter', {
            asked: formatSum(ariza.amount),
            offered: formatSum(sum),
          })}
        </p>
      )}
      {note && <p className="text-sm text-ink-muted">{note}</p>}
      <div className="flex items-center justify-between gap-3 border-t border-line pt-3 text-sm">
        <span className="text-ink-muted">
          {t('apply.months', { n: String(ariza.term) })} ·{' '}
          <span className="font-bold text-ink tabular-nums">{formatSum(sum)}</span>
        </span>
        {isOffer(ariza.status) && (
          <span className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="px-3! text-danger!"
              onClick={() => setRefusing(true)}
            >
              {t('refuse.open')}
            </Button>
            <Button
              size="sm"
              className="px-4!"
              onClick={() => navigate(`${ROUTES.application}?ariza=${ariza.id}`)}
            >
              {t('ariza.sign')}
            </Button>
          </span>
        )}
      </div>
    </>
  )
  const box = 'flex flex-col gap-3 rounded-card border border-line bg-canvas p-4'
  const sheet = refusing && borrower && (
    <RefuseSheet owner={borrower.passport} arizaId={ariza.id} onClose={() => setRefusing(false)} />
  )
  return ariza.loanId ? (
    <Link to={loanPath(ariza.loanId)} className={cn(box, 'active:bg-neutral-100')}>
      {body}
    </Link>
  ) : (
    <div className={box}>
      {body}
      {sheet}
    </div>
  )
}
