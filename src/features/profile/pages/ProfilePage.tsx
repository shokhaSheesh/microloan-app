import { SampleBadge } from '@/shared/ui/SampleBadge'
import {
  Activity,
  ArrowLeftRight,
  ChevronRight,
  CircleHelp,
  FileText,
  LayoutGrid,
  LogOut,
  Settings,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { session, useBorrower } from '@/entities/session/session'
import { ALL_BRANDS, BRAND, switchBrand } from '@/shared/config/brand'
import { profileSectionPath, ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone } from '@/shared/lib/phone'
import { ActionCard } from '@/shared/ui/ActionCard'
import { ConfirmSheet } from '@/shared/ui/ConfirmSheet'
import { MenuList, MenuRow } from '@/shared/ui/MenuList'
import { PROFILE_SECTIONS, SECTION_TITLES, type ProfileSection } from './ProfileSectionPage'

const SECTION_ICONS: Record<ProfileSection, LucideIcon> = {
  account: Wallet,
  settings: Settings,
  help: CircleHelp,
  documents: FileText,
}

/**
 * Profil: who is signed in (opens the personal data), then four rows that each open their own
 * page (Hisob, Sozlamalar, Yordam, Hujjatlar), «Holatlar namunasi» for the design, the
 * prototype's switch to the other brand's app, and "Chiqish".
 */
export function ProfilePage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const borrower = useBorrower()
  const [leaving, setLeaving] = useState(false)
  if (!borrower) return null
  const initials = borrower.fullName
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')

  return (
    <div className="flex min-h-full flex-col gap-7 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-tabbar">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('nav.profile')}</h1>
        <SampleBadge />
      </div>

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

      <MenuList>
        {PROFILE_SECTIONS.map((section) => (
          <MenuRow
            key={section}
            icon={SECTION_ICONS[section]}
            label={t(SECTION_TITLES[section])}
            to={profileSectionPath(section)}
          />
        ))}
      </MenuList>

      {/* Design only: the states sample data never shows; not part of the client's app */}
      <MenuList>
        <MenuRow icon={LayoutGrid} label={t('states.title')} to={ROUTES.states} />
        <MenuRow icon={Activity} label={t('api.status.title')} to={ROUTES.apiStatus} />
      </MenuList>

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
