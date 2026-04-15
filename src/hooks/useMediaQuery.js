import { useEffect, useState } from 'react'

/**
 * @param {string} query
 * @param {boolean} [defaultValue=false]
 */
export function useMediaQuery(query, defaultValue = false) {
  const getMatches = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return defaultValue
    return window.matchMedia(query).matches
  }
  const [matches, setMatches] = useState(getMatches)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined
    const mql = window.matchMedia(query)
    const handler = () => setMatches(mql.matches)
    handler()
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}
