import React, { useState, useCallback } from 'react'

const FAMIGLIE_ORDER = ['Blu', 'Rosso', 'Verde', 'Giallo', 'Grigio']
const DOMINANT_TO_TAB = { Blu: 'Blu', Rosso: 'Rosso', Verde: 'Verde', Giallo: 'Giallo', Grigio: 'Grigio' }
const VIEW_MODES = { CHIPS: 'chips', CLOUD: 'cloud' }
const CLOUD_COLOR_MAP = {
  Blu: '#1e40af',
  Rosso: '#b91c1c',
  Verde: '#065f46',
  Giallo: '#92400e',
  Grigio: '#334155',
}

/** Restituisce un array di parole: da array o da stringa concatenata */
function toWordList(parole) {
  if (Array.isArray(parole)) return parole.filter((p) => p != null && String(p).trim() !== '')
  if (typeof parole !== 'string') return []
  const withSpaces = parole.replace(/([a-zàèéìòù])([A-ZÀÈÉÌÒÙ])/g, '$1 $2')
  return withSpaces.split(/\s+/).map((w) => w.trim()).filter(Boolean)
}

function normalizeLessico(lessicoFamiglie) {
  const out = {}
  const aliases = { Rosso: 'Rossa', Giallo: 'Gialla', Grigio: 'Grigia' }
  for (const key of FAMIGLIE_ORDER) {
    const raw = lessicoFamiglie?.[key] ?? lessicoFamiglie?.[aliases[key]]
    if (raw) out[key] = toWordList(raw)
  }
  return out
}

/**
 * Box interattivo: tab per famiglia, ricerca, clic per copiare la parola negli appunti.
 */
