import { BRAND, type BrandId } from '@/shared/config/brand'
import type { Lang, LocalizedText } from '@/shared/i18n/dictionaries'

/**
 * A banner on Asosiy, managed in the brand admin's Tanishtiruv: a picture per language (text
 * inside), and the loan products it leads to. One product opens its calculator; several open
 * Kreditlar with just those. The seeded ones have no picture and are drawn from `title`.
 */
export type Banner = {
  id: string
  title: LocalizedText
  image?: Partial<Record<Lang, string>>
  productIds: string[]
}

// The same seeds as the admin's. Replace with the API.
const SEEDS: Record<BrandId, Banner[]> = {
  fortuna: [
    {
      id: 'fortuna-rivoj',
      title: {
        uz: 'Rivoj: tadbirkorlar uchun 50 mln soʻmgacha',
        ru: 'Ривож: для предпринимателей до 50 млн сум',
      },
      productIds: ['rivoj'],
    },
    {
      id: 'fortuna-tezkor',
      title: {
        uz: 'Tezkor: rasmiy daromadi borlar uchun, garovsiz',
        ru: 'Тезкор: при официальном доходе, без залога',
      },
      productIds: ['tezkor'],
    },
    {
      id: 'fortuna-ishonch',
      title: { uz: 'Ishonch: takroriy mijozlar uchun', ru: 'Ишонч: для повторных клиентов' },
      productIds: ['ishonch'],
    },
  ],
  vodiy: [
    {
      id: 'vodiy-zar',
      title: { uz: 'Zar: 100 mln soʻmgacha mikroqarz', ru: 'Зар: микрозайм до 100 млн сум' },
      productIds: ['zar'],
    },
    {
      id: 'vodiy-komak',
      title: { uz: 'Koʻmak mikroqarzi', ru: 'Микрозайм Кўмак' },
      productIds: ['komak'],
    },
    {
      id: 'vodiy-imkoniyat',
      title: { uz: 'Imkoniyat mikroqarzi', ru: 'Микрозайм Имконият' },
      productIds: ['imkoniyat'],
    },
  ],
}

export const banners = SEEDS[BRAND.id]
