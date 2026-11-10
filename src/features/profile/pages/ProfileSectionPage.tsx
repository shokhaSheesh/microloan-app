import {
  CircleHelp,
  CreditCard,
  FileText,
  Globe,
  MessageCircle,
  MonitorSmartphone,
  Phone,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Navigate, useParams } from 'react-router-dom'
import { useCards } from '@/entities/cards/cards'
import { useContacts } from '@/entities/contacts/contacts'
import { useBorrower } from '@/entities/session/session'
import { ROUTES } from '@/shared/config/routes'
import { LANG_NAMES, type TranslationKey } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { useApi } from '@/shared/api/useApi'
import type { DocumentsData } from '@/shared/api/types'
import { documentUrl } from '@/shared/api/documents'
import { toast } from '@/shared/lib/toast'
import { MenuList, MenuRow } from '@/shared/ui/MenuList'
import { PageHeader } from '@/shared/ui/PageHeader'

/** The sections the Profil root lists; each opens this page with its own items. */
export const PROFILE_SECTIONS = ['account', 'settings', 'help', 'documents'] as const
export type ProfileSection = (typeof PROFILE_SECTIONS)[number]

export const SECTION_TITLES: Record<ProfileSection, TranslationKey> = {
  account: 'profile.account',
  settings: 'profile.settings',
  help: 'profile.help',
  documents: 'profile.documents',
}

type Item = {
  icon: LucideIcon
  label: TranslationKey
  to?: string
  value?: string
  /** A legal document: opens its PDF from GET /client/documents. */
  doc?: 'offer' | 'privacy'
}

/**
 * One section of Profil on its own page, so the root shows only four rows: Hisob (cards,
 * contacts), Sozlamalar (security, sessions, language), Yordam (FAQ, chat, contacts) and
 * Hujjatlar (the offer and the privacy policy).
 */
export function ProfileSectionPage() {
  const { t, lang } = useI18n()
  const { id } = useParams()
  const borrower = useBorrower()
  const cards = useCards(borrower?.passport)
  const contacts = useContacts(borrower?.passport)
  const docs = useApi<DocumentsData>(id === 'documents' ? '/client/documents' : null)
  if (!PROFILE_SECTIONS.includes(id as ProfileSection))
    return <Navigate to={ROUTES.profile} replace />
  const section = id as ProfileSection

  const items: Record<ProfileSection, Item[]> = {
    account: [
      { icon: CreditCard, label: 'cards.title', to: ROUTES.cards, value: String(cards.length) },
      {
        icon: Users,
        label: 'myContacts.title',
        to: ROUTES.myContacts,
        value: String(contacts.length),
      },
    ],
    settings: [
      { icon: ShieldCheck, label: 'profile.security', to: ROUTES.security },
      { icon: MonitorSmartphone, label: 'sessions.title', to: ROUTES.sessions },
      { icon: Globe, label: 'lang.title', to: ROUTES.language, value: LANG_NAMES[lang] },
    ],
    help: [
      { icon: CircleHelp, label: 'profile.faq', to: ROUTES.faq },
      { icon: MessageCircle, label: 'profile.chat', to: ROUTES.chat },
      { icon: Phone, label: 'profile.contacts', to: ROUTES.contacts },
    ],
    documents: [
      { icon: FileText, label: 'profile.doc.offer', doc: 'offer' },
      { icon: FileText, label: 'profile.doc.privacy', doc: 'privacy' },
    ],
  }

  const openDoc = (kind: 'offer' | 'privacy') => {
    const url = documentUrl(docs.data, kind, lang)
    if (url) window.open(url, '_blank', 'noopener')
    else toast(t('docs.pending'), 'error')
  }

  return (
    <div className="flex h-full flex-col bg-page">
      <PageHeader title={t(SECTION_TITLES[section])} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-2 pb-6">
        <MenuList>
          {items[section].map((item) => (
            <MenuRow
              key={item.label}
              icon={item.icon}
              label={t(item.label)}
              to={item.to}
              value={item.value}
              onClick={item.doc ? () => openDoc(item.doc!) : undefined}
            />
          ))}
        </MenuList>
      </div>
    </div>
  )
}
