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
  /** Tax number (STIR) printed on fiscal cheques. */
  tin: string
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
  /** The smallest sum, when not the app's 1 mln. */
  min?: number
  max: number
  /** Yearly interest, %: one figure, or the lowest and highest. */
  rate: [number, number]
  /** Shortest term in months, when not 3. */
  termMin?: number
  termMax: number
}

/** Branches of one region, each an address and a phone. */
const branches = (region: LocalizedText, list: [string, string][]) =>
  list.map(([address, phone]) => ({ region, address, phone }))

const BRANDS: Record<BrandId, Brand> = {
  fortuna: {
    id: 'fortuna',
    name: 'Fortuna Biznes',
    kind: { uz: 'Mikromoliya tashkiloti', ru: 'Микрофинансовая организация' },
    maxAmount: 50_000_000,
    phone: '732444000',
    // Placeholder until Fortuna gives its STIR
    tin: '305000000',
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
  vodiy: {
    id: 'vodiy',
    name: 'Vodiy Taraqqiyot',
    kind: { uz: 'Mikromoliya tashkiloti', ru: 'Микрофинансовая организация' },
    maxAmount: 100_000_000,
    phone: '735291434',
    // Placeholder until Vodiy gives its STIR
    tin: '306000000',
    // From vodiytaraqqiyot.uz, "Aloqa" and "Filiallar"
    contacts: {
      phones: ['735291434'],
      email: 'vodiymko@mail.ru',
      address: {
        uz: 'Fargʻona viloyati, Buvayda tumani, Yangiqoʻrgʻon MFY, Yangiqoʻrgʻon koʻchasi, 2-uy',
        ru: 'Ферганская область, Бувайдинский район, МСГ Янгикурган, ул. Янгикурган, 2',
      },
      hours: { uz: 'Dushanba–juma, 9:00–18:00', ru: 'Пн–пт, 9:00–18:00' },
      website: 'vodiytaraqqiyot.uz',
      branches: [
        ...branches({ uz: 'Fargʻona', ru: 'Фергана' }, [
          ['Buvayda t., Yangiqoʻrgʻon koʻchasi, 2-uy', '735291434'],
          ['Bagʻdod t., Orzu koʻchasi, 11-uy', '558081010'],
        ]),
        ...branches({ uz: 'Andijon', ru: 'Андижан' }, [
          ['Andijon t., Oltin vodiy koʻchasi, 18-uy', '950061155'],
          ['Paxtaobod t., A. Temur koʻchasi', '552023000'],
        ]),
        ...branches({ uz: 'Namangan', ru: 'Наманган' }, [
          ['Chust t., Birlik MFY, Chustiy koʻchasi', '953024040'],
          ['Toʻraqoʻrgʻon t., Namangan koʻchasi, 7-uy', '552551010'],
          ['Norin t., Xaqqulobod sh., Oʻzbekiston koʻchasi, 87-uy', '552541010'],
        ]),
        ...branches({ uz: 'Toshkent viloyati', ru: 'Ташкентская область' }, [
          ['Nurafshon sh., Toshkent yoʻli koʻchasi, 178-uy', '559002200'],
          ['Chirchiq sh., A. Navoiy shoh koʻchasi, 225-uy', '559031000'],
        ]),
        ...branches({ uz: 'Qashqadaryo', ru: 'Кашкадарья' }, [
          ['Qarshi sh., I. Karimov koʻchasi, 289-uy', '554011010'],
          ['Shahrisabz sh., Ipak yoʻli koʻchasi, 309-uy', '554041010'],
          ['Koson t., Mustaqillik shoh koʻchasi', '554031010'],
          ['Chiroqchi t., Mustaqillik koʻchasi, 20-uy', '554011000'],
          ['Gʻuzor t., Oʻzbekiston koʻchasi, 51-uy', '554020010'],
          ['Koʻkdala t., Yangichorbogʻ koʻchasi, 2-A uy', '554052020'],
        ]),
        ...branches({ uz: 'Navoiy', ru: 'Навои' }, [
          ['Navoiy sh., A. Navoiy koʻchasi, 22-uy', '553511100'],
        ]),
        ...branches({ uz: 'Surxondaryo', ru: 'Сурхандарья' }, [
          ['Jarqoʻrgʻon t., Surxon sohili MFY, Oʻzbekiston koʻchasi', '951551000'],
          ['Shoʻrchi t., Mustaqillik koʻchasi, 77a-uy', '554511000'],
          ['Angor sh., At-Termiziy koʻchasi, 9-uy', '554521010'],
          ['Uzun t., Oʻzbekiston koʻchasi, 104-uy', '554524040'],
        ]),
      ],
    },
    // From vodiytaraqqiyot.uz, "Kreditlar": the microloans only (user: no Mikrokredit or leasing)
    products: [
      {
        id: 'zar',
        name: 'Zar',
        kind: { uz: 'Mikroqarz', ru: 'Микрозайм' },
        for: {
          uz: 'Har qanday maqsadga, kafil va garovsiz',
          ru: 'На любые цели, без поручителя и залога',
        },
        min: 2_000_000,
        max: 100_000_000,
        rate: [48, 60],
        termMin: 3,
        termMax: 12,
      },
      {
        id: 'ishonch',
        name: 'Ishonch',
        kind: { uz: 'Mikroqarz', ru: 'Микрозайм' },
        for: {
          uz: 'Takroriy mijozlar uchun, 3-shaxs kafilligi asosida',
          ru: 'Для повторных клиентов, под поручительство третьего лица',
        },
        min: 2_000_000,
        max: 100_000_000,
        rate: [48, 60],
        termMin: 3,
        termMax: 12,
      },
      {
        id: 'komak',
        name: 'Koʻmak',
        kind: { uz: 'Mikroqarz', ru: 'Микрозайм' },
        for: {
          uz: 'Garov yoki sugʻurta polisi bilan, 3 oy imtiyozli davr',
          ru: 'Под залог или страховой полис, 3 месяца льготного периода',
        },
        min: 2_000_000,
        max: 100_000_000,
        rate: [50, 60],
        termMin: 3,
        termMax: 12,
      },
      {
        id: 'imkoniyat',
        name: 'Imkoniyat',
        kind: { uz: 'Mikroqarz', ru: 'Микрозайм' },
        for: {
          uz: 'Rasmiy daromadi borlar uchun, garovsiz yoki kafillik bilan',
          ru: 'Для тех, у кого официальный доход, без залога или с поручителем',
        },
        max: 20_000_000,
        // 0.15% a day on the site
        rate: [55, 55],
        termMax: 36,
      },
    ],
  },
}

// Each brand lives under its own path, /fortuna/... and /vodiy/..., so screens only one brand has
// can be added to its routes. A bare "/" opens the brand last used, else the build's VITE_BRAND.
const BRAND_KEY = 'microloan.brand'
const isBrand = (id: string | null | undefined): id is BrandId => !!id && id in BRANDS
const fromPath = window.location.pathname.split('/')[1]
const stored = (() => {
  try {
    return localStorage.getItem(BRAND_KEY)
  } catch {
    return null
  }
})()
const chosen = [fromPath, stored, import.meta.env.VITE_BRAND].find(isBrand) ?? 'fortuna'
try {
  localStorage.setItem(BRAND_KEY, chosen)
} catch {
  // Private mode: the path alone decides
}
export const BRAND: Brand = BRANDS[chosen]

/** The path every route of this brand sits under, e.g. "/vodiy". */
export const BRAND_BASE = `/${BRAND.id}`

// A path without the brand, e.g. "/" or an old "/home", moves under it before the router starts
{
  const { pathname, search, hash } = window.location
  if (pathname !== BRAND_BASE && !pathname.startsWith(`${BRAND_BASE}/`))
    window.history.replaceState(null, '', `${BRAND_BASE}${pathname}${search}${hash}`)
}

/** Every brand, for the switcher in Profil. */
export const ALL_BRANDS = Object.values(BRANDS)

/** Opens the other brand's app from the start. Each brand keeps its own sign-in. */
export function switchBrand(id: BrandId) {
  window.location.assign(`/${id}/`)
}
