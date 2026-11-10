import type { LucideIcon } from 'lucide-react'
import { Layers } from 'lucide-react'
import type { HomeData } from '@/shared/api/types'
import type { LocalizedText } from '@/shared/i18n/dictionaries'

/** One tile at the top of Asosiy, opening like a story: GET /client/home `tiles`. */
export type Story = {
  id: string
  icon: LucideIcon
  title: LocalizedText
  text: LocalizedText
  /** Empty when the admin set no picture. */
  imageUrl: string
}

export const storiesFromApi = (tiles: HomeData['tiles']): Story[] =>
  tiles.map((tile) => ({
    id: tile.id,
    icon: Layers,
    title: tile.title,
    text: tile.text,
    imageUrl: tile.image_url,
  }))
