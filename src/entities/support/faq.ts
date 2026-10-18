import type { LocalizedText } from '@/shared/i18n/dictionaries'

/** The questions the admin panel publishes for this app, in order. Sample until it serves them. */
export const FAQ: { q: LocalizedText; a: LocalizedText }[] = [
  {
    q: { uz: 'Kim qarz olishi mumkin?', ru: 'Кто может получить займ?' },
    a: {
      uz: '18 yoshdan katta, pasporti yoki ID-kartasi bor va MyID orqali shaxsini tasdiqlagan Oʻzbekiston fuqarosi.',
      ru: 'Гражданин Узбекистана старше 18 лет с паспортом или ID-картой, подтвердивший личность через MyID.',
    },
  },
  {
    q: { uz: 'Garov yoki kafil kerakmi?', ru: 'Нужен ли залог или поручитель?' },
    a: {
      uz: 'Rivoj va Tezkor garovsiz. Ishonch takroriy mijozlar uchun, 3-shaxs kafilligi asosida beriladi.',
      ru: 'Rivoj и Tezkor — без залога. Ishonch — для повторных клиентов, под поручительство третьего лица.',
    },
  },
  {
    q: { uz: 'Qaror qancha vaqtda chiqadi?', ru: 'Сколько ждать решения?' },
    a: {
      uz: 'Odatda bir necha daqiqada. Natija ilovaga keladi, filialga borish shart emas.',
      ru: 'Обычно несколько минут. Ответ приходит в приложение, в филиал идти не нужно.',
    },
  },
  {
    q: { uz: 'Pul qanday tushadi?', ru: 'Как приходят деньги?' },
    a: {
      uz: 'Shartnomani SMS-kod bilan imzolaganingizdan keyin pul tanlagan Uzcard yoki Humo kartangizga oʻtkaziladi.',
      ru: 'После подписи договора SMS-кодом деньги переводятся на выбранную карту Uzcard или Humo.',
    },
  },
  {
    q: { uz: 'Toʻlov qanday yechiladi?', ru: 'Как списываются платежи?' },
    a: {
      uz: 'Har oyning toʻlov kunida summa kartangizdan avtomatik yechiladi. Ilovada oldinroq oʻzingiz ham toʻlashingiz mumkin.',
      ru: 'В день платежа сумма списывается с карты автоматически. В приложении можно оплатить и раньше.',
    },
  },
  {
    q: { uz: 'Muddatidan oldin yopsam boʻladimi?', ru: 'Можно ли погасить досрочно?' },
    a: {
      uz: 'Ha, istalgan vaqtda: toʻliq yoki qisman. Qisman toʻlasangiz, oylik toʻlov kamayadi, muddat oʻzgarmaydi.',
      ru: 'Да, в любой момент — полностью или частично. При частичном платёж в месяц уменьшается, срок прежний.',
    },
  },
  {
    q: { uz: 'Toʻlovni kechiktirsam nima boʻladi?', ru: 'Что будет, если опоздать с платежом?' },
    a: {
      uz: 'Ilova va SMS orqali eslatamiz. Kechikish kredit tarixingizga taʼsir qiladi, shuning uchun muammo boʻlsa, oldindan yozing.',
      ru: 'Мы напомним в приложении и по SMS. Просрочка влияет на кредитную историю, поэтому при трудностях напишите заранее.',
    },
  },
]
