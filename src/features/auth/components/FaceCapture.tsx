import { CircleUserRound, Glasses, LoaderCircle, Smartphone, Sun } from 'lucide-react'
import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from '@/shared/ui/Button'
import { CameraView } from '@/shared/ui/CameraView'
import { FormScreen } from '@/shared/ui/FormScreen'
import { ScreenIntro } from '@/shared/ui/ScreenIntro'

/**
 * The MyID face step: the front camera with the face oval, three tips and «Rasmga olish». Used at
 * sign-up, on a new phone, to reset the password and to change the phone number.
 */
export function FaceCapture({
  title,
  subtitle,
  onCapture,
  onBack,
}: {
  title: string
  subtitle: string
  onCapture: () => void
  onBack: () => void
}) {
  const { t } = useI18n()
  return (
    <FormScreen
      onSubmit={onCapture}
      onBack={onBack}
      footer={
        <Button type="submit" block>
          {t('myid.capture')}
        </Button>
      }
    >
      <ScreenIntro title={title} subtitle={subtitle} />
      <CameraView guide="face" facing="user" unavailableText={t('myid.noCamera')} />
      <ul className="flex flex-col gap-2 text-sm text-ink-muted">
        {(
          [
            [Sun, 'myid.tip.light'],
            [Glasses, 'myid.tip.glasses'],
            [Smartphone, 'myid.tip.still'],
          ] as const
        ).map(([Icon, text]) => (
          <li key={text} className="flex items-center gap-2.5">
            <Icon size={18} className="shrink-0 text-brand" />
            {t(text)}
          </li>
        ))}
      </ul>
    </FormScreen>
  )
}

/** MyID at work: a spinning ring round the face icon. */
export function Checking() {
  const { t } = useI18n()
  return (
    <FormScreen onSubmit={() => {}}>
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <span className="relative grid size-24 place-items-center rounded-full bg-accent-200 text-brand">
          <CircleUserRound size={44} strokeWidth={1.6} />
          <LoaderCircle
            size={96}
            strokeWidth={1.2}
            className="absolute inset-0 animate-spin text-accent-500"
            aria-hidden
          />
        </span>
        <div role="status" className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold">{t('myid.checking')}</h1>
          <p className="text-ink-muted">{t('myid.checking.hint')}</p>
        </div>
      </div>
    </FormScreen>
  )
}
