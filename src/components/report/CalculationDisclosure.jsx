import { useEffect, useId, useRef, useState } from 'react'
import './CalculationDisclosure.css'

export default function CalculationDisclosure({ children, className = '' }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const contentId = useId()

  useEffect(() => {
    if (!open) return undefined

    const closeWhenClickingOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', closeWhenClickingOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeWhenClickingOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <div ref={rootRef} className={`calculation-disclosure ${className}`.trim()}>
      <button
        type="button"
        className="calculation-disclosure__trigger"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((current) => !current)}
      >
        Come si ottengono questi numeri?
      </button>
      {open ? (
        <div id={contentId} className="calculation-disclosure__content">
          {children}
        </div>
      ) : null}
    </div>
  )
}
