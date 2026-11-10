import type { SlidesData } from '@/shared/api/types'
import type { LocalizedText } from '@/shared/i18n/dictionaries'

/** The look a slide falls back to when the admin has not uploaded an image. */
export type SlideArt = 'calculator' | 'decision' | 'card' | 'repay'
const ARTS: SlideArt[] = ['calculator', 'decision', 'card', 'repay']

/**
 * One intro slide from GET /client/slides: an uploaded image per language (empty for a built-in
 * slide, which the app draws) and a title. There is no text field.
 */
export type Slide = {
  id: string
  image: LocalizedText
  art: SlideArt
  title: LocalizedText
}

export const slidesFromApi = (items: SlidesData['items']): Slide[] =>
  items.map((item, i) => ({
    id: item.id,
    image: item.built_in ? { uz: '', ru: '' } : item.image,
    art: ARTS[i % ARTS.length],
    title: item.title,
  }))
