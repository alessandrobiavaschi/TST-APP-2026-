import React from 'react'
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
 * <NavbarTST /> — sub-bar sticky del Report TST.
 *
 * Montata nel flusso subito dopo la hero (non piu' `position: fixed` sull'intero
 * viewport): resta invisibile finche' la hero occupa lo schermo e si aggancia
 * sotto l'header globale non appena lo scroll la raggiunge — comportamento nativo
 * di `position: sticky`, senza IntersectionObserver.
 * In modalita' Galassia (`forceVisible`) passa a `position: fixed` per restare
 * sempre visibile (necessario: contiene l'unico toggle per tornare al Report).
 * - Sinistra: logo "TST" (monospace bold, colore corrente) · nome utente (serif).
 * - Centro: switch [Report | Galassia] con indicatore sliding (Framer `layout`).
 * - Destra: dot corrente + nome corrente dominante · "Scarica" ghost · "?".
 *
 * Props:
 *   - forceVisible: boolean (forza `position: fixed` sempre visibile, modalità Galassia)
 *   - modalita: 'report' | 'galassia'
 *   - onModalitaChange: (m) => void
 *   - userName: string
 *   - correnteDominante: string
 *   - onDownload: () => void
 *   - onOpenHelp: () => void
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

  const tabs = [
    { id: 'report', label: 'Report' },
    { id: 'galassia', label: 'Galassia' },
    { id: 'for-musicians', label: 'For Musicians' },
  ]
  const naturaResult = formatNatureResult(profilo?.natura || correnteDominante)
  const caratteristicaResult = formatCharacteristicResult(profilo?.disposizione)
  const correnteTitle = ['natura', naturaResult, caratteristicaResult].filter(Boolean).join(' · ')

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
