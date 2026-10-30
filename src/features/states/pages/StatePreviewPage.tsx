import { Ban, CreditCard, Phone, ShieldAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { lateSample, runningSample } from '@/entities/loans/loans'
import { useBorrower } from '@/entities/session/session'
import { PayoutFailed } from '@/features/apply/components/PayoutFailed'
import { ActiveLoan, Offer } from '@/features/home/pages/HomePage'
import { CODE_BLOCK_MINUTES } from '@/shared/config/otp'
import { BRAND } from '@/shared/config/brand'
import { ROUTES } from '@/shared/config/routes'
import type { TranslationKey } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone } from '@/shared/lib/phone'
import { useCountdown } from '@/shared/lib/useCountdown'
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
      return card('states.home.credit', <ActiveLoan loan={runningSample()} />)
    case 'noCredit':
      return card('states.home.noCredit', <Offer />)
    case 'overdue':
      return card('states.home.overdue', <ActiveLoan loan={lateSample()} />)
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
    case 'payoutFailed':
      return (
        <PayoutFailed amount={10_000_000} card="Uzcard •••• 8812" onDone={back} onBack={back} />
      )
    default:
      return <Navigate to={ROUTES.states} replace />
  }
}
