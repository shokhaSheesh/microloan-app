import { AtSign, Camera, Clock, Globe, MapPin, Phone, Send } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { BRAND } from '@/shared/config/brand'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone } from '@/shared/lib/phone'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Section } from '@/shared/ui/Section'

/**
 * Kontaktlar: the brand's phones, email, socials, head office and hours, then its branches by
 * region. The numbers are text to select; a link may not open a dialler inside the prototype.
 */
export function ContactsPage() {
  const { t, tl } = useI18n()
  const c = BRAND.contacts
  const rows: [LucideIcon, string, string, string?][] = [
    ...c.phones.map((phone, i): [LucideIcon, string, string, string] => [
      Phone,
      t(i === 0 ? 'contacts.phone' : 'contacts.phone2'),
      formatPhone(phone),
      `tel:+998${phone}`,
    ]),
    [AtSign, t('contacts.email'), c.email, `mailto:${c.email}`],
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
    [Globe, t('contacts.website'), c.website, `https://${c.website}`],
    [MapPin, t('contacts.office'), tl(c.address)],
    [Clock, t('contacts.hours'), tl(c.hours)],
  ]

  return (
    <div className="flex h-full flex-col bg-page">
      <PageHeader title={t('profile.contacts')} />
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pt-2 pb-6">
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

        <Section title={t('contacts.branches', { count: String(c.branches.length) })}>
          <ul className="rounded-card border border-line bg-canvas px-4">
            {c.branches.map((branch) => (
              <li
                key={branch.address}
                className="flex flex-col gap-0.5 border-b border-line py-3 last:border-b-0"
              >
                <span className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                  {tl(branch.region)}
                </span>
                <span className="font-medium">{branch.address}</span>
                {branch.phone && (
                  <span className="text-sm text-ink-muted tabular-nums select-all">
                    {formatPhone(branch.phone)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  )
}
