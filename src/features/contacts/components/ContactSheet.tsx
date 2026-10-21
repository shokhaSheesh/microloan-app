import { Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { RELATIONS, saveContact, type Contact, type Relation } from '@/entities/contacts/contacts'
import { useI18n } from '@/shared/i18n/useI18n'
import { PHONE_DIGITS } from '@/shared/lib/phone'
import { toast } from '@/shared/lib/toast'
import { Button } from '@/shared/ui/Button'
import { PhoneField } from '@/shared/ui/PhoneField'
import { Select } from '@/shared/ui/Select'
import { Sheet } from '@/shared/ui/Sheet'
import { TextField } from '@/shared/ui/TextField'

type Props = {
  owner: string
  /** The contact to edit, or null to add one. */
  contact: Contact | null
  onClose: () => void
  /** Shown only when editing. */
  onDelete?: (contact: Contact) => void
  onSaved?: (contact: Contact) => void
}

/** Add or edit one contact: name, phone, who they are, a note. */
export function ContactSheet({ owner, contact, onClose, onDelete, onSaved }: Props) {
  const { t } = useI18n()
  const [name, setName] = useState(contact?.name ?? '')
  const [phone, setPhone] = useState(contact?.phone ?? '')
  const [relation, setRelation] = useState<Relation | null>(contact?.relation ?? null)
  const [comment, setComment] = useState(contact?.comment ?? '')
  const [submitted, setSubmitted] = useState(false)

  const save = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!name.trim() || phone.length < PHONE_DIGITS || !relation) return
    const saved: Contact = {
      id: contact?.id ?? `c${Date.now()}`,
      name: name.trim(),
      phone,
      relation,
      comment: comment.trim(),
    }
    saveContact(owner, saved)
    toast(t('myContacts.saved'))
    onSaved?.(saved)
    onClose()
  }

  return (
    <Sheet open onClose={onClose} title={t(contact ? 'myContacts.edit' : 'myContacts.add')}>
      <form onSubmit={save} noValidate className="flex flex-col gap-4 pt-1 pb-1">
        <TextField
          label={t('myContacts.name')}
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={submitted && !name.trim() ? t('error.required') : undefined}
        />
        <PhoneField
          label={t('myContacts.phone')}
          value={phone}
          onChange={setPhone}
          error={submitted && phone.length < PHONE_DIGITS ? t('auth.error.phone') : undefined}
        />
        <Select
          label={t('myContacts.relation')}
          options={RELATIONS.map((value) => ({ value, label: t(`relation.${value}`) }))}
          value={relation}
          onChange={setRelation}
          error={submitted && !relation ? t('error.required') : undefined}
        />
        <TextField
          label={t('myContacts.comment')}
          autoComplete="off"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="mt-2 flex flex-col gap-1">
          {contact && onDelete && (
            <Button
              variant="ghost"
              block
              className="text-danger!"
              onClick={() => onDelete(contact)}
            >
              <Trash2 size={20} />
              {t('common.delete')}
            </Button>
          )}
          <Button type="submit" block>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Sheet>
  )
}
