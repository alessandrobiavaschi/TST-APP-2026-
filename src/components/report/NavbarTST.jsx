import React, { useEffect, useState } from 'react'
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

  if (normalized.includes('caratteristica emotiva')) {
    return `caratteristica emotiva ${toDisplayCase(normalized.replace(/caratteristica emotiva/g, '').trim())}`
  }

  if (normalized.includes('qualità emotiva')) {
    return `caratteristica emotiva ${toDisplayCase(normalized.replace(/qualità emotiva/g, '').trim())}`
  }

  if (normalized.includes('caratteristica')) {
    return `caratteristica ${toDisplayCase(normalized.replace(/caratteristica/g, '').trim())}`
  }

  if (normalized.includes('natura')) {
    return `caratteristica ${toDisplayCase(normalized.replace(/natura/g, '').trim())}`
  }

  return toDisplayCase(raw)
}

/**
 * <NavbarTST /> — navbar sticky del Report TST.
 *
 * - Invisibile mentre la hero è nel viewport; appare con fade-in quando la hero
 *   esce (IntersectionObserver sul ref della hero passato via `heroRef`).
 *   In modalità Galassia (`forceVisible`) resta sempre visibile.
 * - Sticky top:0, z-50, altezza 56px (48px mobile), bg #0a0f1a opacity .92 +
 *   backdrop-blur(12px), border-bottom #1e293b.
 * - Sinistra: logo "TST" (monospace bold, colore corrente) · nome utente (serif).
 * - Centro: switch [Report | Galassia] con indicatore sliding (Framer `layout`).
 * - Destra: dot corrente + nome corrente dominante · "Scarica" ghost · "?".
 *
 * Props:
 *   - heroRef: ref dell'elemento hero (per IntersectionObserver)
 *   - forceVisible: boolean (sempre visibile, es. modalità Galassia)
 *   - modalita: 'report' | 'galassia'
 *   - onModalitaChange: (m) => void
 *   - userName: string
 *   - correnteDominante: string
 *   - onDownload: () => void
 *   - onOpenHelp: () => void
 */
export default function NavbarTST({
  heroRef,
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
  const [heroInView, setHeroInView] = useState(true)

  useEffect(() => {
    if (forceVisible) return undefined
    const el = heroRef?.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      const raf = window.requestAnimationFrame(() => setHeroInView(false))
      return () => window.cancelAnimationFrame(raf)
    }
    const observer = new IntersectionObserver(
      ([entry]) => setHeroInView(entry.isIntersecting && entry.intersectionRatio > 0.12),
      { threshold: [0, 0.12, 0.5] },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [heroRef, forceVisible])

  const visible = forceVisible || !heroInView

  const tabs = [
    { id: 'report', label: 'Report' },
    { id: 'galassia', label: 'Galassia' },
  ]
  const famigliaResult = toDisplayCase(profilo?.disposizione || profilo?.famiglia || '')
  const naturaResult = formatNatureResult(profilo?.natura || correnteDominante)
  const correnteTitle = ['famiglia', famigliaResult, naturaResult].filter(Boolean).join(' · ')

  return (
    <header
      className="navbar-tst"
      data-visible={visible ? 'true' : 'false'}
      aria-hidden={!visible}
      style={{
        position: 'fixed',
        top: 'var(--app-header-offset, 0px)',
        left: 0,
        right: 0,
        zIndex: 50,
        minHeight: 'var(--navbar-tst-height, 56px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: 'rgba(10, 15, 26, 0.92)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        pointerEvents: visible ? 'auto' : 'none',
        transition: reduceMotion
          ? 'none'
          : 'opacity 0.3s ease, transform 0.3s ease',
      }}
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
          {tabs.map((tab) => {
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
          {famigliaResult || naturaResult ? (
            <span className="navbar-tst__corrente" title={correnteTitle}>
              <span className="navbar-tst__corrente-label">famiglia</span>
              {famigliaResult ? (
                <span className="navbar-tst__corrente-family">{famigliaResult}</span>
              ) : null}
              {naturaResult ? (
                <span className="navbar-tst__corrente-name">{naturaResult}</span>
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
