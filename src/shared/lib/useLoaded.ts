import { useEffect, useState } from 'react'

/**
 * False for a moment after a screen opens, then true. It stands in for waiting on the
 * backend, so the loading skeletons can be seen. With real requests, use their own state.
 */
export function useLoaded(ms = 450) {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), ms)
    return () => clearTimeout(timer)
  }, [ms])
  return loaded
}
