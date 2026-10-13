import { useEffect, useRef } from 'react'

export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function getFocusableElements(container) {
  if (!container || typeof container.querySelectorAll !== 'function') return []
  return [...container.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
    (el) => !el.closest('[inert]'),
  )
}

export function useDialogFocus(ref, { open = true, onClose, initialFocusRef } = {}) {
  const previouslyFocusedRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    previouslyFocusedRef.current = document.activeElement

    const animId = window.requestAnimationFrame(() => {
      const root = ref?.current
      if (!root) return

      if (initialFocusRef?.current && typeof initialFocusRef.current.focus === 'function') {
        initialFocusRef.current.focus({ preventScroll: true })
        return
      }

      const focusable = getFocusableElements(root)
      if (focusable.length > 0) {
        focusable[0].focus({ preventScroll: true })
      } else if (typeof root.focus === 'function') {
        if (!root.hasAttribute('tabindex')) {
          root.setAttribute('tabindex', '-1')
        }
        root.focus({ preventScroll: true })
      }
    })

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (typeof onClose === 'function') {
          event.preventDefault()
          onClose()
        }
        return
      }

      if (event.key !== 'Tab') return

      const root = ref?.current
      if (!root) return

      const focusable = getFocusableElements(root)
      if (focusable.length === 0) {
        event.preventDefault()
        root.focus({ preventScroll: true })
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey) {
        if (active === first || !root.contains(active)) {
          event.preventDefault()
          last.focus()
        }
      } else if (active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      window.cancelAnimationFrame(animId)
      if (previouslyFocusedRef.current && typeof previouslyFocusedRef.current.focus === 'function') {
        previouslyFocusedRef.current.focus({ preventScroll: true })
      }
    }
  }, [open, onClose, ref, initialFocusRef])
}

export default useDialogFocus
