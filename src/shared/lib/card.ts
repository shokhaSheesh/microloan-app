export const CARD_DIGITS = 16

export const isCardNumber = (digits: string) => digits.length === CARD_DIGITS

/** `mmyy` is four digits. Valid through the last day of that month. */
export function isCardExpiry(mmyy: string, now = new Date()) {
  if (mmyy.length !== 4) return false
  const month = Number(mmyy.slice(0, 2))
  const year = 2000 + Number(mmyy.slice(2))
  if (month < 1 || month > 12) return false
  return new Date(year, month, 1) > now
}
