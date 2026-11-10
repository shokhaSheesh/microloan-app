import { AtSign, Camera, Clock, Globe, MapPin, Phone, Send } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useApi } from '@/shared/api/useApi'
import type { Branch, ContactsData } from '@/shared/api/types'
import { regionName } from '@/shared/lib/regions'
import { ErrorState } from '@/shared/ui/ErrorState'
import { SkeletonRows } from '@/shared/ui/Skeleton'
import type { TranslationKey } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone } from '@/shared/lib/phone'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Section } from '@/shared/ui/Section'

/**
 * Kontaktlar: the brand's phones, email, socials, head office and hours, then its branches by
 * region. The numbers are text to select; a link may not open a dialler inside the prototype.
 */
export function ContactsPage() {
  const { t } = useI18n()
  const api = useApi<ContactsData>('/client/contacts')
  return (
    <div className="flex h-full flex-col bg-page">
      <PageHeader title={t('profile.contacts')} />
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pt-2 pb-6">
        {api.error && <ErrorState kind="server" onAction={api.reload} />}
        {api.loading && !api.data && <SkeletonRows count={6} />}
        {api.data && <ContactsBody data={api.data} />}
      </div>
    </div>
  )
}

/** Weekday names for "Du–Ju 09:00–18:00": consecutive days with the same hours are joined. */
function scheduleText(schedule: Branch['schedule'], day: (n: number) => string) {
  const groups: { from: number; to: number; hours: string }[] = []
  for (const { weekday, open, close } of schedule) {
    const hours = `${open}–${close}`
    const last = groups[groups.length - 1]
    if (last && last.hours === hours && last.to === weekday - 1) last.to = weekday
    else groups.push({ from: weekday, to: weekday, hours })
  }
  return groups
    .map((g) => `${g.from === g.to ? day(g.from) : `${day(g.from)}–${day(g.to)}`} ${g.hours}`)
    .join(', ')
}

function ContactsBody({ data }: { data: ContactsData }) {
  const { t, tl } = useI18n()
  const c = data.contacts
  const rows: [LucideIcon, string, string, string?][] = [
    ...c.phones.map((phone, i): [LucideIcon, string, string, string] => [
      Phone,
      t(i === 0 ? 'contacts.phone' : 'contacts.phone2'),
      formatPhone(phone),
      `tel:+998${phone}`,
    ]),
    ...(c.email
      ? [
          [AtSign, t('contacts.email'), c.email, `mailto:${c.email}`] as [
            LucideIcon,
            string,
            string,
            string,
          ],
        ]
      : []),
    ...(c.telegram
      ? [
          [Send, 'Telegram', `@${c.telegram}`, `https://t.me/${c.telegram}`] as [
            LucideIcon,
            string,
            string,
            string,
          ],
        ]
      : []),
    ...(c.instagram
      ? [
          [Camera, 'Instagram', `@${c.instagram}`, `https://instagram.com/${c.instagram}`] as [
            LucideIcon,
            string,
            string,
            string,
          ],
        ]
      : []),
    ...(c.website
      ? [
          [Globe, t('contacts.website'), c.website, `https://${c.website}`] as [
            LucideIcon,
            string,
            string,
            string,
          ],
        ]
      : []),
    [MapPin, t('contacts.office'), tl(c.address)],
    [Clock, t('contacts.hours'), tl(c.hours)],
  ]

  return (
    <>
      <ul className="rounded-card border border-line bg-canvas px-4">
        {rows.map(([Icon, label, value, href]) => (
          <li
            key={label}
            className="flex items-center gap-3 border-b border-line py-3 last:border-b-0"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-brand">
              <Icon size={20} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-xs text-ink-muted">{label}</span>
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold break-words text-brand select-all"
                >
                  {value}
                </a>
              ) : (
                <span className="font-semibold break-words">{value}</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <Section title={t('contacts.branches', { count: String(data.branches.length) })}>
        {data.branches.length === 0 && <p className="text-ink-muted">{t('contacts.noBranches')}</p>}
        <ul className="rounded-card border border-line bg-canvas px-4">
          {data.branches.map((branch) => (
            <li
              key={branch.id}
              className="flex flex-col gap-0.5 border-b border-line py-3 last:border-b-0"
            >
              <span className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                {tl(regionName(branch.region))}
              </span>
              <span className="font-medium">{branch.address}</span>
              {branch.schedule.length > 0 && (
                <span className="text-sm text-ink-muted tabular-nums">
                  {scheduleText(branch.schedule, (n) => t(`weekday.${n}` as TranslationKey))}
                </span>
              )}
              {branch.location && (
                <a
                  href={`https://yandex.com/maps/?pt=${branch.location.lng},${branch.location.lat}&z=16&l=map`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-brand"
                >
                  {t('contacts.onMap')}
                </a>
              )}
              {branch.phone && (
                <span className="text-sm text-ink-muted tabular-nums select-all">
                  {formatPhone(branch.phone)}
                </span>
              )}
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}
