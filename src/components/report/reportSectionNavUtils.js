const SCROLL_LOCK_MS = 700

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
  el.scrollIntoView({ behavior, block: 'start' })

  window.setTimeout(() => {
    onLockChange?.(false)
  }, SCROLL_LOCK_MS)

  return true
}

export { SCROLL_LOCK_MS }
