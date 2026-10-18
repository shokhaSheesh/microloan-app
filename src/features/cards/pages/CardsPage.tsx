import { CreditCard, Lock, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { cardText, removeCard, useCards } from '@/entities/cards/cards'
import { useLoans } from '@/entities/loans/loans'
import { useBorrower } from '@/entities/session/session'
import { useI18n } from '@/shared/i18n/useI18n'
import { toast } from '@/shared/lib/toast'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PageHeader } from '@/shared/ui/PageHeader'
import { AddCardSheet } from '../components/AddCardSheet'

/**
 * Kartalarim, from Profil: the linked Uzcard and Humo cards. A card a running loan is paid from
 * stays, or the schedule would have nowhere to take money; the rest can be removed.
 */
export function CardsPage() {
  const { t } = useI18n()
  const borrower = useBorrower()
  const cards = useCards(borrower?.passport)
  const loans = useLoans(borrower?.passport)
  const [adding, setAdding] = useState(false)
  if (!borrower) return null
  const inUse = (last4: string) => loans.some((loan) => !loan.closedAt && loan.card.last4 === last4)

  return (
    <div className="flex h-full flex-col bg-page">
      <PageHeader title={t('cards.title')} />
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pt-2 pb-6">
        {cards.length === 0 && <EmptyState title={t('cards.empty')} hint={t('cards.empty.hint')} />}
        {cards.map((card) => (
          <div
            key={card.id}
            className="flex items-center gap-3 rounded-card bg-tile p-4 text-on-tile"
          >
            <CreditCard size={22} className="shrink-0 opacity-80" />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-semibold tracking-wide tabular-nums">{cardText(card)}</span>
              <span className="text-xs opacity-60 tabular-nums">
                {card.expiry.slice(0, 2)}/{card.expiry.slice(2)}
              </span>
            </div>
            {inUse(card.last4) ? (
              <span title={t('cards.inUse')} className="flex items-center gap-1 text-xs opacity-70">
                <Lock size={14} />
                {t('cards.inUse.short')}
              </span>
            ) : (
              <button
                type="button"
                aria-label={t('cards.remove')}
                onClick={() => {
                  removeCard(borrower.passport, card.id)
                  toast(t('cards.removed'))
                }}
                className="-mr-2 grid size-10 place-items-center rounded-full opacity-80 active:bg-white/15"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        ))}
        <Button variant="secondary" block onClick={() => setAdding(true)}>
          <Plus size={20} />
          {t('cards.add')}
        </Button>
      </div>
      {adding && <AddCardSheet owner={borrower.passport} onClose={() => setAdding(false)} />}
    </div>
  )
}
