import React, { useMemo } from 'react'
import { SUONO_PER_FAMIGLIA, NATURE_DETTAGLIO_12 } from '../../content/musicaPerMusicisti.js'
import SezioneMusica from './SezioneMusica.jsx'

const FAMIGLIE_CONFIG = [
  { key: 'blu', id: 'Blu', nome: 'Malinconica', color: '#2563eb' },
  { key: 'rosso', id: 'Rosso', nome: 'Marziale', color: '#dc2626' },
  { key: 'verde', id: 'Verde', nome: 'Flemmatica', color: '#16a34a' },
  { key: 'giallo', id: 'Giallo', nome: 'Entusiasta', color: '#eab308' },
  { key: 'grigio', id: 'Grigio', nome: 'Razionale', color: '#64748b' },
]

export default function PersonalSonicProfile({
  profilo = {},
  colorTotals = {},
  correntiByPeso = [],
  correnti: _correnti = [],
  accentColor = '#4ade80',
  introMusicale: _introMusicale = '',
}) {
  const famigliaKey = profilo?.famiglia || 'Blu'
  const schedaSuono = SUONO_PER_FAMIGLIA[famigliaKey] || SUONO_PER_FAMIGLIA.Blu
  const themeColor = schedaSuono.colore || accentColor

  // Calcolo quote percentuali delle 5 Famiglie
  const familyScores = useMemo(() => {
    const rawScores = FAMIGLIE_CONFIG.map((f) => {
      const val = Number(colorTotals?.[f.key]) || 0
      return { ...f, rawVal: val }
    })
    const sum = rawScores.reduce((acc, curr) => acc + curr.rawVal, 0)
    return rawScores.map((f) => ({
      ...f,
      valore: f.rawVal,
      pct: sum > 0 ? Math.round((f.rawVal / sum) * 100) : 20,
    })).sort((a, b) => b.valore - a.valore)
  }, [colorTotals])

  // Top nature emotive
  const topNature = useMemo(() => {
    if (Array.isArray(correntiByPeso) && correntiByPeso.length > 0) {
      return correntiByPeso.slice(0, 5)
    }
    // Fallback: se correntiByPeso è vuoto, mostra le prime collegate alla famiglia
    return NATURE_DETTAGLIO_12.filter((n) => n.famigliaNome === schedaSuono.famiglia).slice(0, 3)
  }, [correntiByPeso, schedaSuono.famiglia])

  return (
    <section id="fm-impronta" className="fm-section fm-personal-profile" aria-labelledby="fm-impronta-title">
      <div className="fm-profile-hero">
        <p className="fm-kicker">Sezione 1 · Impronta sonora</p>
        <h2 id="fm-impronta-title">La tua impronta nel suono</h2>
        <p className="fm-section-lead">
          La sintesi acustica del tuo test: la combinazione di risonanze ed energie emotive che orienta il tuo modo di ascoltare e produrre musica.
        </p>
      </div>

      {/* Snapshot quantitativo: Famiglie e Nature */}
      <div className="fm-snapshot-card">
        <header className="fm-snapshot-card__header">
          <span className="fm-snapshot-badge">La tua composizione energetica</span>
          <h3 className="fm-snapshot-title">Il tuo equilibrio tra le 5 Famiglie</h3>
          <p className="fm-snapshot-desc">
            Percentuale di risonanza emersa dai tuoi 72 ascolti consapevole:
          </p>
        </header>

        {/* Barre delle 5 Famiglie */}
        <div className="fm-family-bars" role="list">
          {familyScores.map((fam) => (
            <div key={fam.key} className="fm-family-bar-row" role="listitem">
              <div className="fm-family-bar-info">
                <span className="fm-family-bar-dot" style={{ backgroundColor: fam.color }} />
                <strong className="fm-family-bar-name">{fam.id} · {fam.nome}</strong>
                <span className="fm-family-bar-val">{fam.pct}%</span>
              </div>
              <div className="fm-family-bar-track">
                <div
                  className="fm-family-bar-fill"
                  style={{
                    width: `${fam.pct}%`,
                    backgroundColor: fam.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Mappatura delle Nature dominanti */}
        {topNature.length > 0 && (
          <div className="fm-snapshot-nature-section">
            <h4 className="fm-snapshot-nature-title">Le Nature emotive in primo piano nel tuo profilo:</h4>
            <div className="fm-snapshot-nature-chips">
              {topNature.map((item, idx) => {
                const label = item.nome || item.name || item.corrente || `Natura ${idx + 1}`
                const peso = item.peso || item.valore || item.punti
                return (
                  <span
                    key={label + idx}
                    className="fm-nature-chip"
                    style={{ borderColor: item.colore || themeColor }}
                  >
                    <span className="fm-nature-chip__rank">#{idx + 1}</span>
                    <strong className="fm-nature-chip__name">{label}</strong>
                    {typeof peso === 'number' && peso > 0 ? (
                      <span className="fm-nature-chip__score">{peso} pt</span>
                    ) : null}
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4 Pilastri del Suono della Famiglia */}
      <div className="fm-family-sound__head" style={{ marginTop: '48px' }}>
        <p className="fm-kicker">Codice della Famiglia Prevalente · {schedaSuono.famiglia}</p>
        <h3 className="fm-family-sound__heading">I 4 pilastri del tuo suono</h3>
        <p className="fm-section-lead">
          «{schedaSuono.motto}». I timbri, il ritmo, le armonie e l'attitudine che definiscono il tuo approccio.
        </p>
      </div>

      <div className="fm-family-sound__grid">
        <article className="fm-sound-pillar" style={{ '--pillar-accent': themeColor }}>
          <div className="fm-sound-pillar__badge">Timbri &amp; Strumenti</div>
          <h4 className="fm-sound-pillar__title">{schedaSuono.timbri.titolo}</h4>
          <p className="fm-sound-pillar__desc">{schedaSuono.timbri.descrizione}</p>
        </article>

        <article className="fm-sound-pillar" style={{ '--pillar-accent': themeColor }}>
          <div className="fm-sound-pillar__badge">Ritmo &amp; BPM</div>
          <h4 className="fm-sound-pillar__title">{schedaSuono.ritmoBpm.titolo}</h4>
          <p className="fm-sound-pillar__desc">{schedaSuono.ritmoBpm.descrizione}</p>
        </article>

        <article className="fm-sound-pillar" style={{ '--pillar-accent': themeColor }}>
          <div className="fm-sound-pillar__badge">Armonie &amp; Modi</div>
          <h4 className="fm-sound-pillar__title">{schedaSuono.armonieModi.titolo}</h4>
          <p className="fm-sound-pillar__desc">{schedaSuono.armonieModi.descrizione}</p>
        </article>

        <article className="fm-sound-pillar" style={{ '--pillar-accent': themeColor }}>
          <div className="fm-sound-pillar__badge">Il musicista che sei</div>
          <h4 className="fm-sound-pillar__title">{schedaSuono.ilMusicistaCheSei.titolo}</h4>
          <p className="fm-sound-pillar__desc">{schedaSuono.ilMusicistaCheSei.descrizione}</p>
        </article>
      </div>

      {/* Narrative SezioneMusica (La pratica e l'ascolto) */}
      <div className="fm-practice-integration">
        <SezioneMusica profilo={profilo} accentColor={themeColor} />
      </div>
    </section>
  )
}
