import {
  Ban,
  Banknote,
  CircleAlert,
  Clock,
  CreditCard,
  FileSignature,
  House,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { statePath } from '@/shared/config/routes'
import type { TranslationKey } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { MenuList, MenuRow } from '@/shared/ui/MenuList'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Section } from '@/shared/ui/Section'
import { SelfCheckSheet, type SelfCheckAction } from '@/shared/ui/SelfCheck'

type Row = [id: string, icon: LucideIcon, label: TranslationKey]

const HOME: Row[] = [
  ['credit', Wallet, 'states.home.credit'],
  ['noCredit', House, 'states.home.noCredit'],
  ['overdue', CircleAlert, 'states.home.overdue'],
]
const SECURITY: Row[] = [
  ['codeBlocked', Clock, 'states.codeBlocked'],
  ['clientBlocked', Ban, 'states.clientBlocked'],
  ['notOwner', Smartphone, 'states.notOwner'],
  ['cardPhone', CreditCard, 'states.cardPhone'],
  ['deviceFailed', ShieldAlert, 'states.deviceFailed'],
  ['cardsGone', CreditCard, 'states.cardsGone'],
]
const SELF_CHECKS: [SelfCheckAction, LucideIcon, TranslationKey][] = [
  ['apply', ShieldCheck, 'states.selfcheck.apply'],
  ['sign', FileSignature, 'states.selfcheck.sign'],
  ['pay', Wallet, 'states.selfcheck.pay'],
]

/**
 * «Holatlar namunasi»: the states a real build needs but the sample data never shows. Asosiy
 * with and without a loan and when a payment is late; the Nizom security errors; the payout that
 * failed; the «Oʻzim bajaryapman» sheets. Rows open the screen as the borrower would see it.
 */
export function StatesPage() {
  const { t } = useI18n()
  const [check, setCheck] = useState<SelfCheckAction | null>(null)
  const rows = (list: Row[]) =>
    list.map(([id, icon, label]) => (
      <MenuRow key={id} icon={icon} label={t(label)} to={statePath(id)} />
    ))

  return (
    <div className="flex h-full flex-col bg-page">
      <PageHeader title={t('states.title')} />
      <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-5 pt-2 pb-8">
        <p className="text-ink-muted">{t('states.hint')}</p>
        <Section title={t('states.home')}>
          <MenuList>{rows(HOME)}</MenuList>
        </Section>
        <Section title={t('states.security')} hint={t('states.security.hint')}>
          <MenuList>{rows(SECURITY)}</MenuList>
        </Section>
        <Section title={t('states.money')}>
          <MenuList>
            {rows([['payoutFailed', Banknote, 'states.payoutFailed']])}
            {SELF_CHECKS.map(([action, icon, label]) => (
              <MenuRow key={action} icon={icon} label={t(label)} onClick={() => setCheck(action)} />
            ))}
          </MenuList>
        </Section>
      </div>
      <SelfCheckSheet
        open={!!check}
        action={check ?? 'pay'}
        onCancel={() => setCheck(null)}
        onConfirm={() => setCheck(null)}
      />
    </div>
  )
}
