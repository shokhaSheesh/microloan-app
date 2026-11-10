import type { HomeData } from '@/shared/api/types'
import type { LocalizedText } from '@/shared/i18n/dictionaries'

/**
 * A banner on Asosiy, managed in the brand admin: a picture per language (text inside), or, when
 * there is none, drawn from its title. The backend's `ids` are loan-product uuids the app does not
 * know yet, so every banner opens Kreditlar.
 */
export type Banner = { id: string; title: LocalizedText; image: LocalizedText }

export const bannersFromApi = (items: HomeData['banners']): Banner[] =>
  items.map(({ id, title, image }) => ({ id, title, image }))
