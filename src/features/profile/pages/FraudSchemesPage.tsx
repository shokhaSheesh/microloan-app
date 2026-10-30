import { ChevronDown, Phone, ShieldCheck, Siren } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BRAND } from '@/shared/config/brand'
import { ROUTES } from '@/shared/config/routes'
import type { TranslationKey } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { formatPhone } from '@/shared/lib/phone'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Section } from '@/shared/ui/Section'

const SCHEMES = ['staff', 'code', 'loan', 'prize', 'job'] as const
const RULES: TranslationKey[] = ['fraud.rule.code', 'fraud.rule.self', 'fraud.rule.call']

/**
 * Profil → Firibgarlik sxemalari: how fraudsters work on borrowers (posing as staff, asking for
 * the SMS code, a loan "for them", a prize, a job), each opening to how it goes and what to do,
 * three rules that always hold, and a way to report.
 */
export function FraudSchemesPage() {
  const { t } = useI18n()
  const [open, setOpen] = useState<string | null>(SCHEMES[0])

  return (
    <div className="flex h-full flex-col bg-page">
      <PageHeader title={t('fraud.schemes')} />
      <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-5 pt-2 pb-6">
        <p className="text-ink-muted">{t('fraud.schemes.hint', { brand: BRAND.name })}</p>

        <Section title={t('fraud.rules')}>
          <ul className="flex flex-col gap-2.5 rounded-card border border-line bg-canvas p-4">
            {RULES.map((key) => (
              <li key={key} className="flex gap-2.5">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-brand" />
                <span className="text-sm">{t(key)}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title={t('fraud.how')}>
          <ul className="flex flex-col rounded-card border border-line bg-canvas px-4">
            {SCHEMES.map((id) => {
              const shown = open === id
              return (
                <li key={id} className="border-b border-line last:border-b-0">
                  <button
                    type="button"
                    aria-expanded={shown}
                    onClick={() => setOpen(shown ? null : id)}
                    className="flex w-full items-center gap-3 py-3.5 text-left font-semibold"
                  >
                    <span className="flex-1">{t(`fraud.scheme.${id}`)}</span>
                    <ChevronDown
                      size={18}
                      className={cn(
                        'shrink-0 text-ink-subtle transition-transform',
                        shown && 'rotate-180',
                      )}
                    />
                  </button>
                  {shown && (
                    <div className="flex flex-col gap-2 pb-4 text-sm">
                      <p className="text-ink-muted">{t(`fraud.scheme.${id}.how`)}</p>
                      <p className="rounded-control bg-accent-100 p-3">
                        {t(`fraud.scheme.${id}.do`)}
                      </p>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </Section>

        <div className="flex flex-col gap-2">
          <Link
            to={ROUTES.fraudReport}
            className="flex items-center gap-3 rounded-card border border-danger/30 bg-danger-soft p-4 font-semibold text-danger active:opacity-80"
          >
            <Siren size={22} className="shrink-0" />
            {t('fraud.report')}
          </Link>
          <a
            href={`tel:+998${BRAND.phone}`}
            className="flex items-center gap-3 rounded-card border border-line bg-canvas p-4 active:bg-neutral-100"
          >
            <Phone size={22} className="shrink-0 text-brand" />
            <span className="flex-1 font-semibold">{t('fraud.call')}</span>
            <span className="text-sm text-ink-muted tabular-nums">{formatPhone(BRAND.phone)}</span>
          </a>
        </div>
      </div>
    </div>
  )
}
