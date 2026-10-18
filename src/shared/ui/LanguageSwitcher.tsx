import { ChevronDown, Globe } from 'lucide-react'
import { useState } from 'react'
import { LANG_NAMES, LANGS } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { OptionSheet } from './OptionSheet'

const options = LANGS.map((value) => ({ value, label: LANG_NAMES[value] }))

export function LanguageSwitcher() {
  const { t, lang, setLang } = useI18n()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('lang.title')}
        onClick={() => setOpen(true)}
        className="flex h-10 items-center gap-1.5 rounded-full border border-line bg-canvas pr-3 pl-3.5 text-sm font-semibold text-brand active:bg-neutral-100"
      >
        <Globe size={18} />
        {LANG_NAMES[lang]}
        <ChevronDown size={16} className="text-ink-subtle" />
      </button>
      <OptionSheet
        open={open}
        onClose={() => setOpen(false)}
        title={t('lang.title')}
        options={options}
        value={lang}
        onChange={setLang}
      />
    </>
  )
}
