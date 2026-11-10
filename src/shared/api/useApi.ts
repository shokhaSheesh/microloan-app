import { useCallback, useEffect, useState } from 'react'
import { toast } from '@/shared/lib/toast'
import { apiGet, ApiError } from './client'

type State<T> = { data?: T; error?: ApiError; loading: boolean }

/**
 * GET a path when the screen opens (and again after `reload`). A failure is shown with the
 * toast and kept in `error`, so the screen can offer a retry. Pass `null` to wait.
 */
export function useApi<T>(path: string | null) {
  const [state, setState] = useState<State<T>>({ loading: path !== null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (path === null) return
    const controller = new AbortController()
    apiGet<T>(path, { signal: controller.signal })
      .then((result) => setState({ data: result.data, loading: false }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const failure =
          error instanceof ApiError ? error : new ApiError(String(error), 'unknown', 0, 0)
        toast(failure.message, 'error')
        setState({ error: failure, loading: false })
      })
    return () => controller.abort()
  }, [path, attempt])

  const reload = useCallback(() => {
    setState((previous) => ({ data: previous.data, loading: true }))
    setAttempt((n) => n + 1)
  }, [])
  return { ...state, reload }
}
