import type { Lang, LocalizedText } from '@/shared/i18n/dictionaries'

/** The look a slide falls back to when the admin has not uploaded an image. */
export type SlideArt = 'calculator' | 'decision' | 'card' | 'repay'

/**
 * One intro slide, as the admin panel publishes it: an uploaded image (or the drawn one), a
 * title and a line of text in both languages. Shown once, after the first sign-in.
 */
export type Slide = {
  id: string
  /** Uploaded in the admin panel, one per language: a picture may carry text. */
  image?: Partial<Record<Lang, string>>
  art: SlideArt
  title: LocalizedText
  text: LocalizedText
}

// Sample slides until the admin panel serves them. Replace with the API.
export const SLIDES: Slide[] = [
  {
    id: 's1',
    art: 'calculator',
    title: { uz: 'Summa va muddatni tanlang', ru: 'Выберите сумму и срок' },
    text: {
      uz: 'Kalkulyatorda oylik toʻlov va qarzning toʻliq narxini darhol koʻrasiz.',
      ru: 'Калькулятор сразу покажет ежемесячный платёж и полную стоимость займа.',
    },
  },
  {
    id: 's2',
    art: 'decision',
    title: { uz: 'Qaror onlayn', ru: 'Решение онлайн' },
    text: {
      uz: 'Arizani ilovadan yuborasiz, natijasi shu yerga keladi. Filialga borish shart emas.',
      ru: 'Заявка уходит из приложения, ответ приходит сюда же. В филиал идти не нужно.',
    },
  },
  {
    id: 's3',
    art: 'card',
    title: { uz: 'Pul kartangizga', ru: 'Деньги на карту' },
    text: {
      uz: 'Shartnomani SMS-kod bilan imzolang, pul Uzcard yoki Humo kartangizga tushadi.',
      ru: 'Подпишите договор SMS-кодом, и деньги придут на карту Uzcard или Humo.',
    },
  },
  {
    id: 's4',
    art: 'repay',
    title: { uz: 'Toʻlovlar nazoratda', ru: 'Платежи под контролем' },
    text: {
      uz: 'Jadvalni kuzating, eslatma oling va xohlasangiz muddatidan oldin toʻlang.',
      ru: 'Следите за графиком, получайте напоминания и гасите досрочно, когда удобно.',
    },
  },
]
