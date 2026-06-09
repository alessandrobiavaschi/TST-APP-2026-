import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  REPORT_SOMMARIO_ENTRIES,
  activeSommarioIdFromSpyId,
} from '../../constants/reportSommarioEntries.js'
import { SHOW_TRACCE_SECTION } from './reportFeatureFlags.js'

const SPY_ORDER = [
  'report-sintesi',
  'report-tst-profilo',
  'report-chapter-natura',
  'report-chapter-racconto',
  'report-chapter-risorse',
  'report-chapter-ombre',
  'report-operatori',
  'report-natura-base',
  'report-rapporti',
  ...(SHOW_TRACCE_SECTION ? ['report-tracce'] : []),
  'report-galassia',
  'report-lessico',
  'report-dati',
  'report-closing-epilogue',
]

const PANEL_ID = 'report-sommario-flyout-panel'

export default function ReportSommarioSidebar() {
  const [activeId, setActiveId] = useState('report-sintesi')
  const [open, setOpen] = useState(false)
  const [pinned, setPinned] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      const present = SPY_ORDER.map((id) => ({ id, el: document.getElementById(id) })).filter((x) => x.el)
      if (!present.length) return
      const marker = window.scrollY + window.innerHeight * 0.22
      let current = present[0].id
      for (const { id, el } of present) {
        const top = el.getBoundingClientRect().top + window.scrollY
        if (top <= marker) current = id
      }
      setActiveId(activeSommarioIdFromSpyId(current))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  useEffect(() => {
    if (!pinned) return
    const onDocPointerDown = (event) => {
      const root = wrapperRef.current
      if (root && !root.contains(event.target)) {
        setPinned(false)
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onDocPointerDown)
    return () => {
      document.removeEventListener('pointerdown', onDocPointerDown)
    }
  }, [pinned])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setPinned(false)
        setOpen(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  const handleWrapperEnter = () => setOpen(true)

  const handleWrapperLeave = () => {
    if (!pinned) setOpen(false)
  }

  const handleTriggerClick = (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (pinned) {
      setPinned(false)
      setOpen(false)
    } else {
      setPinned(true)
      setOpen(true)
    }
  }

  const handleLinkClick = () => {
    setPinned(false)
    setOpen(false)
  }

  const flyout = (
    <div
      ref={wrapperRef}
      className="report-xp report-sommario-flyout"
      onMouseEnter={handleWrapperEnter}
      onMouseLeave={handleWrapperLeave}
    >
      <button
        type="button"
        className="report-sommario-flyout-trigger"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={PANEL_ID}
        title="Sommario del report"
        onClick={handleTriggerClick}
      >
        <svg
          className="report-sommario-flyout-trigger-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M5 7h14M5 12h14M5 17h14"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
        <span className="visually-hidden">Sommario</span>
      </button>

      <div
        id={PANEL_ID}
        className={`report-sommario-flyout-panel ${open ? 'is-open' : ''}`}
        role="menu"
        aria-label="Sommario del report"
        aria-hidden={!open}
      >
        <div className="report-sommario-sidebar-title">Sommario</div>
        <ul className="report-sommario-sidebar-list">
          {REPORT_SOMMARIO_ENTRIES.map((entry, index) => {
            const isActive = activeId === entry.id
            return (
              <li key={entry.id} role="none">
                <a
                  role="menuitem"
                  href={`#${entry.id}`}
                  className={`report-sommario-sidebar-link${entry.sub ? ' report-sommario-sidebar-link--sub' : ''} ${isActive ? 'is-active' : ''}`}
                  onClick={handleLinkClick}
                >
                  <span className="report-sommario-sidebar-num" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className="report-sommario-sidebar-label">{entry.label}</span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(flyout, document.body)
}
