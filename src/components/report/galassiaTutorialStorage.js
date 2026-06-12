const STORAGE_KEY = 'tst_galassia_tutorial_seen_v1'
const OPENING_GUIDE_KEY = 'tst_galassia_opening_guide_seen_v1'

export function shouldShowGalassiaTutorial() {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== '1'
  } catch {
    return true
  }
}

export function markGalassiaTutorialSeen() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // ignore
  }
}

/** Percorso di lettura: solo al primo ingresso in Galassia (dopo il tutorial). */
export function shouldShowGalassiaOpeningGuide() {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(OPENING_GUIDE_KEY) !== '1'
  } catch {
    return false
  }
}

export function markGalassiaOpeningGuideSeen() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(OPENING_GUIDE_KEY, '1')
  } catch {
    // ignore
  }
}
