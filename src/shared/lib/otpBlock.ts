import { CODE_BLOCK_MINUTES, MAX_WRONG_CODES } from '@/shared/config/otp'

// Per phone number: wrong codes in a row, and when a block ends. Kept while the app runs, so going
// back and asking for a new code does not lift it.
const wrong = new Map<string, number>()
const until = new Map<string, number>()

export const otpBlock = {
  /** When the block on this number ends, or null when there is none. */
  until: (key: string) => {
    const end = until.get(key)
    return end && end > Date.now() ? end : null
  },
  /** Counts a wrong code. True when it was the last allowed one and the number is now blocked. */
  wrong: (key: string) => {
    const count = (wrong.get(key) ?? 0) + 1
    if (count < MAX_WRONG_CODES) {
      wrong.set(key, count)
      return false
    }
    wrong.delete(key)
    until.set(key, Date.now() + CODE_BLOCK_MINUTES * 60_000)
    return true
  },
  /** Tries left before the block. */
  left: (key: string) => MAX_WRONG_CODES - (wrong.get(key) ?? 0),
  /** A right code starts the count over. */
  clear: (key: string) => wrong.delete(key),
}
