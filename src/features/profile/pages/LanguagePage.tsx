import { Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { LANG_NAMES, LANGS } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { PageHeader } from '@/shared/ui/PageHeader'

/** Til: the two languages with a tick; tapping one applies it and goes back. */
export function LanguagePage() {
  const { t, lang, setLang } = useI18n()
  const navigate = useNavigate()
  return (
    <div className="flex h-full flex-col bg-page">
      <PageHeader title={t('lang.title')} />
      <ul className="mx-5 mt-2 rounded-card border border-line bg-canvas px-4">
        {LANGS.map((value) => (
          <li key={value} className="border-b border-line last:border-b-0">
            <button
              type="button"
              onClick={() => {
                setLang(value)
                navigate(-1)
              }}
              className="flex min-h-13 w-full items-center justify-between gap-3 py-2 text-left font-medium"
            >
              {LANG_NAMES[value]}
              {value === lang && <Check size={22} className="text-primary" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
