import React, { useCallback, useMemo, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import FioreCorrenti from './FioreCorrenti'
import { PAROLE_UI } from './reportUiCopy.js'

// ESLint qui non rileva l'uso di `motion` via JSX member (<motion.div>) perché
// non è abilitato react/jsx-uses-vars: marchiamo l'uso come fanno gli altri report component.
void motion

/**
 * ParoleStatiAnimo — ULTIMA sezione del Report TST (chiusura del percorso).
 *
 * Componente puro presentazionale, guidato esclusivamente dalle props:
 * nessuna chiamata a scoring/DB.
 *
 * Props:
 *   statiAnimo: Array<{
 *     parola: string,
 *     corrente: string,
 *     colore: string,          // colore esadecimale della corrente
 *     peso: "dominante" | "secondaria" | "minore" | "marginale"
 *   }>
 *   correnti: Array<{ nome: string, colore: string, descrizioneBreve?: string }>
 *   correnteDominante: string   // nome della corrente dominante (per accenti UI)
 */

const FILTRO_TUTTE = '__TUTTE__'

const LESSICO_GUIDE = PAROLE_UI.guide

// Gerarchia visiva per "peso"
const PESO_STYLE = {
  emersa: { fontSize: '1.15rem', opacity: 1, fontWeight: 700, useBody: true },
  dominante: { fontSize: '1.1rem', opacity: 1, fontWeight: 600, useBody: true },
  secondaria: { fontSize: '0.95rem', opacity: 0.85, fontWeight: 500, useBody: true },
  minore: { fontSize: '0.8rem', opacity: 0.6, fontWeight: 400, useBody: false },
  marginale: { fontSize: '0.72rem', opacity: 0.4, fontWeight: 400, useBody: false },
}

const BODY_STACK = 'var(--font-body)'
const MONO_STACK = 'var(--font-mono)'

/**
 * Schiarisce un colore esadecimale verso il bianco di una certa quantità (0..1),
 * per garantire leggibilità del testo su sfondo molto scuro.
 */
function lightenForDark(hex, amount = 0.45) {
  if (typeof hex !== 'string') return '#e2e8f0'
  let c = hex.trim().replace('#', '')
  if (c.length === 3) c = c.split('').map((ch) => ch + ch).join('')
  if (c.length !== 6 || /[^0-9a-fA-F]/.test(c)) return '#e2e8f0'
  const num = parseInt(c, 16)
  let r = (num >> 16) & 0xff
  let g = (num >> 8) & 0xff
  let b = num & 0xff
  r = Math.round(r + (255 - r) * amount)
  g = Math.round(g + (255 - g) * amount)
  b = Math.round(b + (255 - b) * amount)
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

/**
 * Converte un colore esadecimale in rgba con alpha esplicito.
 */
function withAlpha(hex, alpha) {
  if (typeof hex !== 'string') return `rgba(148,163,184,${alpha})`
  let c = hex.trim().replace('#', '')
  if (c.length === 3) c = c.split('').map((ch) => ch + ch).join('')
  if (c.length !== 6 || /[^0-9a-fA-F]/.test(c)) return `rgba(148,163,184,${alpha})`
  const num = parseInt(c, 16)
  const r = (num >> 16) & 0xff
  const g = (num >> 8) & 0xff
  const b = num & 0xff
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function ParoleStatiAnimo({
  statiAnimo = [],
  paroleEmerse = [],
  correnti = [],
  famiglieLessico = {},
  correnteDominante = '',
}) {
  const prefersReducedMotion = useReducedMotion()
  const [filtro, setFiltro] = useState(FILTRO_TUTTE)
  const [elencoCompletoAperto, setElencoCompletoAperto] = useState(false)
  const [copiata, setCopiata] = useState(null) // { parola } | null
  const [tooltipKey, setTooltipKey] = useState(null) // chiave pill con tooltip attivo (focus/tap)

  // Colore accento della corrente dominante (header label)
  const coloreDominante = useMemo(() => {
    const trovata = correnti.find((c) => c?.nome === correnteDominante)
    return trovata?.colore || correnti[0]?.colore || '#94a3b8'
  }, [correnti, correnteDominante])

  const nuvolaEmerse = useMemo(() => {
    const base = paroleEmerse.length > 0 ? paroleEmerse : statiAnimo.filter((s) => s.peso === 'dominante' || s.peso === 'secondaria')
    if (filtro === FILTRO_TUTTE) return base
    return base.filter((s) => s.corrente === filtro)
  }, [paroleEmerse, statiAnimo, filtro])

  const paroleFiltrate = nuvolaEmerse

  const correnteFiltrata = useMemo(() => {
    if (filtro === FILTRO_TUTTE) return null
    return correnti.find((c) => c.nome === filtro) || null
  }, [correnti, filtro])

  const famiglieDaMostrare = useMemo(() => {
    if (!elencoCompletoAperto) return []
    if (filtro !== FILTRO_TUTTE && correnteFiltrata?.familyName) {
      const det = famiglieLessico[correnteFiltrata.familyName]
      return det ? [det] : []
    }
    return Object.values(famiglieLessico).filter(Boolean)
  }, [elencoCompletoAperto, filtro, correnteFiltrata, famiglieLessico])

  const correntiAttive = useMemo(() => {
    const set = new Set(paroleFiltrate.map((s) => s.corrente))
    return set.size
  }, [paroleFiltrate])

  const famigliaDettaglio = useMemo(() => {
    if (!correnteFiltrata?.familyName) return null
    return famiglieLessico[correnteFiltrata.familyName] || null
  }, [correnteFiltrata, famiglieLessico])

  const descrizioneCorrenteFiltrata = useMemo(() => {
    if (!correnteFiltrata) return ''
    return (
      famigliaDettaglio?.lettura ||
      correnteFiltrata.descrizioneBreve?.trim() ||
      ''
    )
  }, [correnteFiltrata, famigliaDettaglio])

  const handleCopy = useCallback(async (parola) => {
    const mostra = () => {
      setCopiata({ parola })
      setTimeout(() => {
        setCopiata((cur) => (cur && cur.parola === parola ? null : cur))
      }, 1500)
    }
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(parola)
        mostra()
        return
      }
      throw new Error('clipboard non disponibile')
    } catch {
      // Fallback: execCommand su textarea temporanea
      try {
        const ta = document.createElement('textarea')
        ta.value = parola
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.focus()
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        mostra()
      } catch {
        // Anche il fallback fallito: nessun toast.
      }
    }
  }, [])

  const handleScrollTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }, [prefersReducedMotion])

  // Varianti animazione cloud (stagger in viewport)
  const cloudVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.02,
      },
    },
  }
  const pillEnterVariants = prefersReducedMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }

  return (
    <section
      id="report-lessico"
      aria-labelledby="parole-stati-animo-title"
      className="parole-stati-animo-section"
      style={{
        background: 'linear-gradient(to bottom, #0f172a 0%, #020817 100%)',
        paddingTop: 120,
        paddingBottom: 160,
        paddingLeft: 24,
        paddingRight: 24,
        color: '#e2e8f0',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* HEADER */}
        <header style={{ marginBottom: 48 }}>
          <p
            style={{
              fontFamily: MONO_STACK,
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              color: coloreDominante,
              opacity: 0.6,
              fontSize: 11,
              margin: 0,
            }}
          >
            {PAROLE_UI.eyebrow}
          </p>
          <h2
            id="parole-stati-animo-title"
            className="report-tst-display"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: 1.1,
              margin: '16px 0 0',
            }}
          >
            {PAROLE_UI.title}
          </h2>
          <p
            className="report-tst-body"
            style={{
              opacity: 0.85,
              fontSize: '1rem',
              maxWidth: 480,
              margin: '20px 0 0',
            }}
          >
            {PAROLE_UI.intro}
          </p>
          <div className="parole-stati-animo-guide">
            {LESSICO_GUIDE.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>
        </header>

        {/* FILTRO CORRENTI */}
        <div
          role="group"
          aria-label={PAROLE_UI.filtroAria}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: descrizioneCorrenteFiltrata ? 16 : 40,
          }}
        >
          <FiltroPill
            selezionata={filtro === FILTRO_TUTTE}
            onClick={() => setFiltro(FILTRO_TUTTE)}
            label={PAROLE_UI.filtroTutte}
            ariaLabel={PAROLE_UI.filtroTutteAria}
          />
          {correnti.map((c) => (
            <FiltroPill
              key={c.nome}
              selezionata={filtro === c.nome}
              onClick={() => setFiltro((cur) => (cur === c.nome ? FILTRO_TUTTE : c.nome))}
              label={c.nome}
              colore={c.colore}
              ariaLabel={`Filtra per corrente ${c.nome}`}
            />
          ))}
        </div>

        {descrizioneCorrenteFiltrata && (
          <p className="parole-stati-animo-corrente-desc">{descrizioneCorrenteFiltrata}</p>
        )}

        <div className="parole-stati-animo-emerse-header">
          <h3 className="parole-stati-animo-famiglia-heading">{PAROLE_UI.paroleEmerseTitle}</h3>
          <p className="parole-stati-animo-emerse-hint">{PAROLE_UI.paroleEmerseHint}</p>
        </div>

        {famiglieDaMostrare.length > 0 && (
          <div className="parole-stati-animo-famiglia-panel">
            {famiglieDaMostrare.map((fam) => {
              const forme = fam.vocabolarioForme || fam.paroleComplete || []
              const sottoCorrenti = Array.isArray(fam.sottoCorrenti) ? fam.sottoCorrenti : []
              const showFamigliaHeading = famiglieDaMostrare.length > 1
              return (
                <div key={fam.familyName} className="parole-stati-animo-famiglia-block">
                  {showFamigliaHeading && (
                    <h3 className="parole-stati-animo-famiglia-heading">{fam.familyName}</h3>
                  )}
                  {forme.length > 0 && (
                    <section className="parole-stati-animo-vocab-section" aria-labelledby={`forme-${fam.familyName}`}>
                      <h3 id={`forme-${fam.familyName}`} className="parole-stati-animo-famiglia-heading">
                        {PAROLE_UI.formeTitle}
                      </h3>
                      <p className="parole-stati-animo-emerse-hint">{PAROLE_UI.formeHint}</p>
                      <ul className="parole-stati-animo-stati-list" aria-label={`Forme nominali: ${fam.familyName}`}>
                        {forme.map((stato) => (
                          <li key={`forme-${fam.familyName}-${stato}`}>
                            <button
                              type="button"
                              className="parole-stati-animo-stato-chip parole-stati-animo-stato-chip--forme"
                              onClick={() => handleCopy(stato)}
                            >
                              {stato}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  {sottoCorrenti.length > 0 && (
                    <div className="parole-stati-animo-sotto-correnti">
                      <h3 className="parole-stati-animo-famiglia-heading">{PAROLE_UI.aggettiviTitle}</h3>
                      <p className="parole-stati-animo-emerse-hint">{PAROLE_UI.aggettiviHint}</p>
                      <h4 className="parole-stati-animo-sotto-section-label">{PAROLE_UI.sottoCorrentiTitle}</h4>
                      {sottoCorrenti.map((sub) => (
                        <article key={sub.id} className="parole-stati-animo-sotto-card">
                          <header className="parole-stati-animo-sotto-header">
                            <h5 className="parole-stati-animo-sotto-title">{sub.titolo}</h5>
                            <p className="parole-stati-animo-sotto-meta">
                              {sub.intervallo && <span>{sub.intervallo}</span>}
                              {sub.colore && <span>{sub.colore}</span>}
                            </p>
                          </header>
                          {sub.descrizione && (
                            <p className="parole-stati-animo-sotto-desc">{sub.descrizione}</p>
                          )}
                          {Array.isArray(sub.stati) && sub.stati.length > 0 && (
                            <ul className="parole-stati-animo-stati-list" aria-label={`Aggettivi: ${sub.titolo}`}>
                              {sub.stati.map((stato) => (
                                <li key={stato}>
                                  <button
                                    type="button"
                                    className="parole-stati-animo-stato-chip parole-stati-animo-stato-chip--aggettivi"
                                    onClick={() => handleCopy(stato)}
                                  >
                                    {stato}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="parole-stati-animo-expand-row">
          <button
            type="button"
            className="parole-stati-animo-expand-btn"
            aria-expanded={elencoCompletoAperto}
            onClick={() => setElencoCompletoAperto((open) => !open)}
          >
            {elencoCompletoAperto ? PAROLE_UI.chiudiElencoCompleto : PAROLE_UI.apriElencoCompleto}
          </button>
        </div>

        {/* CONTATORE */}
        <div style={{ position: 'relative', marginBottom: 12, minHeight: 18 }}>
          <p className="parole-stati-animo-copy-hint">{PAROLE_UI.copyHint}</p>
          <p
            aria-live="polite"
            style={{
              fontFamily: MONO_STACK,
              opacity: 0.3,
              fontSize: 12,
              textAlign: 'right',
              margin: 0,
            }}
          >
            {paroleFiltrate.length} stati d&apos;animo · {correntiAttive}{' '}
            {correntiAttive === 1 ? 'corrente' : 'correnti'}
          </p>
        </div>

        {/* NUVOLA DI PAROLE */}
        <motion.div
          variants={cloudVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          layout
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 0,
          }}
        >
          <AnimatePresence>
            {paroleFiltrate.map((s) => {
              const attenuata = filtro !== FILTRO_TUTTE && s.corrente !== filtro
              return (
                <ParolaPill
                  key={`${s.parola}-${s.corrente}`}
                  stato={s}
                  attenuata={attenuata}
                  enterVariants={pillEnterVariants}
                  prefersReducedMotion={prefersReducedMotion}
                  tooltipAttivo={tooltipKey === `${s.parola}-${s.corrente}`}
                  onShowTooltip={() => setTooltipKey(`${s.parola}-${s.corrente}`)}
                  onHideTooltip={() => setTooltipKey((k) => (k === `${s.parola}-${s.corrente}` ? null : k))}
                  onCopy={() => handleCopy(s.parola)}
                />
              )
            })}
          </AnimatePresence>
        </motion.div>

        {paroleFiltrate.length === 0 && (
          <p
            style={{
              fontFamily: MONO_STACK,
              opacity: 0.4,
              fontSize: 13,
              marginTop: 24,
            }}
          >
            Nessuno stato d&apos;animo per questa corrente.
          </p>
        )}

        {/* SEZIONE FINALE — CHIUSURA */}
        <footer style={{ paddingTop: 80 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              width: '100%',
            }}
            aria-hidden="true"
          >
            <span style={{ flex: 1, height: 1, background: '#1e293b' }} />
            <FioreCorrenti correnti={correnti} size={40} />
            <span style={{ flex: 1, height: 1, background: '#1e293b' }} />
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <p
              style={{
                fontFamily: MONO_STACK,
                fontSize: 10,
                opacity: 0.3,
                margin: 0,
              }}
            >
              {PAROLE_UI.footerModel}
            </p>
            <p
              style={{
                fontFamily: MONO_STACK,
                fontSize: 10,
                opacity: 0.2,
                margin: '6px 0 0',
              }}
            >
              {PAROLE_UI.footerCredit}
            </p>
            <button
              type="button"
              onClick={handleScrollTop}
              style={{
                marginTop: 28,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.4)',
                padding: '10px 24px',
                borderRadius: 2,
                fontFamily: MONO_STACK,
                fontSize: 12,
                cursor: 'pointer',
                minHeight: 44,
              }}
            >
              {PAROLE_UI.scrollTop}
            </button>
          </div>
        </footer>
      </div>

      {/* MICRO-TOAST "Copiato" */}
      <AnimatePresence>
        {copiata && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            role="status"
            aria-live="polite"
            style={{
              position: 'fixed',
              bottom: 32,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#e2e8f0',
              padding: '8px 16px',
              borderRadius: 2,
              fontFamily: MONO_STACK,
              fontSize: 12,
              zIndex: 50,
              pointerEvents: 'none',
            }}
          >
            {PAROLE_UI.copied}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function FiltroPill({ selezionata, onClick, label, colore, ariaLabel }) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: selezionata && colore ? withAlpha(colore, 0.15) : '#1e293b',
    border: `1px solid ${selezionata ? (colore ? withAlpha(colore, 0.6) : 'rgba(255,255,255,0.6)') : '#334155'}`,
    borderRadius: 2,
    padding: '8px 16px',
    fontFamily: MONO_STACK,
    fontSize: 11,
    color: selezionata ? '#ffffff' : '#94a3b8',
    cursor: 'pointer',
    transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease',
    minHeight: 44,
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selezionata}
      aria-label={ariaLabel}
      style={baseStyle}
    >
      {colore && (
        <span
          aria-hidden="true"
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: colore,
            flexShrink: 0,
          }}
        />
      )}
      {label}
    </button>
  )
}

function ParolaPill({
  stato,
  attenuata,
  enterVariants,
  prefersReducedMotion,
  tooltipAttivo,
  onShowTooltip,
  onHideTooltip,
  onCopy,
}) {
  const [hover, setHover] = useState(false)
  const peso = PESO_STYLE[stato.peso] || PESO_STYLE.minore
  const coloreTesto = lightenForDark(stato.colore, 0.4)
  const mostraTooltip = hover || tooltipAttivo

  const attivoOpacity = peso.opacity
  const filtroOpacity = attenuata ? 0.1 : attivoOpacity
  const scale = attenuata ? 0.95 : 1

  const bgAlpha = hover && !attenuata ? 0.2 : 0.08
  const borderAlpha = attenuata ? 0.2 : hover ? 0.5 : 0.2

  return (
    <motion.button
      type="button"
      layout
      variants={enterVariants}
      animate={{
        opacity: filtroOpacity,
        scale: hover && !attenuata && !prefersReducedMotion ? 1.05 : scale,
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={onShowTooltip}
      onBlur={onHideTooltip}
      onClick={() => {
        onCopy()
        // su touch: il focus mostra il tooltip
        onShowTooltip()
      }}
      aria-label={`${stato.parola} — corrente ${stato.corrente}. Clicca per copiare.`}
      style={{
        position: 'relative',
        background: withAlpha(stato.colore, bgAlpha),
        border: `1px solid ${withAlpha(stato.colore, borderAlpha)}`,
        borderRadius: 2,
        padding: '6px 12px',
        margin: 4,
        fontFamily: peso.useBody ? BODY_STACK : MONO_STACK,
        fontSize: peso.fontSize,
        fontWeight: peso.fontWeight,
        color: coloreTesto,
        cursor: 'pointer',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}
    >
      {stato.parola}
      <AnimatePresence>
        {mostraTooltip && (
          <motion.span
            role="tooltip"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 6px)',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#0f172a',
              border: '1px solid #334155',
              color: '#e2e8f0',
              padding: '4px 8px',
              borderRadius: 2,
              fontFamily: MONO_STACK,
              fontSize: 10,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            {stato.corrente}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
