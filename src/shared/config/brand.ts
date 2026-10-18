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
  /** The loan products, as the brand's site names them, with their largest sum. */
  products: { name: string; max: number }[]
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
      { name: 'Rivoj', max: 50_000_000 },
      { name: 'Tezkor', max: 40_000_000 },
      { name: 'Ishonch', max: 20_000_000 },
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