export default function LessicoChips({ lessicoFamiglie, dominantColorName }) {
  const [activeFamiglia, setActiveFamiglia] = useState(() => DOMINANT_TO_TAB[dominantColorName] || 'Blu')
  const [search, setSearch] = useState('')
  const [copiedWord, setCopiedWord] = useState(null)
  const [viewMode, setViewMode] = useState(VIEW_MODES.CHIPS)

  const lessicoNorm = React.useMemo(() => {
    const keys = Object.keys(lessicoFamiglie || {})
    if (keys.length === 0) return {}
    if (keys.length < 5) {
      const full = {}
      for (const k of FAMIGLIE_ORDER) {
        const alias = k === 'Rosso' ? 'Rossa' : k === 'Giallo' ? 'Gialla' : k === 'Grigio' ? 'Grigia' : null
        const v = lessicoFamiglie[k] ?? (alias ? lessicoFamiglie[alias] : undefined)
        if (v) full[k] = toWordList(v)
      }
      return Object.keys(full).length ? full : normalizeLessico(lessicoFamiglie)
    }
    return normalizeLessico(lessicoFamiglie)
  }, [lessicoFamiglie])

  const famiglieDisponibili = Object.keys(lessicoNorm).length ? Object.keys(lessicoNorm) : FAMIGLIE_ORDER
  const currentKey = famiglieDisponibili.includes(activeFamiglia) ? activeFamiglia : famiglieDisponibili[0]
  const words = lessicoNorm[currentKey] || []
  const searchLower = search.trim().toLowerCase()
  const filteredWords = searchLower
    ? words.filter((w) => w.toLowerCase().includes(searchLower))
    : words
  const cloudWords = React.useMemo(() => (
    filteredWords.map((word, index) => ({
      text: word,
      value: Math.max(15, 42 - index * 0.35),
      rotate: index % 9 === 0 ? -8 : index % 11 === 0 ? 8 : 0,
    }))
  ), [filteredWords])
  const cloudColor = CLOUD_COLOR_MAP[currentKey] || '#334155'

  const handleCopy = useCallback(async (word) => {
    try {
      await navigator.clipboard.writeText(word)
      setCopiedWord(word)
      setTimeout(() => setCopiedWord(null), 1800)
    } catch {
      setCopiedWord(null)
    }
  }, [])

  if (!Object.keys(lessicoNorm).length) return null

  return (
    <section
      id="report-lessico"
      className="lessico-box-result lessico-box-interactive report-xp-section"
      data-famiglia={currentKey}
      aria-labelledby="lessico-h1"
    >
      <h1 id="lessico-h1" className="lessico-section-h1">
        Stati d&apos;animo: aggettivi in elenco e nuvola di parole
      </h1>
      <p className="lessico-section-desc">
        Questi sono aggettivi entro cui vivi i tuoi climi emotivi. Se vuoi vedere anche gli altri, muoviti sulle altre disposizioni: e&apos; l&apos;ambito emotivo entro cui muovi i tuoi sentimenti e puoi riconoscere dentro te stesso come ti senti (consapevolezza).
      </p>

      <div className="lessico-interactive-toolbar">
        {famiglieDisponibili.length > 1 && (
          <div className="lessico-tabs" role="tablist" aria-label="Famiglia">
            {famiglieDisponibili.map((fam) => (
              <button
                key={fam}
                type="button"
                role="tab"
                aria-selected={currentKey === fam}
                className={`lessico-tab ${currentKey === fam ? 'lessico-tab--active' : ''}`}
                onClick={() => { setActiveFamiglia(fam); setSearch('') }}
              >
                {fam}
              </button>
            ))}
          </div>
        )}
        <div className="lessico-search-wrap">
          <label htmlFor="lessico-search" className="sr-only">Cerca parola</label>
          <input
            id="lessico-search"
            type="search"
            className="lessico-search-input"
            placeholder="Cerca in questa famiglia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Cerca parola nel lessico"
          />
          {search && (
            <button
              type="button"
              className="lessico-search-clear"
              onClick={() => setSearch('')}
              aria-label="Cancella ricerca"
            >
              ✕
            </button>
          )}
        </div>
        <div className="lessico-view-toggle" role="tablist" aria-label="Tipo di visualizzazione lessico">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === VIEW_MODES.CHIPS}
            className={`lessico-view-btn ${viewMode === VIEW_MODES.CHIPS ? 'lessico-view-btn--active' : ''}`}
            onClick={() => setViewMode(VIEW_MODES.CHIPS)}
          >
            Elenco
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === VIEW_MODES.CLOUD}
            className={`lessico-view-btn ${viewMode === VIEW_MODES.CLOUD ? 'lessico-view-btn--active' : ''}`}
            onClick={() => setViewMode(VIEW_MODES.CLOUD)}
          >
            Nuvola di parole
          </button>
        </div>
      </div>

      <div className="lessico-copy-hint" aria-live="polite">
        {copiedWord ? (
          <span className="lessico-copied-msg">«{copiedWord}» copiato negli appunti</span>
        ) : (
          <span className="lessico-copy-hint-text">Clicca una parola per copiarla</span>
        )}
      </div>

      {viewMode === VIEW_MODES.CHIPS ? (
        <div className="chip-grid" role="list" aria-label={`Parole famiglia ${currentKey}`}>
          {filteredWords.length ? (
            filteredWords.map((p, i) => (
              <button
                key={`${p}-${i}`}
                type="button"
                role="listitem"
                className={`chip chip--clickable ${copiedWord === p ? 'chip--copied' : ''}`}
                onClick={() => handleCopy(p)}
                title={`Copia "${p}"`}
              >
                {p}
              </button>
            ))
          ) : (
            <p className="lessico-no-results">Nessuna parola trovata per «{search}».</p>
          )}
        </div>
      ) : (
        <div className="lessico-wordcloud-wrap" aria-live="polite">
          {cloudWords.length ? (
            <div className="lessico-wordcloud-canvas" role="img" aria-label={`Nuvola di parole famiglia ${currentKey}`}>
              <div className="lessico-wordcloud-words" aria-hidden>
                {cloudWords.map((word, idx) => (
                  <button
                    key={`${word.text}-${idx}`}
                    type="button"
                    className={`lessico-wordcloud-word ${copiedWord === word.text ? 'chip--copied' : ''}`}
                    style={{
                      fontSize: `${word.value}px`,
                      color: cloudColor,
                      transform: `rotate(${word.rotate}deg)`,
                    }}
                    onClick={() => handleCopy(word.text)}
                    title={`Copia "${word.text}"`}
                  >
                    {word.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="lessico-no-results">Nessuna parola trovata per «{search}».</p>
          )}
        </div>
      )}
    </section>
  )
}
