import React, { useCallback, useMemo, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { PAROLE_UI } from './reportUiCopy.js'
import ReportPassageHeader from './ReportPassageHeader.jsx'

void motion

const FAMILY_DISPLAY_NAMES = {
  Blu: 'Malinconia',
  Rosso: 'Volitività',
  Verde: 'Calma',
  Giallo: 'Entusiasmo',
  Grigio: 'Anaffettività',
}

const FAMILY_COLORS = {
  Blu: '#3b82f6',
  Rosso: '#ef4444',
  Verde: '#22c55e',
  Giallo: '#eab308',
  Grigio: '#94a3b8',
}

const FAMILY_ORDER = ['Blu', 'Rosso', 'Verde', 'Giallo', 'Grigio']

const BODY_STACK = 'var(--font-body)'

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

function lightenForDark(hex, amount = 0.4) {
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

export default function ParoleStatiAnimo({
  famiglieLessico = {},
  famiglia = '',
  correnti = [],
  correnteDominante = '',
  step = '4',
}) {
  const prefersReducedMotion = useReducedMotion()

  const initialFamily =
    famiglia && famiglieLessico[famiglia]
      ? famiglia
      : FAMILY_ORDER.find((k) => famiglieLessico[k]) || ''

  const [selectedFamily, setSelectedFamily] = useState(initialFamily)
  const [selectedWord, setSelectedWord] = useState(null)

  const coloreDominante = useMemo(() => {
    const trovata = correnti.find((c) => c?.nome === correnteDominante)
    return trovata?.colore || FAMILY_COLORS[selectedFamily] || '#94a3b8'
  }, [correnti, correnteDominante, selectedFamily])

  const famData = useMemo(
    () => famiglieLessico[selectedFamily] || null,
    [famiglieLessico, selectedFamily],
  )

  const wordList = useMemo(() => {
    if (!famData) return []
    const words = []
    const seen = new Set()
    const famColor = FAMILY_COLORS[selectedFamily] || '#94a3b8'

    for (const sub of famData.sottoCorrenti || []) {
      for (const stato of sub.stati || []) {
        const p = String(stato || '').trim()
        if (!p || seen.has(p.toLowerCase())) continue
        seen.add(p.toLowerCase())
        words.push({ parola: p, tipo: 'aggettivo', sub, colore: famColor })
      }
    }

    for (const p of famData.vocabolarioForme || []) {
      const t = String(p || '').trim()
      if (!t || seen.has(t.toLowerCase())) continue
      seen.add(t.toLowerCase())
      words.push({ parola: t, tipo: 'forma', sub: null, colore: famColor })
    }

    return words
  }, [famData, selectedFamily])

  const handleWordClick = useCallback(
    (word) => {
      const paroleVicine = word.sub
        ? (word.sub.stati || []).filter((s) => s !== word.parola).slice(0, 6)
        : []
      setSelectedWord({
        parola: word.parola,
        famiglia: FAMILY_DISPLAY_NAMES[selectedFamily] || selectedFamily,
        sottocorrente: word.sub?.titolo || null,
        definizione: word.sub?.descrizione || famData?.lettura || '',
        paroleVicine,
      })
    },
    [selectedFamily, famData],
  )

  const handleFamilyChange = (key) => {
    setSelectedFamily(key)
    setSelectedWord(null)
  }

  return (
    <section
      aria-labelledby="dizionario-emotivo-title"
      className="parole-stati-animo-section"
      style={{
        background: 'transparent',
        paddingTop: 24,
        paddingBottom: 24,
        paddingLeft: 24,
        paddingRight: 24,
        color: '#e2e8f0',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div className="parole-stati-animo-section__inner">
        <ReportPassageHeader
          step={step}
          eyebrow={PAROLE_UI.eyebrow}
          title={PAROLE_UI.title}
          titleVisuallyHidden
          lead={PAROLE_UI.educazioneSubtitle}
          accentColor={coloreDominante}
          titleId="dizionario-emotivo-title"
        />

        <div className="parole-stati-animo-guide">
          {(PAROLE_UI.educazioneParagraphs || []).map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}
          {PAROLE_UI.educazioneCta && (
            <p>
              <em>{PAROLE_UI.educazioneCta}</em>
            </p>
          )}
        </div>

        <p
          className="parole-stati-animo-zone__lead"
          style={{ marginTop: 'var(--space-xs)', marginBottom: 'var(--space-md)' }}
        >
          La nuvola mostra le parole della tua natura emotiva prevalente. Puoi esplorare le
          sfumature del lessico e, se vuoi, aprire anche i dizionari delle altre famiglie.
        </p>

        {/* SELETTORE FAMIGLIA */}
        <div
          role="group"
          aria-label="Scegli una famiglia emotiva"
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}
        >
          {FAMILY_ORDER.filter((k) => famiglieLessico[k]).map((k) => {
            const isSelected = k === selectedFamily
            const color = FAMILY_COLORS[k]
            return (
              <button
                key={k}
                type="button"
                className="parole-stati-animo__family-btn"
                aria-pressed={isSelected}
                onClick={() => handleFamilyChange(k)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: isSelected ? withAlpha(color, 0.15) : '#1e293b',
                  border: `1px solid ${isSelected ? withAlpha(color, 0.6) : '#334155'}`,
                  borderRadius: '999px',
                  padding: '8px 16px',
                  fontFamily: BODY_STACK,
                  fontSize: 11,
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                  minHeight: 44,
                  transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: color,
                    flexShrink: 0,
                  }}
                />
                {FAMILY_DISPLAY_NAMES[k]}
              </button>
            )
          })}
        </div>

        {/* DESCRIZIONE FAMIGLIA */}
        {famData?.lettura && (
          <p
            style={{
              fontFamily: BODY_STACK,
              fontSize: '0.9rem',
              opacity: 0.65,
              lineHeight: 1.65,
              marginBottom: 36,
              maxWidth: 640,
              textAlign: 'left',
            }}
          >
            {famData.lettura}
          </p>
        )}

        {/* SCHEDA DEFINIZIONE (sopra la nuvola quando aperta) */}
        <AnimatePresence>
          {selectedWord && (
            <motion.div
              key={`def-${selectedWord.parola}`}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              style={{
                background: 'rgba(255, 255, 255, 0.035)',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                borderRadius: 16,
                padding: 24,
                marginBottom: 32,
                position: 'relative',
              }}
            >
              <button
                type="button"
                className="parole-stati-animo__close-btn"
                aria-label="Chiudi definizione"
                onClick={() => setSelectedWord(null)}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'transparent',
                  border: '1px solid #334155',
                  color: '#94a3b8',
                  borderRadius: '50%',
                  padding: '4px 10px',
                  fontFamily: BODY_STACK,
                  fontSize: 11,
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
              <h4
                style={{
                  fontFamily: BODY_STACK,
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: '#e2e8f0',
                  margin: '0 0 8px',
                }}
              >
                {selectedWord.parola}
              </h4>
              <p
                style={{
                  fontFamily: BODY_STACK,
                  fontSize: 11,
                  color: '#64748b',
                  margin: '0 0 16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Famiglia: {selectedWord.famiglia}
                {selectedWord.sottocorrente && ` · ${selectedWord.sottocorrente}`}
              </p>
              {selectedWord.definizione && (
                <p
                  style={{
                    fontFamily: BODY_STACK,
                    fontSize: '0.9rem',
                    color: '#cbd5e1',
                    lineHeight: 1.65,
                    margin: selectedWord.paroleVicine.length > 0 ? '0 0 16px' : 0,
                    textAlign: 'left',
                  }}
                >
                  {selectedWord.definizione}
                </p>
              )}
              {selectedWord.paroleVicine.length > 0 && (
                <div>
                  <p
                    style={{
                      fontFamily: BODY_STACK,
                      fontSize: 11,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      margin: '0 0 8px',
                    }}
                  >
                    Parole vicine
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {selectedWord.paroleVicine.map((p) => (
                      <span
                        key={p}
                        style={{
                          fontFamily: BODY_STACK,
                          fontSize: 12,
                          color: '#94a3b8',
                          background: 'rgba(255, 255, 255, 0.035)',
                          border: '1px solid rgba(255, 255, 255, 0.09)',
                          padding: '4px 8px',
                          borderRadius: 2,
                        }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* NUVOLA DI PAROLE */}
        <motion.div
          key={selectedFamily}
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 0,
            marginBottom: 40,
          }}
        >
          {wordList.map((w) => (
            <WordPill
              key={`${w.parola}-${w.tipo}`}
              word={w}
              isSelected={selectedWord?.parola === w.parola}
              prefersReducedMotion={prefersReducedMotion}
              onClick={() => handleWordClick(w)}
            />
          ))}
        </motion.div>

        {wordList.length === 0 && (
          <p style={{ fontFamily: BODY_STACK, opacity: 0.4, fontSize: 13, marginBottom: 40 }}>
            Dizionario non disponibile per questa famiglia.
          </p>
        )}
      </div>
    </section>
  )
}

function WordPill({ word, isSelected, prefersReducedMotion, onClick }) {
  const [hover, setHover] = useState(false)
  const coloreTesto = lightenForDark(word.colore, 0.4)
  const bgAlpha = hover || isSelected ? 0.2 : 0.08
  const borderAlpha = hover || isSelected ? 0.5 : 0.2

  return (
    <motion.button
      type="button"
      className="parole-stati-animo__word-pill"
      layout
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 4 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: hover && !prefersReducedMotion ? 1.05 : 1,
      }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={`${word.parola}${word.sub ? ` — ${word.sub.titolo}` : ''}. Clicca per la definizione.`}
      style={{
        background: withAlpha(word.colore, bgAlpha),
        border: `1px solid ${withAlpha(word.colore, borderAlpha)}`,
        borderRadius: '999px',
        padding: '6px 12px',
        margin: 4,
        fontFamily: BODY_STACK,
        fontSize: '0.9rem',
        fontWeight: isSelected ? 700 : 400,
        color: coloreTesto,
        cursor: 'pointer',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}
    >
      {word.parola}
    </motion.button>
  )
}
