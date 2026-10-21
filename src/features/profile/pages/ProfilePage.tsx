import {
  ArrowLeftRight,
  ChevronRight,
  CircleHelp,
  CreditCard,
  FileText,
  Globe,
  LogOut,
  MessageCircle,
  Phone,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useContacts } from '@/entities/contacts/contacts'
import { useCards } from '@/entities/cards/cards'
import { session, useBorrower } from '@/entities/session/session'
import { ALL_BRANDS, BRAND, switchBrand } from '@/shared/config/brand'
import { ROUTES } from '@/shared/config/routes'
import { LANG_NAMES } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone } from '@/shared/lib/phone'
import { toast } from '@/shared/lib/toast'
import { ActionCard } from '@/shared/ui/ActionCard'
import { ConfirmSheet } from '@/shared/ui/ConfirmSheet'
import { MenuList, MenuRow } from '@/shared/ui/MenuList'
import { Section } from '@/shared/ui/Section'

/**
 * Profil: who is signed in (opens the personal data), then Hisob (cards), Sozlamalar (security,
 * language), Yordam (FAQ, chat, contacts), the documents, the prototype's switch to the other
 * brand's app, and "Chiqish".
 */
export function ProfilePage() {
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const borrower = useBorrower()
  const cards = useCards(borrower?.passport)
  const contacts = useContacts(borrower?.passport)
  const [leaving, setLeaving] = useState(false)
  if (!borrower) return null
  const initials = borrower.fullName
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')

  return (
    <div className="flex min-h-full flex-col gap-7 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-tabbar">
      <h1 className="text-2xl font-bold">{t('nav.profile')}</h1>

      <Link
        to={ROUTES.personal}
        className="flex items-center gap-4 rounded-card border border-line bg-canvas p-4 active:bg-neutral-100"
      >
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-accent-200 text-xl font-bold text-brand">
          {initials}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-lg leading-tight font-bold">{borrower.fullName}</p>
          <p className="text-ink-muted tabular-nums">{formatPhone(borrower.phone)}</p>
        </div>
        <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
      </Link>

      <Section title={t('profile.account')}>
        <MenuList>
          <MenuRow
            icon={CreditCard}
            label={t('cards.title')}
            to={ROUTES.cards}
            value={String(cards.length)}
          />
          <MenuRow
            icon={Users}
            label={t('myContacts.title')}
            to={ROUTES.myContacts}
            value={String(contacts.length)}
          />
        </MenuList>
      </Section>

      <Section title={t('profile.settings')}>
        <MenuList>
          <MenuRow icon={ShieldCheck} label={t('profile.security')} to={ROUTES.security} />
          <MenuRow
            icon={Globe}
            label={t('lang.title')}
            to={ROUTES.language}
            value={LANG_NAMES[lang]}
          />
        </MenuList>
      </Section>

      <Section title={t('profile.help')}>
        <MenuList>
          <MenuRow icon={CircleHelp} label={t('profile.faq')} to={ROUTES.faq} />
          <MenuRow icon={MessageCircle} label={t('profile.chat')} to={ROUTES.chat} />
          <MenuRow icon={Phone} label={t('profile.contacts')} to={ROUTES.contacts} />
        </MenuList>
      </Section>

      <Section title={t('profile.documents')}>
        <ul className="rounded-card border border-line bg-canvas px-4">
          {(['offer', 'privacy'] as const).map((doc) => (
            <li key={doc} className="border-b border-line last:border-b-0">
              <button
                type="button"
                onClick={() => toast(t('loan.pdf.sample'))}
                className="flex min-h-13 w-full items-center gap-3 py-2 text-left"
              >
                <FileText size={22} className="shrink-0 text-brand" />
                <span className="min-w-0 flex-1 font-medium">{t(`profile.doc.${doc}`)}</span>
              </button>
            </li>
          ))}
        </ul>
      </Section>

      {ALL_BRANDS.filter((brand) => brand.id !== BRAND.id).map((brand) => (
        <ActionCard
          key={brand.id}
          icon={ArrowLeftRight}
          title={t('brand.switch', { brand: brand.name })}
          description={t('brand.switch.hint')}
          onClick={() => switchBrand(brand.id)}
        />
      ))}

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => setLeaving(true)}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-control border border-line bg-canvas font-semibold text-danger active:bg-neutral-100"
        >
          <LogOut size={20} />
          {t('home.signOut')}
        </button>
        <p className="text-xs text-ink-subtle">
          {BRAND.name} · {t('profile.version', { v: '1.0.0' })}
        </p>
      </div>

      <ConfirmSheet
        open={leaving}
        onClose={() => setLeaving(false)}
        title={t('profile.signOut.title')}
        message={t('profile.signOut.message')}
        confirmLabel={t('home.signOut')}
        onConfirm={() => {
          session.signOut()
          navigate(ROUTES.auth, { replace: true })
        }}
      />
    </div>
  )
}
