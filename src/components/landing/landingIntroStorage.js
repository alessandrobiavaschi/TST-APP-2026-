// Stato "intro già vista" della landing (vedi LandingIntroRackFocus.jsx)
const STORAGE_KEY = 'tst-landing-intro-seen'

export function shouldPlayLandingIntro() {
  if (typeof window === 'undefined') return false
  try {
    if (new URLSearchParams(window.location.search).get('intro') === '1') return true
  } catch { /* ignore */ }
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false
  if (window.scrollY > 40) return false
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== '1'
  } catch {
    return true
  }
}

export function markLandingIntroSeen() {
  try {
    window.localStorage.setItem(STORAGE_KEY, '1')
  } catch { /* ignore */ }
}
