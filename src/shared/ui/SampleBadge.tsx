import { useI18n } from '@/shared/i18n/useI18n'

/** Marks a screen that has no backend endpoint yet, so testers know its data is made up. */
export function SampleBadge() {
  const { t } = useI18n()
  return (
    <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-ink-muted">
      {t('api.sample')}
    </span>
  )
}
