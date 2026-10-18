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
  contacts: Contacts
}

/** How to reach the brand, as its site lists them. */
export type Contacts = {
  /** Nine digits after +998 each; the first is the main line. */
  phones: string[]
  email: string
  address: LocalizedText
  hours: LocalizedText
  telegram?: string
  instagram?: string
  website: string
  branches: { region: LocalizedText; address: string; phone?: string }[]
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
    // From fortunabiznes.uz, "Kontaktlar" and "Filiallar"
    contacts: {
      phones: ['732444000', '558084000'],
      email: 'info@fortunabiznes.uz',
      address: {
        uz: 'Fargʻona viloyati, Fargʻona shahri, B. Margʻinoniy koʻchasi, 12-uy',
        ru: 'Ферганская область, г. Фергана, ул. Б. Маргиноний, 12',
      },
      hours: { uz: 'Dushanba–shanba, 9:00–18:00', ru: 'Пн–сб, 9:00–18:00' },
      telegram: 'fortunabiznes_mmt',
      instagram: 'fortunabiznes.mko',
      website: 'fortunabiznes.uz',
      branches: [
        {
          region: { uz: 'Fargʻona', ru: 'Фергана' },
          address: 'Margʻilon sh., B. Margʻiloniy koʻchasi, 97-b',
          phone: '732534000',
        },
        {
          region: { uz: 'Fargʻona', ru: 'Фергана' },
          address: 'Rishton t., B. Roshidoniy koʻchasi, 195 A',
          phone: '558014111',
        },
        {
          region: { uz: 'Samarqand', ru: 'Самарканд' },
          address: 'Samarqand sh., Narpay koʻchasi, 77-uy',
          phone: '557024000',
        },
        {
          region: { uz: 'Buxoro', ru: 'Бухара' },
          address: 'Buxoro sh., I. Karimov shoh koʻchasi, 328-uy',
          phone: '553034000',
        },
        {
          region: { uz: 'Andijon', ru: 'Андижан' },
          address: 'Andijon sh., A. Temur shoh koʻchasi, 44-B',
          phone: '782980040',
        },
        {
          region: { uz: 'Xorazm', ru: 'Хорезм' },
          address: 'Urganch t., Farxod koʻchasi, 33/75-uy',
          phone: '556010040',
        },
        {
          region: { uz: 'Jizzax', ru: 'Джизак' },
          address: 'Jizzax sh., Sh. Rashidov koʻchasi',
          phone: '788884400',
        },
        {
          region: { uz: 'Qoraqalpogʻiston', ru: 'Каракалпакстан' },
          address: 'Nukus sh., Ernazar Alakoz koʻchasi, 83-uy',
          phone: '551050030',
        },
      ],
    },
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
    contacts: {
      phones: [],
      email: '',
      address: { uz: '', ru: '' },
      hours: { uz: '', ru: '' },
      website: 'vodiytaraqqiyot.uz',
      branches: [],
    },
  },
}

const requested = import.meta.env.VITE_BRAND as BrandId | undefined
export const BRAND: Brand = BRANDS[requested && requested in BRANDS ? requested : 'fortuna']
