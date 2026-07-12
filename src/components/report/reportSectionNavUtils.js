import { REPORT_SECTIONS, SECTION_TO_GROUP } from './reportSectionsConfig.js'

const SCROLL_LOCK_MS = 700

/** Voci menu senza anchor dedicato → contenitore della sezione. */
const SECTION_SCROLL_ALIASES = {
  'report-rapporto-natura': 'report-tst-rapporti',
  'report-rapporto-se': 'report-tst-rapporti',
  'report-rapporto-altro': 'report-tst-rapporti',
  'report-rapporto-agire': 'report-tst-rapporti',
}

function domAnchorId(id) {
  if (typeof document === 'undefined') return null
  return document.getElementById(id) ? id : null
}

/**
 * Destinazione scroll dal menu: non apre accordion chiusi — punta all'intestazione del gruppo.
 * Se il gruppo è già aperto dall'utente, punta all'anchor interno quando esiste.
 */
export function resolveReportScrollTarget(sectionId, { groupOpen = {} } = {}) {
  if (!sectionId) return sectionId

  if (sectionId === 'report-hero' || sectionId.startsWith('report-group-')) {
    return sectionId
  }

  const navMeta = REPORT_SECTIONS.find((s) => s.id === sectionId)
  const groupId = navMeta?.groupId || SECTION_TO_GROUP[sectionId]

  if (groupId && !groupOpen[groupId]) {
    return groupId
  }

  if (sectionId.startsWith('report-chapter-')) {
    return domAnchorId(sectionId) || 'report-tst-famiglia'
  }

  const candidates = [
    sectionId,
    SECTION_SCROLL_ALIASES[sectionId],
    sectionId.startsWith('report-chapter-') ? 'report-tst-famiglia' : null,
  ].filter(Boolean)

  for (const candidate of candidates) {
    const resolved = domAnchorId(candidate)
    if (resolved) return resolved
  }

  return groupId || sectionId
}

export function getStickyOffsetPx() {
  if (typeof window === 'undefined') return 96
  const shell = document.querySelector('.app-shell--report')
  const appHeader = shell
    ? parseFloat(getComputedStyle(shell).getPropertyValue('--app-header-offset')) || 56
    : 0
  const root = document.querySelector('.report-tst')
  if (!root) return 96 + appHeader
  const styles = getComputedStyle(root)
  const nav = parseFloat(styles.getPropertyValue('--navbar-tst-height')) || 56
  const sub = parseFloat(styles.getPropertyValue('--report-section-nav-height')) || 0
  return appHeader + nav + sub
}

/**
 * Scroll alla sezione con offset sticky; opzionale lock per scroll-spy.
 */
export function scrollToReportSection(id, { reduceMotion = false, onLockChange } = {}) {
  const el = document.getElementById(id)
  if (!el) return false

  onLockChange?.(true)
  const behavior = reduceMotion ? 'auto' : 'smooth'
  const offset = getStickyOffsetPx()
  const top = el.getBoundingClientRect().top + window.scrollY - offset - 8
  window.scrollTo({ top: Math.max(0, top), behavior })

  window.setTimeout(() => {
    onLockChange?.(false)
  }, SCROLL_LOCK_MS)

  return true
}

export { SCROLL_LOCK_MS }
