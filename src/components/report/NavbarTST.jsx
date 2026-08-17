import React, { useState, useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { NAVBAR_UI } from './reportUiCopy.js'

// Il flat-config ESLint del repo non rileva l'uso di `motion` via JSX member.
void motion

function toDisplayCase(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/(^|\s|')([a-zà-ú])/g, (match, prefix, letter) => `${prefix}${letter.toUpperCase()}`)
}

function formatNatureResult(natura = '') {
  const raw = String(natura || '').trim()
  const normalized = raw
    .toLowerCase()
    .replace(/\s+/g, ' ')

  if (normalized.includes('natura')) {
    return toDisplayCase(normalized.replace(/natura/g, '').trim())
  }

  return toDisplayCase(raw)
}

function formatCharacteristicResult(value = '') {
  const normalized = String(value || '')
    .trim()
    .replace(/^CARATTERISTICA(?:\s+EMOTIVA)?\s+/i, '')
  return normalized ? `caratteristica ${toDisplayCase(normalized)}` : ''
}

/**
 * <NavbarTST /> — sub-bar del Report TST.
 *
 * Su desktop: sub-bar sticky montata subito dopo la hero.
 * Su mobile: convertita in bottom navigation bar fixed in basso con 4 azioni.
 */
export default function NavbarTST({
  forceVisible = false,
  modalita = 'report',
  onModalitaChange,
  userName = '',
  correnteDominante = '',
  profilo,
  onDownload,
  onOpenHelp,
}) {
  const reduceMotion = useReducedMotion()
  const [isMobile, setIsMobile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const menuButtonRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mql = window.matchMedia('(max-width: 768px)')
    setIsMobile(mql.matches)
    const handler = (e) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (!menuOpen) return undefined
    const handleOutsideClick = (e) => {
      if (menuButtonRef.current?.contains(e.target)) return
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    const handleEscape = (e) => {
      if (e.key !== 'Escape') return
      setMenuOpen(false)
      menuButtonRef.current?.focus()
    }
    window.requestAnimationFrame(() => {
      menuRef.current?.querySelector('[role="menuitem"]')?.focus()
    })
    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [menuOpen])

  const naturaResult = formatNatureResult(profilo?.natura || correnteDominante)
  const famigliaResult = toDisplayCase(profilo?.famigliaLabel || correnteDominante)
  const caratteristicaResult = formatCharacteristicResult(profilo?.disposizione || naturaResult)
  const correnteTitle = ['famiglia', famigliaResult, caratteristicaResult].filter(Boolean).join(' · ')

  // ── Render Mobile: Bottom Navigation Bar ───────────────────────────
  if (isMobile) {
    const mobileTabs = [
      { id: 'report', label: 'Report' },
      { id: 'for-musicians', label: 'For Musicians' },
    ]

    return (
      <header
        className="navbar-tst navbar-tst--mobile"
        data-force-visible={forceVisible ? 'true' : 'false'}
      >
        <div className="navbar-tst__bar navbar-tst__bar--mobile">
          <div role="tablist" aria-label={NAVBAR_UI.modalitaAria} className="navbar-tst__mobile-tabs">
            {mobileTabs.map((tab) => {
              const active = modalita === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  tabIndex={active ? 0 : -1}
                  onClick={() => {
                    setMenuOpen(false)
                    onModalitaChange?.(tab.id)
                  }}
                  className="navbar-tst__tab-btn"
                  data-active={active ? 'true' : 'false'}
                >
                  <span className="navbar-tst__tab-label">{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Menu button */}
          <button
            ref={menuButtonRef}
            type="button"
            className="navbar-tst__tab-btn"
            data-active={menuOpen ? 'true' : 'false'}
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <span className="navbar-tst__tab-label">Menu</span>
          </button>

          {/* Floating Menu Popover */}
          {menuOpen && (
            <div ref={menuRef} className="navbar-tst__popover-menu" role="menu">
              <button
                type="button"
                role="menuitem"
                className="navbar-tst__popover-item"
                onClick={() => {
                  setMenuOpen(false)
                  onDownload?.()
                }}
              >
                Scarica CSV
              </button>
              <button
                type="button"
                role="menuitem"
                className="navbar-tst__popover-item"
                onClick={() => {
                  setMenuOpen(false)
                  onOpenHelp?.()
                }}
              >
                Guida &amp; Aiuto
              </button>
            </div>
          )}
        </div>
      </header>
    )
  }

  // ── Render Desktop: Top Sticky Navigation Bar ─────────────────────
  const desktopTabs = [
    { id: 'report', label: 'Report' },
    { id: 'for-musicians', label: 'Musicians' },
    { id: 'galassia', label: 'Galassia' },
  ]
  return (
    <header
      className="navbar-tst"
      data-force-visible={forceVisible ? 'true' : 'false'}
    >
      <div className="navbar-tst__bar">
        {/* ── Sinistra: logo + utente ─────────────────────────────── */}
        <div className="navbar-tst__left">
          <span
            className="navbar-tst__logo"
            style={{ color: 'var(--report-structural-accent, #a78bfa)' }}
          >
            TST
          </span>
          <div className="navbar-tst__identity">
            <span className="navbar-tst__kicker">{NAVBAR_UI.reportKicker}</span>
            {userName ? <span className="navbar-tst__user">{userName}</span> : null}
          </div>
        </div>

        {/* ── Centro: switch Report | Musicians | Galassia, o rientro ── */}
        {forceVisible ? (
          <button
            type="button"
            className="navbar-tst__back-btn"
            onClick={() => onModalitaChange?.('report')}
          >
            ← Torna al report principale
          </button>
        ) : (
          <div
            role="tablist"
            aria-label={NAVBAR_UI.modalitaAria}
            className="navbar-tst__switch"
          >
            {desktopTabs.map((tab) => {
              const active = modalita === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onModalitaChange?.(tab.id)}
                  className="navbar-tst__switch-btn"
                  data-active={active ? 'true' : 'false'}
                >
                  {active && (
                    <motion.span
                      layoutId="navbar-tst-indicator"
                      className="navbar-tst__switch-indicator"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 380, damping: 32 }
                      }
                      aria-hidden="true"
                    />
                  )}
                  <span className="navbar-tst__switch-label">{tab.label}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* ── Destra: corrente + scarica + aiuto ──────────────────── */}
        <div className="navbar-tst__right">
          {famigliaResult || caratteristicaResult ? (
            <span className="navbar-tst__corrente" title={correnteTitle}>
              <span className="navbar-tst__corrente-label">famiglia</span>
              {famigliaResult ? (
                <span className="navbar-tst__corrente-family">{famigliaResult}</span>
              ) : null}
              {caratteristicaResult ? (
                <span className="navbar-tst__corrente-name">{caratteristicaResult}</span>
              ) : null}
            </span>
          ) : null}
          <span className="navbar-tst__sep navbar-tst__sep--right" aria-hidden="true" />
          <button
            type="button"
            onClick={onDownload}
            className="navbar-tst__download"
          >
            {NAVBAR_UI.download}
          </button>
          <button
            type="button"
            onClick={onOpenHelp}
            aria-label={NAVBAR_UI.helpAria}
            className="navbar-tst__help"
          >
            ?
          </button>
        </div>
      </div>
    </header>
  )
}
