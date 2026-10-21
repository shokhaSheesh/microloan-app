import { ChevronRight, Plus } from 'lucide-react'
import { useState } from 'react'
import { removeContact, useContacts, type Contact } from '@/entities/contacts/contacts'
import { useBorrower } from '@/entities/session/session'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone } from '@/shared/lib/phone'
import { toast } from '@/shared/lib/toast'
import { Button } from '@/shared/ui/Button'
import { ConfirmSheet } from '@/shared/ui/ConfirmSheet'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ContactSheet } from '../components/ContactSheet'

/**
 * Profil → Kontaktlarim: people the brand may call when it cannot reach the borrower. Every
 * ariza picks at least two of them. Tapping one edits it; it can be deleted there.
 */
export function MyContactsPage() {
  const { t } = useI18n()
  const borrower = useBorrower()
  const contacts = useContacts(borrower?.passport)
  // undefined: no sheet; null: adding; a contact: editing it
  const [editing, setEditing] = useState<Contact | null | undefined>(undefined)
  const [deleting, setDeleting] = useState<Contact | null>(null)
  if (!borrower) return null

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('myContacts.title')} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-2 pb-6">
        {contacts.length === 0 ? (
          <EmptyState title={t('myContacts.empty')} hint={t('myContacts.empty.hint')} />
        ) : (
          <ul className="rounded-card border border-line bg-canvas px-4">
            {contacts.map((contact) => (
              <li key={contact.id} className="border-b border-line last:border-b-0">
                <button
                  type="button"
                  onClick={() => setEditing(contact)}
                  className="flex w-full items-center gap-3 py-3 text-left"
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="truncate font-semibold">{contact.name}</span>
                      <span className="shrink-0 text-sm text-ink-muted">
                        {t(`relation.${contact.relation}`)}
                      </span>
                    </span>
                    <span className="text-sm text-ink-muted tabular-nums">
                      {formatPhone(contact.phone)}
                    </span>
                    {contact.comment && (
                      <span className="text-sm text-ink-muted">{contact.comment}</span>
                    )}
                  </span>
                  <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <Button variant="secondary" block onClick={() => setEditing(null)}>
          <Plus size={20} />
          {t('myContacts.add')}
        </Button>
      </div>

      {editing !== undefined && (
        <ContactSheet
          owner={borrower.passport}
          contact={editing}
          onClose={() => setEditing(undefined)}
          onDelete={(contact) => {
            setEditing(undefined)
            setDeleting(contact)
          }}
        />
      )}
      <ConfirmSheet
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title={t('myContacts.delete.title')}
        message={t('myContacts.delete.message')}
        confirmLabel={t('common.delete')}
        onConfirm={() => {
          if (deleting) removeContact(borrower.passport, deleting.id)
          toast(t('myContacts.deleted'))
        }}
      />
    </div>
  )
}
