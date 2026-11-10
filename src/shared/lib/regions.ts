import type { LocalizedText } from '@/shared/i18n/dictionaries'

/** The branch regions the backend sends as codes, in its order. */
export const REGIONS: Record<string, LocalizedText> = {
  tashkentCity: { uz: 'Toshkent shahri', ru: 'город Ташкент' },
  tashkent: { uz: 'Toshkent viloyati', ru: 'Ташкентская область' },
  andijan: { uz: 'Andijon', ru: 'Андижан' },
  fergana: { uz: 'Fargʻona', ru: 'Фергана' },
  namangan: { uz: 'Namangan', ru: 'Наманган' },
  samarkand: { uz: 'Samarqand', ru: 'Самарканд' },
  bukhara: { uz: 'Buxoro', ru: 'Бухара' },
  jizzakh: { uz: 'Jizzax', ru: 'Джизак' },
  kashkadarya: { uz: 'Qashqadaryo', ru: 'Кашкадарья' },
  navoi: { uz: 'Navoiy', ru: 'Навои' },
  surkhandarya: { uz: 'Surxondaryo', ru: 'Сурхандарья' },
  syrdarya: { uz: 'Sirdaryo', ru: 'Сырдарья' },
  khorezm: { uz: 'Xorazm', ru: 'Хорезм' },
  karakalpakstan: { uz: 'Qoraqalpogʻiston', ru: 'Каракалпакстан' },
}

/** A region's name; an unknown code is shown as it came. */
export const regionName = (code: string): LocalizedText => REGIONS[code] ?? { uz: code, ru: code }
