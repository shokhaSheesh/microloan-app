import { ImagePlus, SendHorizontal, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { apiCall, chatHeaders } from '@/shared/api/client'
import type { ChatDetail, ChatMessage, ChatSummary, ChatTopicsData } from '@/shared/api/types'
import { useApi } from '@/shared/api/useApi'
import { BRAND } from '@/shared/config/brand'
import type { TranslationKey } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { toast } from '@/shared/lib/toast'
import { BrandMark } from '@/shared/ui/BrandMark'
import { PageHeader } from '@/shared/ui/PageHeader'

const MAX_PHOTOS = 5
const POLL_MS = 5000

type Photo = { file: File; preview: string }

const time = (iso: string) => {
  const date = new Date(iso)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

/**
 * Yordam chati with an operator, on the client chat API: topics from the backend, the newest
 * chat is opened (or a new one starts with the first message), the open chat is polled every
 * 5 seconds and marked read. Up to five photos go with a message in one multipart request.
 */
export function ChatPage() {
  const { t, tl } = useI18n()
  const topics = useApi<ChatTopicsData>('/client/chat/topics')
  const [chatId, setChatId] = useState<string>()
  const [chat, setChat] = useState<ChatDetail>()
  const [ready, setReady] = useState(false)
  const [sending, setSending] = useState(false)
  const [text, setText] = useState('')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [viewing, setViewing] = useState<string | null>(null)
  const end = useRef<HTMLDivElement>(null)
  const picker = useRef<HTMLInputElement>(null)
  const messages = chat?.messages ?? []

  const fail = useCallback((error: unknown) => {
    toast(error instanceof Error ? error.message : String(error), 'error')
  }, [])

  const refresh = useCallback(async (id: string) => {
    const { data } = await apiCall<ChatDetail>(`/client/chats/${id}`, { headers: chatHeaders() })
    setChat(data)
    if (data.unread > 0)
      void apiCall(`/client/chats/${id}/read`, { method: 'POST', headers: chatHeaders() }).catch(
        () => undefined,
      )
  }, [])

  // Open the newest chat, if the client has one
  useEffect(() => {
    apiCall<{ items: ChatSummary[] }>('/client/chats', { headers: chatHeaders() })
      .then(({ data }) => setChatId(data.items[0]?.id))
      .catch(fail)
      .finally(() => setReady(true))
  }, [fail])

  // Poll the open chat
  useEffect(() => {
    if (!chatId) return
    let stopped = false
    const load = () => refresh(chatId).catch((error) => !stopped && fail(error))
    void load()
    const timer = setInterval(load, POLL_MS)
    return () => {
      stopped = true
      clearInterval(timer)
    }
  }, [chatId, refresh, fail])

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const send = async (body: string, attached: Photo[] = [], topic = 'other') => {
    if ((!body.trim() && attached.length === 0) || sending) return
    setSending(true)
    try {
      let id = chatId
      if (!id) {
        const created = await apiCall<ChatSummary>('/client/chats', {
          method: 'POST',
          headers: chatHeaders(),
          body: { topic, text: body.trim() || t('chat.photo.add') },
        })
        id = created.data.id
        setChatId(id)
        // The first message is the chat's text; photos follow as their own message
        if (attached.length > 0) await postMessage(id, '', attached)
      } else {
        await postMessage(id, body.trim(), attached)
      }
      setText('')
      attached.forEach((photo) => URL.revokeObjectURL(photo.preview))
      setPhotos([])
      await refresh(id)
    } catch (error) {
      fail(error)
    } finally {
      setSending(false)
    }
  }

  const postMessage = (id: string, body: string, attached: Photo[]) => {
    const form = new FormData()
    form.append('text', body)
    attached.forEach((photo) => form.append('images', photo.file))
    return apiCall<ChatMessage>(`/client/chats/${id}/messages`, {
      method: 'POST',
      headers: chatHeaders(),
      body: form,
    })
  }

  const systemLine = (message: ChatMessage) =>
    t(`chat.sys.${message.key}` as TranslationKey, {
      name: message.name ?? '',
      to: message.to_name ?? '',
    })

  return (
    <div className="relative flex h-full flex-col bg-page">
      <PageHeader title={t('profile.chat')} />
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pt-2 pb-4">
        {!chatId && ready && (
          <div className="flex items-end gap-2">
            <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line bg-canvas">
              <BrandMark className="h-3.5 w-auto" />
            </span>
            <div className="max-w-[78%] rounded-2xl rounded-bl-md border border-line bg-canvas px-3.5 py-2.5">
              {t('chat.hello', { brand: BRAND.name })}
            </div>
          </div>
        )}
        {messages.map((message) => {
          if (message.from === 'system')
            return message.key ? (
              <p key={message.id} className="text-center text-xs text-ink-subtle">
                {systemLine(message)}
              </p>
            ) : null
          const mine = message.from === 'client'
          return (
            <div
              key={message.id}
              className={cn('flex items-end gap-2', mine && 'flex-row-reverse')}
            >
              {!mine && (
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line bg-canvas">
                  <BrandMark className="h-3.5 w-auto" />
                </span>
              )}
              <div
                className={cn(
                  'max-w-[78%] rounded-2xl px-3.5 py-2.5',
                  mine
                    ? 'rounded-br-md bg-primary text-on-primary'
                    : 'rounded-bl-md border border-line bg-canvas',
                )}
              >
                {!mine && message.name && (
                  <p className="text-xs font-semibold text-brand">{message.name}</p>
                )}
                {message.images.length > 0 && (
                  <div
                    className={cn(
                      '-mx-1.5 -mt-1 mb-1 grid gap-1',
                      message.images.length > 1 && 'grid-cols-2',
                    )}
                  >
                    {message.images.map((src) => (
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
                    mine ? 'opacity-70' : 'text-ink-subtle',
                  )}
                >
                  {time(message.at)}
                </p>
              </div>
            </div>
          )
        })}
        {!chatId && ready && (
          <div className="flex flex-wrap gap-2 pl-10">
            {(topics.data?.items ?? []).map((topic) => (
              <button
                key={topic.code}
                type="button"
                disabled={sending}
                onClick={() => void send(tl(topic.label), [], topic.code)}
                className="rounded-full border border-line bg-canvas px-3.5 py-2 text-sm font-medium text-brand active:bg-neutral-100"
              >
                {tl(topic.label)}
              </button>
            ))}
          </div>
        )}
        <div ref={end} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void send(text, photos)
        }}
        className="flex shrink-0 flex-col gap-2 border-t border-line bg-canvas px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        {photos.length > 0 && (
          <ul className="flex gap-2 overflow-x-auto pt-1">
            {photos.map(({ preview: src }) => (
              <li key={src} className="relative shrink-0">
                <img src={src} alt="" className="size-16 rounded-xl object-cover" />
                <button
                  type="button"
                  aria-label={t('chat.photo.remove')}
                  onClick={() => setPhotos((list) => list.filter((item) => item.preview !== src))}
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
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={(e) => {
              const picked = [...(e.target.files ?? [])].map((file) => ({
                file,
                preview: URL.createObjectURL(file),
              }))
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
            disabled={sending || (!text.trim() && photos.length === 0)}
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
