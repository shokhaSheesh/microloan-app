import { Ban, CircleX, CreditCard, LogOut, Phone, ShieldAlert } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { lateSample, runningSample } from '@/entities/loans/loans'
import { useBorrower } from '@/entities/session/session'
import { PayoutFailed } from '@/features/apply/components/PayoutFailed'
import { OfferCard } from '@/features/home/components/OfferCard'
import { ActiveLoanCard } from '@/features/loans/components/ActiveLoanCard'
import { CODE_BLOCK_MINUTES } from '@/shared/config/otp'
import { BRAND } from '@/shared/config/brand'
import { ROUTES } from '@/shared/config/routes'
import type { TranslationKey } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatDate, formatSum } from '@/shared/lib/format'
import { formatPhone } from '@/shared/lib/phone'
import { useCountdown } from '@/shared/lib/useCountdown'
import { Button } from '@/shared/ui/Button'
import { NumberField } from '@/shared/ui/NumberField'
import { Slider } from '@/shared/ui/Slider'
import { CodeBlocked } from '@/shared/ui/CodeBlocked'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ResultScreen } from '@/shared/ui/ResultScreen'

/** One screen of «Holatlar namunasi», drawn with the real components and sample data. */
export function StatePreviewPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const borrower = useBorrower()
  const [blockedFor] = useCountdown(CODE_BLOCK_MINUTES * 60)
  const back = () => navigate(-1)
  const [in30] = useState(() => new Date(Date.now() + 30 * 86_400_000))
  const phone = formatPhone(borrower?.phone ?? '')

  // Asosiy's loan card, on its own under a header
  const card = (title: TranslationKey, body: ReactNode) => (
    <div className="flex h-full flex-col bg-page">
      <PageHeader title={t(title)} />
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pt-2 pb-6">
        {body}
      </div>
    </div>
  )

  switch (id) {
    case 'credit':
      return card('states.home.credit', <ActiveLoanCard loan={runningSample()} />)
    case 'noCredit':
      return card('states.home.noCredit', <OfferCard />)
    case 'overdue':
      return card('states.home.overdue', <ActiveLoanCard loan={lateSample()} />)
    case 'codeBlocked':
      return <CodeBlocked seconds={blockedFor} onBack={back} />
    case 'clientBlocked':
      return (
        <ResultScreen
          tone="danger"
          icon={Ban}
          title={t('blocked.title')}
          text={t('blocked.text', { brand: BRAND.name })}
          primary={{ label: t('blocked.pay'), onClick: back }}
          secondary={{ label: t('blocked.call'), onClick: back }}
          onBack={back}
        />
      )
    case 'notOwner':
      return (
        <ResultScreen
          tone="danger"
          icon={Phone}
          title={t('owner.title')}
          text={t('owner.text', { phone })}
          primary={{ label: t('device.failed.other'), onClick: back }}
          onBack={back}
        />
      )
    case 'cardPhone':
      return (
        <ResultScreen
          tone="danger"
          icon={CreditCard}
          title={t('cardPhone.title')}
          text={t('cardPhone.text', { phone })}
          note={t('cardPhone.note')}
          primary={{ label: t('cardPhone.other'), onClick: back }}
          onBack={back}
        />
      )
    case 'deviceFailed':
      return (
        <ResultScreen
          tone="danger"
          icon={ShieldAlert}
          title={t('device.failed.title')}
          text={t('device.failed.text')}
          primary={{ label: t('device.failed.retry'), onClick: back }}
          secondary={{ label: t('device.failed.other'), onClick: back }}
          onBack={back}
        />
      )
    case 'cardsGone':
      return (
        <ResultScreen
          tone="warning"
          icon={CreditCard}
          title={t('device.cards.title')}
          text={t('device.cards.text')}
          primary={{ label: t('device.cards.next'), onClick: back }}
          onBack={back}
        />
      )
    case 'otherDevice':
      return (
        <ResultScreen
          tone="warning"
          icon={LogOut}
          title={t('otherDevice.title')}
          text={t('otherDevice.text')}
          primary={{ label: t('otherDevice.signIn'), onClick: back }}
          secondary={{ label: t('otherDevice.help'), onClick: back }}
          onBack={back}
        />
      )
    case 'declinedBlock':
      return (
        <ResultScreen
          tone="danger"
          icon={CircleX}
          title={t('decision.declined')}
          text={t('declinedBlock.text', { days: '30', date: formatDate(in30) })}
          note={t('declinedBlock.note')}
          primary={{ label: t('decision.home'), onClick: back }}
          onBack={back}
        />
      )
    case 'biggerSum':
      return <BiggerSum onBack={back} />
    case 'payoutFailed':
      return (
        <PayoutFailed amount={10_000_000} card="Uzcard •••• 8812" onDone={back} onBack={back} />
      )
    default:
      return <Navigate to={ROUTES.states} replace />
  }
}

const ASKED = 10_000_000
const APPROVED = 15_000_000
const STEP = 500_000

/**
 * FlexSoft approved more than the client asked for: the bigger sum on the card, and the client picks
 * how much to take, from the sum asked up to the one approved, before the contract.
 */
function BiggerSum({ onBack }: { onBack: () => void }) {
  const { t } = useI18n()
  const [sum, setSum] = useState<number | null>(ASKED)
  const ok = sum !== null && sum >= STEP && sum <= APPROVED
  return (
    <div className="flex h-full flex-col bg-page">
      <PageHeader title={t('biggerSum.title')} />
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pt-2 pb-6">
        <div className="flex flex-col items-center gap-1 rounded-[28px] bg-tile p-5 text-center text-on-tile">
          <span className="text-sm opacity-70">{t('biggerSum.approved')}</span>
          <span className="text-[30px] leading-none font-bold tabular-nums">
            {formatSum(APPROVED)}
          </span>
          <span className="text-sm opacity-80">
            {t('biggerSum.asked', { sum: formatSum(ASKED) })}
          </span>
        </div>
        <section className="flex flex-col gap-4 rounded-card border border-line bg-canvas p-4">
          <NumberField
            label={t('biggerSum.pick')}
            value={sum}
            onChange={setSum}
            suffix={t('common.currency')}
            error={
              sum !== null && sum > APPROVED
                ? t('apply.amount.max', { sum: formatSum(APPROVED) })
                : undefined
            }
          />
          <Slider
            label={t('biggerSum.pick')}
            min={STEP}
            max={APPROVED}
            step={STEP}
            value={Math.min(APPROVED, Math.max(STEP, sum ?? STEP))}
            onChange={setSum}
          />
        </section>
      </div>
      <div className="shrink-0 border-t border-line bg-page px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button block disabled={!ok} onClick={onBack}>
          {t('decision.toContract')}
        </Button>
      </div>
    </div>
  )
}
