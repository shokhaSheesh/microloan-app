import { BRAND } from '@/shared/config/brand'
import { dictionaries, LANGS, type Lang } from '@/shared/i18n/dictionaries'

const BASE = '/api/v1'

/** A failed call: the server's `error` object, or `network` when no answer came. */
export class ApiError extends Error {
  slug: string
  code: number
  status: number
  details?: Record<string, string>
  requestId?: string

  constructor(
    message: string,
    slug: string,
    code: number,
    status: number,
    details?: Record<string, string>,
    requestId?: string,
  ) {
    super(message)
    this.slug = slug
    this.code = code
    this.status = status
    this.details = details
    this.requestId = requestId
  }
}

/** The code the backend knows this app by: fortuna_loan or vodiy_loan. */
export const APP_CODE = `${BRAND.id}_loan`

// There is no client login yet; when there is, set the token here after sign-in.
let token = ''
export const setToken = (value: string) => {
  token = value
}

/** The UI language, as I18nProvider keeps it on <html lang>. */
const currentLang = (): Lang => {
  const lang = document.documentElement.lang as Lang
  return LANGS.includes(lang) ? lang : 'uz'
}

export type ApiResult<T> = { data: T; status: number; requestId: string; ms: number }

/**
 * The chat has no login yet: the app makes a uuid v4 once, keeps it in localStorage and sends it
 * as X-Client-Id on the chat calls.
 */
export function clientId(): string {
  const key = 'microloan.clientId'
  try {
    const stored = localStorage.getItem(key)
    if (stored) return stored
    const made = crypto.randomUUID()
    localStorage.setItem(key, made)
    return made
  } catch {
    return (memoryId ??= crypto.randomUUID())
  }
}
let memoryId: string | undefined

type Options = {
  signal?: AbortSignal
  headers?: Record<string, string>
  method?: 'GET' | 'POST'
  /** JSON object, or FormData for the chat photos. */
  body?: object | FormData
}

/** Call a path under /api/v1 and unwrap the `{data, meta}` envelope. */
export async function apiCall<T>(path: string, options: Options = {}): Promise<ApiResult<T>> {
  const lang = currentLang()
  const started = performance.now()
  const form = options.body instanceof FormData
  let response: Response
  try {
    response = await fetch(`${BASE}${path}`, {
      method: options.method ?? 'GET',
      signal: options.signal,
      body: options.body
        ? form
          ? (options.body as FormData)
          : JSON.stringify(options.body)
        : undefined,
      headers: {
        'X-App': APP_CODE,
        'Accept-Language': lang,
        ...(options.body && !form && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(dictionaries[lang]['api.network'], 'network', 0, 0)
  }

  const body = await response.json().catch(() => null)
  const requestId = body?.meta?.request_id ?? response.headers.get('X-Request-Id') ?? ''
  if (!response.ok || body?.success === false) {
    const error = body?.error
    throw new ApiError(
      error?.message ?? dictionaries[lang]['api.network'],
      error?.slug ?? 'http_error',
      error?.code ?? 0,
      response.status,
      error?.details,
      requestId,
    )
  }
  return {
    data: body.data as T,
    status: response.status,
    requestId,
    ms: performance.now() - started,
  }
}

export const apiGet = <T>(
  path: string,
  options: { signal?: AbortSignal; headers?: Record<string, string> } = {},
) => apiCall<T>(path, options)

/** The headers every chat call carries. */
export const chatHeaders = () => ({ 'X-Client-Id': clientId() })
