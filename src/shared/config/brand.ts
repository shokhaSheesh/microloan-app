import type { LocalizedText } from '@/shared/i18n/dictionaries'

/**
 * One codebase, two apps: each brand has its own name, colours (in index.css under
 * [data-brand]) and figures. The build picks one with VITE_BRAND; Fortuna is the default.
 */
export type BrandId = 'fortuna' | 'vodiy'

export type Brand = {
  id: BrandId
  name: string
  /** The legal form under the name, e.g. "Mikromoliya tashkiloti". */
  kind: LocalizedText
  /** The largest microloan, in UZS, for the welcome screen. */
  maxAmount: number
  /** Support line, nine digits after +998. */
  phone: string
  /** The loan products, as the brand's site names them. */
  products: Product[]
}

/** One loan product: its name, kind, who it is for, the largest sum, yearly rate and longest term. */
export type Product = {
  id: string
  name: string
  kind: LocalizedText
  for: LocalizedText
  max: number
  /** Yearly interest, %: one figure, or the lowest and highest. */
  rate: [number, number]
  termMax: number
}

const BRANDS: Record<BrandId, Brand> = {
  fortuna: {
    id: 'fortuna',
    name: 'Fortuna Biznes',
    kind: { uz: 'Mikromoliya tashkiloti', ru: 'Микрофинансовая организация' },
    maxAmount: 50_000_000,
    phone: '732444000',
    // From fortunabiznes.uz, "Moliyaviy xizmatlar"
    products: [
      {
        id: 'rivoj',
        name: 'Rivoj',
        kind: { uz: 'Mikrokredit, garovsiz', ru: 'Микрокредит без залога' },
        for: {
          uz: 'Tadbirkorlik bilan shugʻullanuvchilar uchun',
          ru: 'Для тех, кто ведёт предпринимательство',
        },
        max: 50_000_000,
        rate: [49, 54],
        termMax: 24,
      },
      {
        id: 'tezkor',
        name: 'Tezkor',
        kind: { uz: 'Mikroqarz', ru: 'Микрозайм' },
        for: {
          uz: 'Rasmiy daromadi borlar uchun, garovsiz',
          ru: 'Для тех, у кого официальный доход, без залога',
        },
        max: 40_000_000,
        rate: [45, 49],
        termMax: 36,
      },
      {
        id: 'ishonch',
        name: 'Ishonch',
        kind: { uz: 'Mikroqarz', ru: 'Микрозайм' },
        for: {
          uz: 'Takroriy mijozlar uchun, 3-shaxs kafilligi asosida',
          ru: 'Для повторных клиентов, под поручительство третьего лица',
        },
        max: 20_000_000,
        rate: [54, 54],
        termMax: 24,
      },
    ],
  },
  // Filled in when the Vodiy Taraqqiyot app is designed
  vodiy: {
    id: 'vodiy',
    name: 'Vodiy Taraqqiyot',
    kind: { uz: 'Mikromoliya tashkiloti', ru: 'Микрофинансовая организация' },
    maxAmount: 50_000_000,
    phone: '000000000',
    products: [],
  },
}

const requested = import.meta.env.VITE_BRAND as BrandId | undefined
export const BRAND: Brand = BRANDS[requested && requested in BRANDS ? requested : 'fortuna']
