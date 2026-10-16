import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts'
import { colors, radarFamiglie } from '../../design-tokens.ts'
import { buildPortatoViewData } from '../../utils/portatoPadViewData.js'
import TernaryPortatoPad from './TernaryPortatoPad.jsx'
import './GraficiViewerModal.css';
import CirclePacking from './CirclePacking.jsx';

const SLIDES_COUNT = 5

export default function GraficiViewerModal({
  isOpen = false,
  onClose,
  profilo = {},
  correnti = [],
  sottocorrenti = [],
  portato = {},
  rapporti = [],
  colorTotals = {},
  rawRecord = {},
}) {
  const [activeSlide, setActiveSlide] = useState(0)
  const [selectedRapportoTab, setSelectedRapportoTab] = useState(-1) // -1 = Panoramica 4 rapporti
  const containerRef = useRef(null)
  const touchStartX = useRef(0)

  // ── Slide 1: Le 5 Famiglie Emotive ──
  const famiglieData = useMemo(() => {
    const rawScores = {
      blu: Number(colorTotals?.Blu ?? colorTotals?.blu ?? 0),
      rosso: Number(colorTotals?.Rosso ?? colorTotals?.rosso ?? 0),
      verde: Number(colorTotals?.Verde ?? colorTotals?.verde ?? 0),
      giallo: Number(colorTotals?.Giallo ?? colorTotals?.giallo ?? 0),
      grigio: Number(colorTotals?.Grigio ?? colorTotals?.grigio ?? 0),
    }

    let sum = Object.values(rawScores).reduce((acc, val) => acc + val, 0)

    if (sum === 0 && Array.isArray(correnti) && correnti.length > 0) {
      correnti.forEach((c) => {
        const k = String(c.familyKey || c.key || c.id || '').toLowerCase()
        if (rawScores[k] !== undefined) {
          rawScores[k] = Number(c.valore ?? c.punti ?? c.peso ?? 0)
        }
      })
      sum = Object.values(rawScores).reduce((acc, val) => acc + val, 0)
    }

    return radarFamiglie.map((fam) => {
      const pts = Number(rawScores[fam.key]) || 0
      const pct = sum > 0 ? Math.round((pts / sum) * 100) : 0
      const isDominant =
        profilo?.correnteDominante?.toLowerCase() === fam.subject.toLowerCase() ||
        profilo?.famiglia?.toLowerCase() === fam.subject.toLowerCase() ||
        profilo?.familyKey?.toLowerCase() === fam.key.toLowerCase()
      return {
        ...fam,
        pts,
        pct,
        isDominant,
      }
    })
  }, [colorTotals, profilo, correnti])

  // ── Slide 2: Le 11 Correnti Emotive ──
  const correntiData = useMemo(() => {

    const list =
      Array.isArray(sottocorrenti) && sottocorrenti.length > 0
        ? sottocorrenti
        : Array.isArray(correnti) && correnti.length > 0
          ? correnti
          : []

    return list.map((c) => {
      const name = c.nome || c.label || c.key || ''
      const val = Number(c.valore ?? c.punti ?? c.value ?? c.peso ?? 0)
      const max = Number(c.maxTeorico ?? 18)
      const pct =
        c.percentuale != null
          ? Number(c.percentuale)
          : max > 0
            ? Math.round(Math.min(100, Math.max(0, (val / max) * 100)))
            : 0

      const isDominant = Boolean(
        c.isDominant ||
          c.principale ||
          (profilo?.sottodisposizione &&
            name.toLowerCase() === String(profilo.sottodisposizione).toLowerCase()),
      )

      return {
        name,
        val,
        pct,
        colore: c.colore || c.color || colors.accentSystem,
        isDominant,
      }
    })
  }, [correnti, sottocorrenti, profilo]);


  // ── Slide 3: I Quattro Rapporti ──
  const rapportiOverviewData = useMemo(() => {
    if (!Array.isArray(rapporti) || rapporti.length === 0) {
      return [
        { subject: 'Natura di base', value: 5, fullMark: 7 },
        { subject: 'Rapporto con te', value: 4, fullMark: 7 },
        { subject: "Rapporto con l'altro", value: 6, fullMark: 7 },
        { subject: "Rapporto con l'agire", value: 5, fullMark: 7 },
      ]
    }
    return rapporti.map((r) => {
      const topVal = Number(
        r.valore ??
          r.livello ??
          r.graduatoria?.[0]?.valore ??
          r.correntePrincipale?.valore ??
          (r.datiRadar?.[0]?.valore) ??
          5,
      )
      return {
        subject: r.nome || r.titolo || 'Rapporto',
        value: topVal,
        fullMark: 7,
      }
    })
  }, [rapporti])

  const singleRapportoData = useMemo(() => {
    if (selectedRapportoTab < 0 || !rapporti[selectedRapportoTab]) return null
    const r = rapporti[selectedRapportoTab]
    const list = Array.isArray(r.datiRadar) ? r.datiRadar : []
    return {
      nome: r.nome,
      correnteGuida: r.correntePrincipale?.nome || '',
      colore: r.correntePrincipale?.colore || colors.accentSystem,
      data: list.map((item) => ({
        subject: item.corrente || item.nome || item.familyKey,
        value: Number(item.valore ?? 4),
        fullMark: 7,
      })),
    }
  }, [rapporti, selectedRapportoTab])

  // ── Slide 4: Il Portato Esperienziale ──
  const portatoView = useMemo(() => buildPortatoViewData(portato), [portato])

  // Gestione tastiera (frecce e Esc)
  useEffect(() => {
    if (!isOpen) return undefined
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose?.()
      } else if (e.key === 'ArrowRight') {
        setActiveSlide((prev) => (prev < SLIDES_COUNT - 1 ? prev + 1 : prev))
      } else if (e.key === 'ArrowLeft') {
        setActiveSlide((prev) => (prev > 0 ? prev - 1 : prev))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Gestione Swipe touch per mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX
    if (Math.abs(diff) > 45) {
      if (diff > 0 && activeSlide < SLIDES_COUNT - 1) {
        setActiveSlide((prev) => prev + 1)
      } else if (diff < 0 && activeSlide > 0) {
        setActiveSlide((prev) => prev - 1)
      }
    }
  }

  if (!isOpen || typeof document === 'undefined') return null

  const modalContent = (
    <div
      className={`grafici-modal-overlay ${isOpen ? 'is-open' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Stanza dei Grafici a Schermo Intero"
    >
      <div
        ref={containerRef}
        className="grafici-modal-container"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* ── Top Bar ── */}
        <header className="grafici-modal-header">
          <button
            type="button"
            className="grafici-modal-back-btn"
            onClick={onClose}
          >
            ← Torna al report
          </button>
          <span className="grafici-modal-steps">
            Vista {activeSlide + 1} di {SLIDES_COUNT}
          </span>
          <button
            type="button"
            className="grafici-modal-close-btn"
            onClick={onClose}
            aria-label="Chiudi visore grafici"
          >
            ✕
          </button>
        </header>

        {/* ── Body ── */}
        <div className="grafici-modal-body">
          {/* Frecce laterali di navigazione */}
          <button
            type="button"
            className="grafici-modal-arrow grafici-modal-arrow--prev"
            disabled={activeSlide === 0}
            onClick={() => setActiveSlide((prev) => Math.max(0, prev - 1))}
            aria-label="Grafico precedente"
          >
            ‹
          </button>

          <button
            type="button"
            className="grafici-modal-arrow grafici-modal-arrow--next"
            disabled={activeSlide === SLIDES_COUNT - 1}
            onClick={() => setActiveSlide((prev) => Math.min(SLIDES_COUNT - 1, prev + 1))}
            aria-label="Grafico successivo"
          >
            ›
          </button>

          {/* ── SLIDE 0: Le 5 Famiglie Emotive (Titolo vincolante: "La tua esperienza sonora, in numeri") ── */}
          {activeSlide === 0 && (
            <>
              <div className="grafici-modal-slide-header">
                <h2 className="grafici-modal-slide-title">La tua esperienza sonora, in numeri</h2>
                <p className="grafici-modal-slide-subtitle">
                  Presenza percentuale e somma dei punti delle cinque famiglie emotive
                </p>
              </div>

              <div className="grafici-modal-stage">
                <div className="slide-famiglie-container">
                  {famiglieData.map((item) => (
                    <div
                      key={item.key}
                      className={`slide-famiglia-row ${item.isDominant ? 'is-dominant' : ''}`}
                    >
                      <div className="slide-famiglia-header">
                        <span className="slide-famiglia-name-wrap">
                          <span
                            className="slide-famiglia-dot"
                            style={{
                              backgroundColor: item.color,
                              boxShadow: item.isDominant ? `0 0 12px ${item.color}` : 'none',
                            }}
                          />
                          <span>{item.subject}</span>
                          {item.isDominant && (
                            <span className="slide-corrente-badge">Prevalente</span>
                          )}
                        </span>
                        <div className="slide-famiglia-scores">
                          <span className="slide-famiglia-pct">{item.pct}%</span>
                          <span className="slide-famiglia-pts">({item.pts} pt)</span>
                        </div>
                      </div>
                      <div className="slide-famiglia-track">
                        <div
                          className="slide-famiglia-fill"
                          style={{
                            width: `${Math.max(4, Math.min(100, item.pct))}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── SLIDE 1: Le 11 Correnti Emotive ── */}
          {activeSlide === 1 && (
            <>
              <div className="grafici-modal-slide-header">
                <h2 className="grafici-modal-slide-title">Le undici correnti emotive</h2>
                <p className="grafici-modal-slide-subtitle">
                  Distribuzione dei punteggi e attivazione nelle specifiche correnti del modello
                </p>
              </div>

              <div className="grafici-modal-stage">
                <div className="slide-correnti-container">
                  {correntiData.map((corrente, idx) => (
                    <div
                      key={idx}
                      className={`slide-corrente-card ${corrente.isDominant ? 'is-dominant' : ''}`}
                    >
                      <div className="slide-corrente-name">
                        <span>{corrente.name}</span>
                        {corrente.isDominant && (
                          <span className="slide-corrente-badge">Guida</span>
                        )}
                      </div>
                      <div className="slide-corrente-val">
                        Punteggio: <strong>{corrente.val}</strong>
                        {corrente.pct > 0 && <span className="slide-corrente-pct-tag"> · {corrente.pct}%</span>}
                      </div>
                      <div className="slide-famiglia-track" style={{ height: '5px' }}>
                        <div
                          className="slide-famiglia-fill"
                          style={{
                            width: `${Math.min(100, Math.max(4, corrente.pct))}%`,
                            backgroundColor: corrente.colore,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── SLIDE 2: I Quattro Rapporti ── */}
          {activeSlide === 2 && (
            <>
              <div className="grafici-modal-slide-header">
                <h2 className="grafici-modal-slide-title">I quattro rapporti</h2>
                <p className="grafici-modal-slide-subtitle">
                  Orientamento dell'energia: Natura di base, Sé, Altro e Agire (scala 1–7)
                </p>

                {/* Sub-tabs per passare dalla panoramica ai singoli rapporti */}
                {Array.isArray(rapporti) && rapporti.length > 0 && (
                  <div className="slide-rapporti-subtabs" role="tablist" aria-label="Seleziona rapporto">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={selectedRapportoTab === -1}
                      className={`slide-rapporti-subtab ${selectedRapportoTab === -1 ? 'is-active' : ''}`}
                      onClick={() => setSelectedRapportoTab(-1)}
                    >
                      Panoramica (4 Ambiti)
                    </button>
                    {rapporti.map((r, i) => (
                      <button
                        key={r.id || i}
                        type="button"
                        role="tab"
                        aria-selected={selectedRapportoTab === i}
                        className={`slide-rapporti-subtab ${selectedRapportoTab === i ? 'is-active' : ''}`}
                        onClick={() => setSelectedRapportoTab(i)}
                      >
                        {r.nome || `Rapporto ${i + 1}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grafici-modal-stage" style={{ height: '360px' }}>
                <ResponsiveContainer width="100%" height={340}>
                  <RadarChart
                    data={singleRapportoData ? singleRapportoData.data : rapportiOverviewData}
                    cx="50%"
                    cy="50%"
                    outerRadius="75%"
                  >
                    <PolarGrid stroke="rgba(255, 255, 255, 0.15)" />
                    <PolarAngleAxis
                      dataKey="subject"
                      stroke="#e2e8f0"
                      tick={{ fill: '#e2e8f0', fontSize: 13, fontFamily: "'Manrope', sans-serif" }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 7]}
                      stroke="rgba(255, 255, 255, 0.25)"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                    />
                    <Radar
                      name="Livello relativo"
                      dataKey="value"
                      stroke={singleRapportoData?.colore || profilo?.colore || colors.accentSystem}
                      fill={singleRapportoData?.colore || profilo?.colore || colors.accentSystem}
                      fillOpacity={0.4}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const data = payload[0].payload
                        return (
                          <div
                            style={{
                              background: 'rgba(16, 22, 34, 0.95)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '8px',
                              padding: '0.4rem 0.8rem',
                              color: '#fff',
                              fontSize: '0.85rem',
                              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                            }}
                          >
                            <strong>{data.subject}</strong>: Livello {data.value} / 7
                          </div>
                        )
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {singleRapportoData?.correnteGuida && (
                <p className="slide-rapporto-guida-text">
                  Famiglia guida in questo ambito: <strong>{singleRapportoData.correnteGuida}</strong>
                </p>
              )}
            </>
          )}

          {/* ── SLIDE 3: Il Portato Esperienziale ── */}
          {activeSlide === 3 && (
            <>
              <div className="grafici-modal-slide-header">
                <h2 className="grafici-modal-slide-title">
                  Il portato esperienziale: bilancio dell'ascolto
                </h2>
                <p className="grafici-modal-slide-subtitle">
                  Risonanza e relazione con gli stimoli sonori nel test
                </p>
              </div>

              <div className="grafici-modal-stage">
                <div className="slide-portato-container">
                  <div className="slide-portato-cards">
                    {portatoView.dimensions.map((dim) => {
                      const isDominant = dim.key === portato?.prevalente
                      return (
                        <div
                          key={dim.key}
                          className={`slide-portato-card ${isDominant ? 'is-dominant' : ''}`}
                        >
                          <div className="slide-portato-label">{dim.ui.label}</div>
                          <div className="slide-portato-pct">{dim.percentage}%</div>
                          <div className="slide-portato-pts">
                            {dim.value} {dim.value === 1 ? 'punto' : 'punti'}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <TernaryPortatoPad portato={portato} rawRecord={rawRecord} variant="full" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Footer / Dots ── */}
        <footer className="grafici-modal-footer">
          <div className="grafici-modal-dots">
            {Array.from({ length: SLIDES_COUNT }).map((_, index) => (
              <button
                key={index}
                type="button"
                className={`grafici-modal-dot ${activeSlide === index ? 'is-active' : ''}`}
                onClick={() => setActiveSlide(index)}
                aria-label={`Vai al grafico ${index + 1}`}
              />
            ))}
          </div>
          <p className="grafici-modal-legend-note">
            Usa le frecce a schermo o da tastiera (← / →) per sfogliare i grafici · Premi Esc per uscire
          </p>
        </footer>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
