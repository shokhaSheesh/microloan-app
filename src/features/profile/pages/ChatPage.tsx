import { ImagePlus, SendHorizontal, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { BrandMark } from '@/shared/ui/BrandMark'
import { PageHeader } from '@/shared/ui/PageHeader'

/** `photos` are local object URLs; the real app uploads them first. */
type Message = { id: number; from: 'me' | 'support'; text: string; at: string; photos?: string[] }

const MAX_PHOTOS = 5

const time = (date: Date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
const now = () => new Date()
let nextId = 10

/**
 * Yordam chati with an operator: a greeting, quick topics to start with, and the conversation.
 * Photos (up to five at a time, e.g. a receipt or a card) go with the message or on their own.
 * The prototype's operator answers every message with the same line after a moment.
 */
export function ChatPage() {
  const { t } = useI18n()
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: 1, from: 'support', text: t('chat.hello'), at: time(now()) },
  ])
  const [text, setText] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [viewing, setViewing] = useState<string | null>(null)
  const end = useRef<HTMLDivElement>(null)
  const picker = useRef<HTMLInputElement>(null)
  const topics = [
    'chat.topic.pay',
    'chat.topic.early',
    'chat.topic.card',
    'chat.topic.status',
  ] as const

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = (body: string, attached: string[] = []) => {
    if (!body.trim() && attached.length === 0) return
    setMessages((list) => [
      ...list,
      { id: nextId++, from: 'me', text: body.trim(), at: time(now()), photos: attached },
    ])
    setText('')
    setPhotos([])
    setTimeout(
      () =>
        setMessages((list) => [
          ...list,
          { id: nextId++, from: 'support', text: t('chat.reply'), at: time(now()) },
        ]),
      1200,
    )
  }

  return (
    <div className="relative flex h-full flex-col bg-page">
      <PageHeader
        title={t('profile.chat')}
        end={
          <span className="flex items-center gap-1.5 rounded-full border border-line bg-canvas px-3 py-1 text-xs font-semibold text-success">
            <span className="size-2 rounded-full bg-success" />
            {t('chat.online')}
          </span>
        }
      />
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pt-2 pb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn('flex items-end gap-2', message.from === 'me' && 'flex-row-reverse')}
          >
            {message.from === 'support' && (
              <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line bg-canvas">
                <BrandMark className="h-3.5 w-auto" />
              </span>
            )}
            <div
              className={cn(
                'max-w-[78%] rounded-2xl px-3.5 py-2.5',
                message.from === 'me'
                  ? 'rounded-br-md bg-primary text-on-primary'
                  : 'rounded-bl-md border border-line bg-canvas',
              )}
            >
              {!!message.photos?.length && (
                <div
                  className={cn(
                    '-mx-1.5 -mt-1 mb-1 grid gap-1',
                    message.photos.length > 1 && 'grid-cols-2',
                  )}
                >
                  {message.photos.map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setViewing(src)}
                      aria-label={t('chat.photo.open')}
                      className="overflow-hidden rounded-xl"
                    >
                      <img src={src} alt="" className="aspect-square w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              {message.text && <p className="whitespace-pre-line">{message.text}</p>}
              <p
                className={cn(
                  'mt-1 text-right text-[11px]',
                  message.from === 'me' ? 'opacity-70' : 'text-ink-subtle',
                )}
              >
                {message.at}
              </p>
            </div>
          </div>
        ))}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pl-10">
            {topics.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => send(t(topic))}
                className="rounded-full border border-line bg-canvas px-3.5 py-2 text-sm font-medium text-brand active:bg-neutral-100"
              >
                {t(topic)}
              </button>
            ))}
          </div>
        )}
        <div ref={end} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(text, photos)
        }}
        className="flex shrink-0 flex-col gap-2 border-t border-line bg-canvas px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        {photos.length > 0 && (
          <ul className="flex gap-2 overflow-x-auto pt-1">
            {photos.map((src) => (
              <li key={src} className="relative shrink-0">
                <img src={src} alt="" className="size-16 rounded-xl object-cover" />
                <button
                  type="button"
                  aria-label={t('chat.photo.remove')}
                  onClick={() => setPhotos((list) => list.filter((item) => item !== src))}
                  className="absolute -top-1.5 -right-1.5 grid size-6 place-items-center rounded-full bg-neutral-950/70 text-white"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center gap-2">
          <input
            ref={picker}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              const picked = [...(e.target.files ?? [])].map((file) => URL.createObjectURL(file))
              setPhotos((list) => [...list, ...picked].slice(0, MAX_PHOTOS))
              e.target.value = ''
            }}
          />
          <button
            type="button"
            aria-label={t('chat.photo.add')}
            disabled={photos.length >= MAX_PHOTOS}
            onClick={() => picker.current?.click()}
            className="grid size-11 shrink-0 place-items-center rounded-full text-brand active:bg-neutral-100 disabled:opacity-40"
          >
            <ImagePlus size={24} />
          </button>
          <label className="flex h-11 flex-1 items-center rounded-full border border-line bg-surface px-4">
            <span className="sr-only">{t('chat.placeholder')}</span>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('chat.placeholder')}
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-subtle"
            />
          </label>
          <button
            type="submit"
            aria-label={t('chat.send')}
            disabled={!text.trim() && photos.length === 0}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-on-primary disabled:opacity-40"
          >
            <SendHorizontal size={20} />
          </button>
        </div>
      </form>
      {viewing && (
        <div
          role="dialog"
          aria-label={t('chat.photo.open')}
          className="absolute inset-0 z-50 flex items-center justify-center bg-neutral-950/95 p-4"
          onClick={() => setViewing(null)}
        >
          <img src={viewing} alt="" className="max-h-full max-w-full rounded-xl object-contain" />
          <button
            type="button"
            aria-label={t('common.close')}
            className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 grid size-10 place-items-center rounded-full bg-white/15 text-white"
          >
            <X size={22} />
          </button>
        </div>
      )}
    </div>
  )
}
