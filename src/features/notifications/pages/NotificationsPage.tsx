import {
  CalendarClock,
  CheckCheck,
  CircleAlert,
  CircleCheck,
  FileCheck2,
  Megaphone,
  Settings,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  markAllRead,
  markRead,
  useNotifications,
  type AppNotification,
  type NotificationKind,
} from '@/entities/notifications/notifications'
import { useBorrower } from '@/entities/session/session'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { formatDate } from '@/shared/lib/format'
import { EmptyState } from '@/shared/ui/EmptyState'
import { FilterChips } from '@/shared/ui/FilterChips'
import { PageHeader } from '@/shared/ui/PageHeader'

type Filter = 'all' | 'payments' | 'loans' | 'news'

const FILTER_OF: Record<NotificationKind, Exclude<Filter, 'all'>> = {
  reminder: 'payments',
  overdue: 'payments',
  paid: 'payments',
  approved: 'loans',
  closed: 'loans',
  news: 'news',
}

const LOOK: Record<NotificationKind, { icon: LucideIcon; tone: string }> = {
  reminder: { icon: CalendarClock, tone: 'bg-accent-200 text-brand' },
  overdue: { icon: CircleAlert, tone: 'bg-danger-soft text-danger' },
  paid: { icon: Wallet, tone: 'bg-success-soft text-success' },
  approved: { icon: FileCheck2, tone: 'bg-success-soft text-success' },
  closed: { icon: CircleCheck, tone: 'bg-surface text-ink-muted' },
  news: { icon: Megaphone, tone: 'bg-warning-soft text-warning' },
}

const time = (date: Date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

/**
 * Bildirishnomalar, from the bell on Asosiy: payment reminders and receipts, loan news and
 * offers, newest first under day headings. Unread ones are bold with a dot; a tap reads it and
 * opens what it is about. The gear opens which messages arrive, as push and SMS.
 */
export function NotificationsPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const borrower = useBorrower()
  const all = useNotifications(borrower?.passport)
  const [filter, setFilter] = useState<Filter>('all')
  const [today] = useState(() => new Date())
  if (!borrower) return null

  const shown = all.filter((item) => filter === 'all' || FILTER_OF[item.kind] === filter)
  const unread = all.filter((item) => !item.read).length
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const dayLabel = (date: Date) =>
    dayKey(date) === dayKey(today)
      ? t('notif.today')
      : dayKey(date) === dayKey(yesterday)
        ? t('notif.yesterday')
        : formatDate(date)
  const days = shown.reduce<{ key: string; label: string; items: AppNotification[] }[]>(
    (groups, item) => {
      const key = dayKey(item.at)
      const last = groups.at(-1)
      if (last?.key === key) last.items.push(item)
      else groups.push({ key, label: dayLabel(item.at), items: [item] })
      return groups
    },
    [],
  )

  const open = (item: AppNotification) => {
    markRead(borrower.passport, item.id)
    if (item.to) navigate(item.to)
  }

  return (
    <div className="flex h-full flex-col bg-page">
      <PageHeader
        title={t('home.notifications')}
        end={
          <button
            type="button"
            aria-label={t('profile.notifications')}
            onClick={() => navigate(ROUTES.notifySettings)}
            className="grid size-10 place-items-center rounded-full text-brand active:bg-neutral-100"
          >
            <Settings size={22} />
          </button>
        }
      />
      <div className="flex shrink-0 flex-col gap-3 px-5 pt-1 pb-3">
        <FilterChips
          label={t('notif.filter')}
          value={filter}
          onChange={setFilter}
          options={(['all', 'payments', 'loans', 'news'] as const).map((value) => ({
            value,
            label: t(`notif.filter.${value}`),
          }))}
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pb-6">
        {unread > 0 && (
          <button
            type="button"
            onClick={() => markAllRead(borrower.passport)}
            className="-mb-2 flex items-center gap-1.5 self-end text-sm font-semibold text-brand"
          >
            <CheckCheck size={18} />
            {t('notif.readAll')}
          </button>
        )}
        {days.length === 0 ? (
          <EmptyState title={t('notif.empty')} hint={t('notif.empty.hint')} />
        ) : (
          days.map((day) => (
            <section key={day.key} className="flex flex-col gap-2">
              <h2 className="px-1 text-xs font-semibold tracking-wide text-ink-muted uppercase">
                {day.label}
              </h2>
              <ul className="flex flex-col rounded-card border border-line bg-canvas">
                {day.items.map((item) => {
                  const { icon: Icon, tone } = LOOK[item.kind]
                  return (
                    <li key={item.id} className="border-b border-line last:border-b-0">
                      <button
                        type="button"
                        onClick={() => open(item)}
                        className="flex w-full items-start gap-3 px-4 py-3.5 text-left active:bg-neutral-100"
                      >
                        <span
                          className={cn(
                            'grid size-10 shrink-0 place-items-center rounded-full',
                            tone,
                          )}
                        >
                          <Icon size={20} />
                        </span>
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <div className="flex items-baseline gap-2">
                            <span
                              className={cn(
                                'min-w-0 flex-1',
                                item.read ? 'font-medium' : 'font-bold',
                              )}
                            >
                              {t(item.title, item.params)}
                            </span>
                            <span className="shrink-0 text-xs text-ink-subtle tabular-nums">
                              {time(item.at)}
                            </span>
                          </div>
                          <p className="text-sm text-ink-muted">{t(item.body, item.params)}</p>
                        </div>
                        {!item.read && (
                          <span
                            aria-label={t('notif.unread')}
                            className="mt-2 size-2.5 shrink-0 rounded-full bg-primary"
                          />
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  )
}
