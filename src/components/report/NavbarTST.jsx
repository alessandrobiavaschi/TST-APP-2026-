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
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [menuOpen])

  const naturaResult = formatNatureResult(profilo?.natura || correnteDominante)
  const caratteristicaResult = formatCharacteristicResult(profilo?.disposizione)
  const correnteTitle = ['natura', naturaResult, caratteristicaResult].filter(Boolean).join(' · ')

  // ── Render Mobile: Bottom Navigation Bar ───────────────────────────
  if (isMobile) {
    const mobileTabs = [
      { id: 'report', label: 'Report' },
      { id: 'galassia', label: 'Galassia' },
      { id: 'for-musicians', label: 'Musicisti' },
    ]

    return (
      <header
        className="navbar-tst navbar-tst--mobile"
        data-force-visible={forceVisible ? 'true' : 'false'}
      >
        <div className="navbar-tst__bar navbar-tst__bar--mobile">
          {mobileTabs.map((tab) => {
            const active = modalita === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
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

          {/* Menu button */}
          <button
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
              <div className="navbar-tst__popover-divider" role="separator" />
              <button
                type="button"
                role="menuitem"
                className="navbar-tst__popover-item"
                onClick={() => {
                  setMenuOpen(false)
                  window.location.assign('/home')
                }}
              >
                Home
              </button>
              <button
                type="button"
                role="menuitem"
                className="navbar-tst__popover-item"
                onClick={() => {
                  setMenuOpen(false)
                  window.location.assign('/risultati')
                }}
              >
                Archivio Test
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
    { id: 'galassia', label: 'Galassia' },
    { id: 'for-musicians', label: 'For Musicians' },
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

        {/* ── Centro: switch Report | Galassia ────────────────────── */}
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

        {/* ── Destra: corrente + scarica + aiuto ──────────────────── */}
        <div className="navbar-tst__right">
          {naturaResult || caratteristicaResult ? (
            <span className="navbar-tst__corrente" title={correnteTitle}>
              <span className="navbar-tst__corrente-label">natura</span>
              {naturaResult ? (
                <span className="navbar-tst__corrente-family">{naturaResult}</span>
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
