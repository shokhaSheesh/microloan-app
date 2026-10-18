/** Series and number without a space: two letters, then seven digits. */
/** "AB1234567" -> "AB 1234567" */
export const formatPassport = (passport: string) => `${passport.slice(0, 2)} ${passport.slice(2)}`

export const isPassport = (value: string) => /^[A-Z]{2}\d{7}$/.test(value)
