import type { LocalizedText } from '@/shared/i18n/dictionaries'

// The client endpoints of birzum-mobile-api.md §2, as the backend answers them.

export type HomeData = {
  actions: { key: string; label: LocalizedText }[]
  tabs: { key: string; label: LocalizedText }[]
  tiles: { id: string; title: LocalizedText; text: LocalizedText; image_url: string }[]
  banners: {
    id: string
    title: LocalizedText
    image: LocalizedText
    target: string
    ids: string[]
  }[]
}

export type SlidesData = {
  items: { id: string; image: LocalizedText; built_in: boolean; title: LocalizedText }[]
}

export type FaqData = {
  items: { id: string; question: LocalizedText; answer: LocalizedText }[]
}

export type Branch = {
  id: string
  region: string
  address: string
  phone: string
  location: { lat: number; lng: number } | null
  schedule: { weekday: number; open: string; close: string }[]
}

export type ContactsData = {
  contacts: {
    phones: string[]
    email: string
    website: string
    telegram: string
    instagram: string
    address: LocalizedText
    hours: LocalizedText
  }
  branches: Branch[]
}

export type DocFile = {
  url: string
  name: string
  size_bytes: number
  version: number
  updated_at: string
}

export type DocumentsData = {
  items: {
    kind: 'terms' | 'privacy' | 'offer'
    used_in: string[]
    uz: DocFile | null
    ru: DocFile | null
  }[]
}

export type GeoKeysData = { items: { id: string; kind: string; key: string }[] }
