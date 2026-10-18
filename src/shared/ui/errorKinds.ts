export const ERROR_KINDS = ['offline', 'server', 'session', 'notFound', 'forbidden'] as const
export type ErrorKind = (typeof ERROR_KINDS)[number]
