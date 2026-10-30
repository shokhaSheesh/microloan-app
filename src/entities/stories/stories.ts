import type { LucideIcon } from 'lucide-react'
import { CalendarDays, Headset, Layers, MapPin } from 'lucide-react'
import { BRAND } from '@/shared/config/brand'
import type { LocalizedText } from '@/shared/i18n/dictionaries'
import { formatPhone } from '@/shared/lib/phone'

/**
 * One tile at the top of Asosiy, opening like a story. Set in the admin's «Asosiy oyna»; until the
 * API, built from what the app already knows: each product, the payment day, the branches, support.
 */
export type Story = { id: string; icon: LucideIcon; title: LocalizedText; text: LocalizedText }

const millions = (sum: number) => String(sum / 1_000_000)
const regions = new Set(BRAND.contacts.branches.map((branch) => branch.region.uz)).size

export const STORIES: Story[] = [
  ...BRAND.products.map((product) => ({
    id: `product-${product.id}`,
    icon: Layers,
    title: { uz: product.name, ru: product.name },
    text: {
      uz: `${product.kind.uz}. ${product.for.uz}. ${millions(product.max)} mln soʻmgacha, ${product.termMax} oygacha.`,
      ru: `${product.kind.ru}. ${product.for.ru}. До ${millions(product.max)} млн сумов, до ${product.termMax} мес.`,
    },
  })),
  {
    id: 'pay-day',
    icon: CalendarDays,
    title: { uz: 'Toʻlov kuni', ru: 'День платежа' },
    text: {
      uz: 'Toʻlov kunini oʻzingiz tanlaysiz: har oyning 1–10-sanasi. Kalkulyatorda belgilang.',
      ru: 'День платежа выбираете сами: с 1 по 10 число месяца. Укажите его в калькуляторе.',
    },
  },
  {
    id: 'branches',
    icon: MapPin,
    title: { uz: 'Filiallar', ru: 'Филиалы' },
    text: {
      uz: `${BRAND.contacts.branches.length} ta filial, ${regions} ta hududda. Manzillar: Profil → Biz bilan aloqa.`,
      ru: `${BRAND.contacts.branches.length} филиалов в ${regions} регионах. Адреса: Профиль → Связаться с нами.`,
    },
  },
  {
    id: 'support',
    icon: Headset,
    title: { uz: 'Yordam', ru: 'Помощь' },
    text: {
      uz: `Savolingiz boʻlsa, yordam chatida yozing yoki qoʻngʻiroq qiling: ${formatPhone(BRAND.phone)}.`,
      ru: `Есть вопрос — напишите в чат поддержки или позвоните: ${formatPhone(BRAND.phone)}.`,
    },
  },
]
