import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import reportContent from '../content_report.json'
import {
  computeColorTotals,
  normalizeLevels,
  formatDateShort,
  downloadCsvSingleRecord,
  getDominantColorInfo,
} from '../utils/reportRecordUtils.js'
import { computeScoreDeltaForAnswer, getQuestionGroupForFile, getLogicTypeForFile } from '../testLogic.js'
import HeroSummary from '../components/report/HeroSummary'
import EmotionalProfileCards from '../components/report/EmotionalProfileCards'
import OperatorSection from '../components/report/OperatorSection'
import RelationalTabs from '../components/report/RelationalTabs'
import LessicoChips from '../components/report/LessicoChips'
import ReportDataTablesSection from '../components/report/ReportDataTablesSection'
import FinalFlowerTransition from '../components/report/FinalFlowerTransition'
import VideoBackground0311 from '../components/VideoBackground0311.jsx'
import ReportExperienceChrome from '../components/report/ReportExperienceChrome.jsx'
import '../styles/report-experience.css'

/** Lessico completo per famiglia (Blu, Rossa, Verde, Gialla, Grigia) */
const lessicoCompleto = {
  Blu: reportContent.Blu.lessico,
  Rosso: reportContent.Rosso.lessico,
  Verde: reportContent.Verde.lessico,
  Giallo: reportContent.Giallo.lessico,
  Grigio: reportContent.Grigio.lessico,
}

const accentColors = {
  Blu: '#3b82f6',
  Rosso: '#ef4444',
  Verde: '#22c55e',
  Giallo: '#eab308',
  Grigio: '#6b7280',
}

// Mapping file -> macro sezione per i 4 rapporti, come da manuale TST:
// - Timbro:     1–28
// - Intervalli: 29–41
// - Ritmo:      42–51
// - Melodia:    52–58
// - Armonia:    59–72
function getReportSectionForFile(fileNumber) {
  if (fileNumber >= 1 && fileNumber <= 28) return 'A_TIMBRO'
  if (fileNumber >= 29 && fileNumber <= 41) return 'B_INTERVALLI'
  if (fileNumber >= 42 && fileNumber <= 51) return 'C_RITMO'
  if (fileNumber >= 52 && fileNumber <= 58) return 'D_MELODIA'
  if (fileNumber >= 59 && fileNumber <= 72) return 'E_ARMONIA'
  return null
}

function emptyColorTotals() {
  return { blu: 0, rosso: 0, verde: 0, giallo: 0, grigio: 0 }
}

function mappaCorrenteSuColore(key) {
  if (!key) return null
  if (key.startsWith('BLU_')) return 'blu'
  if (key.startsWith('ROSSO_')) return 'rosso'
  if (key.startsWith('VERDE_')) return 'verde'
  if (key.startsWith('GIALLO_')) return 'giallo'
  if (key.startsWith('GRIGIO_')) return 'grigio'
  return null
}

// Ricostruisce i punteggi per i 4 rapporti (natura, se, altro, agire)
// rigiocando la logica di scoring sui 72 file, ma solo per le correnti emotive.
function computeRapportiTotalsFromRaw(rawRecord) {
  const sezioniTotals = {
    A_TIMBRO: emptyColorTotals(),
    B_INTERVALLI: emptyColorTotals(),
    C_RITMO: emptyColorTotals(),
    D_MELODIA: emptyColorTotals(),
    E_ARMONIA: emptyColorTotals(),
  }

  for (let fileNumber = 1; fileNumber <= 72; fileNumber += 1) {
    const fileKey = `File_${String(fileNumber).padStart(2, '0')}`
    const rawAnswer = rawRecord[fileKey]
    if (!rawAnswer) continue

    const reportSection = getReportSectionForFile(fileNumber)
    if (!reportSection) continue

    const group = getQuestionGroupForFile(fileNumber)
    const logicType = getLogicTypeForFile(fileNumber)
    if (!logicType) continue

    const params = {
      fileNumber,
      isConfirmation: group === 'C_BIS',
    }

    if (logicType === 'AFFINITA_BASE' || logicType === 'AFFINITA_ECCEZIONE' || logicType === 'AFFINITA_STANDARD') {
      params.affinitaOptionId = rawAnswer
    } else {
      params.answerLabel = rawAnswer
    }

    const delta = computeScoreDeltaForAnswer(params)
    if (!delta || Object.keys(delta).length === 0) continue

    Object.entries(delta).forEach(([key, value]) => {
      const colorKey = mappaCorrenteSuColore(key)
      if (!colorKey) return
      sezioniTotals[reportSection][colorKey] += value
    })
  }

  const sommaSezioniColori = (sectionNames) => {
    const out = emptyColorTotals()
    sectionNames.forEach((name) => {
      const totals = sezioniTotals[name]
      if (!totals) return
      out.blu += totals.blu
      out.rosso += totals.rosso
      out.verde += totals.verde
      out.giallo += totals.giallo
      out.grigio += totals.grigio
    })
    return out
  }

  return {
    natura: sommaSezioniColori(['A_TIMBRO', 'B_INTERVALLI', 'E_ARMONIA']),
    se: sommaSezioniColori(['B_INTERVALLI', 'D_MELODIA']),
    altro: sommaSezioniColori(['A_TIMBRO', 'D_MELODIA']),
    agire: sommaSezioniColori(['C_RITMO', 'D_MELODIA']),
  }
}

function ReportPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const routedRecord = location.state?.record
  const persistedRecord = useMemo(() => {
    if (routedRecord) return null
    try {
      const raw = window.sessionStorage.getItem('tst_last_report_record')
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object') return null
      if (!parsed.raw || typeof parsed.raw !== 'object') return null
      return parsed
    } catch (error) {
      console.warn('Impossibile leggere il fallback report da sessionStorage:', error)
      return null
    }
  }, [routedRecord])
  const record = routedRecord || persistedRecord
  const fromSubmit = Boolean(location.state?.fromSubmit)
  const [transitionPhase, setTransitionPhase] = useState(fromSubmit ? 'video' : 'none')

  useEffect(() => {
    if (!routedRecord || !routedRecord.raw || typeof routedRecord.raw !== 'object') return
    try {
      window.sessionStorage.setItem('tst_last_report_record', JSON.stringify(routedRecord))
    } catch (error) {
      console.warn('Impossibile salvare il fallback report in sessionStorage:', error)
    }
  }, [routedRecord])

  if (!record || !record.raw || typeof record.raw !== 'object') {
    try {
      window.sessionStorage.removeItem('tst_last_report_record')
    } catch {
      // ignore
    }
    return (
      <div className="page">
        <section className="page-card">
          <h1 className="report-display-title">Report non disponibile</h1>
          <p className="results-empty-message">
            Non ho trovato i dati del report in questa sessione. Apri un test dalla pagina risultati per visualizzarlo.
          </p>
          <div className="report-final-actions-buttons">
            <button
              type="button"
              className="nav-button primary"
              onClick={() => navigate('/risultati')}
            >
              Vai ai risultati
            </button>
            <button
              type="button"
              className="nav-button secondary"
              onClick={() => navigate('/home')}
            >
              Torna alla home
            </button>
          </div>
        </section>
      </div>
    )
  }

  const { blu, rosso, verde, giallo, grigio } = computeColorTotals(record.raw)
  const levels = normalizeLevels({ blu, rosso, verde, giallo, grigio })
  const totalsByKey = { blu, rosso, verde, giallo, grigio }
  const { dominantKey, dominantColorName } = getDominantColorInfo(totalsByKey)
  const lessicoFamiglie = lessicoCompleto
  const textBlock = reportContent[dominantColorName] || reportContent.Giallo
  const restituzione = textBlock.restituzione_natura
    ? {
        natura: textBlock.restituzione_natura,
        caratteri: textBlock.restituzione_caratteri,
        caratteri_estesi: textBlock.restituzione_caratteri_estesi,
        dimensione: textBlock.restituzione_dimensione,
      }
    : null

  const accentColor = accentColors[dominantColorName] || '#6b7280'

  const sezioniData = [
    { nome: 'Timbro', Blu: blu, Rosso: rosso * 0.8, Verde: verde * 0.9, Giallo: giallo * 0.8, Grigio: grigio * 0.7 },
    { nome: 'Intervalli', Blu: blu * 0.9, Rosso: rosso, Verde: verde, Giallo: giallo * 0.9, Grigio: grigio },
    { nome: 'Ritmo', Blu: blu * 0.7, Rosso: rosso * 0.9, Verde: verde * 0.8, Giallo: giallo, Grigio: grigio * 0.6 },
    { nome: 'Melodia', Blu: blu, Rosso: rosso * 0.85, Verde: verde, Giallo: giallo, Grigio: grigio * 0.8 },
    { nome: 'Armonia', Blu: blu * 0.8, Rosso: rosso * 0.8, Verde: verde * 0.9, Giallo: giallo * 0.85, Grigio: grigio },
  ]
  const sommaSezioni = (nomiSezioni) => {
    const base = { Blu: 0, Rosso: 0, Verde: 0, Giallo: 0, Grigio: 0 }
    nomiSezioni.forEach((nome) => {
      const sezione = sezioniData.find((s) => s.nome === nome)
      if (!sezione) return
      base.Blu += sezione.Blu
      base.Rosso += sezione.Rosso
      base.Verde += sezione.Verde
      base.Giallo += sezione.Giallo
      base.Grigio += sezione.Grigio
    })
    return base
  }

  const toLowerColorKeys = (totalsPerSezione) => ({
    blu: totalsPerSezione.Blu,
    rosso: totalsPerSezione.Rosso,
    verde: totalsPerSezione.Verde,
    giallo: totalsPerSezione.Giallo,
    grigio: totalsPerSezione.Grigio,
  })

  const naturaTotals = sommaSezioni(['Timbro', 'Intervalli', 'Armonia'])
  const seTotals = sommaSezioni(['Intervalli', 'Melodia'])
  const altroTotals = sommaSezioni(['Timbro', 'Melodia'])
  const agireTotals = sommaSezioni(['Ritmo', 'Melodia'])

  let rapportiLevels
  try {
    const rapportiTotals = computeRapportiTotalsFromRaw(record.raw || {})
    rapportiLevels = {
      natura: normalizeLevels(rapportiTotals.natura),
      se: normalizeLevels(rapportiTotals.se),
      altro: normalizeLevels(rapportiTotals.altro),
      agire: normalizeLevels(rapportiTotals.agire),
    }
  } catch (err) {
    // Fallback di sicurezza: usa la logica semplificata per non rompere il report
    console.warn('computeRapportiTotalsFromRaw failed, fallback to sezioniData model', err)
    rapportiLevels = {
      natura: normalizeLevels(toLowerColorKeys(naturaTotals)),
      se: normalizeLevels(toLowerColorKeys(seTotals)),
      altro: normalizeLevels(toLowerColorKeys(altroTotals)),
      agire: normalizeLevels(toLowerColorKeys(agireTotals)),
    }
  }

  const portatoTotals = {
    simpatia: Number(record.raw.PE_Simpatia) || 0,
    antipatia: Number(record.raw.PE_Antipatia) || 0,
    indifferenza: Number(record.raw.PE_Indifferenza) || 0,
  }
  const portatoEntries = [
    { key: 'Simpatia', value: portatoTotals.simpatia },
    { key: 'Antipatia', value: portatoTotals.antipatia },
    { key: 'Indifferenza', value: portatoTotals.indifferenza },
  ]
  const dominantPortato = portatoEntries.reduce((best, current) => {
    if (!best) return current
    return current.value > best.value ? current : best
  }, null)
  const portatoText = dominantPortato ? reportContent.portato_esperienziale?.[dominantPortato.key] : null
  let vitalityInterpretation =
    'profilo misto: coesistono slancio e momenti di chiusura; utile leggere con attenzione i quattro rapporti.'
  if (dominantPortato?.key === 'Simpatia') {
    vitalityInterpretation =
      'prevale un orientamento alla vitalità relazionale: maggiore disponibilità al contatto, alla risonanza e al coinvolgimento.'
  } else if (dominantPortato?.key === 'Antipatia') {
    vitalityInterpretation =
      'emerge una vitalità difensiva o in opposizione: energia presente ma spesso incanalata in rifiuto, irritazione o distanza.'
  } else if (dominantPortato?.key === 'Indifferenza') {
    vitalityInterpretation =
      'prevale una tendenza depressiva/ipo-vitale: abbassamento del coinvolgimento emotivo, distacco e riduzione della risonanza affettiva.'
  }
  const portatoEsperienziale = dominantPortato
    ? {
        dominantKey: dominantPortato.key,
        description: portatoText?.descrizione_breve || '',
        vitalityInterpretation,
        totals: portatoTotals,
      }
    : null

  const handleClose = () => navigate('/risultati')
  const nomeCompleto =
    [record.raw.Nome, record.raw.Cognome].filter(Boolean).join(' ') || 'Test anonimo'
  const age = record?.age != null ? record.age : ''

  return (
    <div className="report-page-wrapper page-video-bg-root" lang="it">
      <VideoBackground0311 showOverlay />
      <div
        className="report-page report-xp report-page-frame min-h-screen"
        style={{ '--report-xp-accent': accentColor }}
      >
        <ReportExperienceChrome>
        <div className="report-page-inner report-page-flow">
        {fromSubmit && transitionPhase === 'video' && (
          <FinalFlowerTransition
            colorKey={dominantKey}
            onEnded={() => {
              setTransitionPhase('done')
            }}
            onSkipped={() => {
              setTransitionPhase('skipped')
            }}
          />
        )}
        {fromSubmit && (
          <section className="report-final-actions report-card report-xp-section" aria-label="Azioni dopo la consegna del test">
            <p className="report-final-actions-text">
              Test completato e salvato. Scegli come proseguire.
            </p>
            <div className="report-final-actions-buttons">
              <button
                type="button"
                className="nav-button secondary"
                onClick={() => navigate('/home')}
              >
                Torna alla home
              </button>
              <button
                type="button"
                className="nav-button primary"
                onClick={() => {
                  try {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  } catch {
                    window.scrollTo(0, 0)
                  }
                }}
              >
                Visualizza report
              </button>
              <button
                type="button"
                className="nav-button secondary"
                onClick={() => navigate('/risultati')}
              >
                Vai all&apos;archivio
              </button>
            </div>
          </section>
        )}
        {/* Sezione 1: Hero (sintesi immediata) */}
        <div aria-label="Sintesi profilo">
          <HeroSummary
            record={record}
            nomeCompleto={nomeCompleto}
            age={age}
            restituzione={restituzione}
            dominantColorName={dominantColorName}
            levels={levels}
            totalsByKey={totalsByKey}
            accentColor={accentColor}
            formatDateShort={formatDateShort}
            onDownload={() => downloadCsvSingleRecord(record)}
            onClose={handleClose}
          />
        </div>

        {/* Sezione 2: Profilo Emotivo (utente) */}
        <div aria-label="Profilo emotivo">
          <EmotionalProfileCards
          textBlock={textBlock}
          restituzione={restituzione}
          dominantColorName={dominantColorName}
          accentColor={accentColor}
          />
        </div>

        {/* Sezione 3: Approfondimento (console operatori) */}
        <div className="report-xp-section space-y-6" aria-label="Approfondimento operatori">
          <OperatorSection
            sezioniData={sezioniData}
            sezioniTest={reportContent.sezioni_test}
          />
          {/* Natura di base: guida alla lettura prima dei fiori */}
          <section id="report-natura-base" className="report-section report-natura-base report-card report-xp-section" aria-labelledby="natura-base-heading">
            <h2 id="natura-base-heading" className="report-section-title">
              Natura di base
            </h2>
            <p className="report-section-lead">
              Mostra la tua impronta emotiva di fondo, oltre il singolo momento. Ti aiuta a capire dove torni più spesso quando vivi, rifletti e reagisci.
            </p>
          </section>
          <RelationalTabs rapportiLevels={rapportiLevels} portatoEsperienziale={portatoEsperienziale} />
        </div>

        {/* Sezione 4: Lessico */}
          <div aria-label="Lessico stati d'animo">
            <LessicoChips
              lessicoFamiglie={lessicoFamiglie}
              dominantColorName={dominantColorName}
            />
          </div>

        {/* Sezione 5: Tabelle complete */}
        <div aria-label="Tabelle complete report">
          <ReportDataTablesSection rawRecord={record.raw || {}} />
        </div>

        {/* Guida breve in chiusura: come si legge il report */}
        <div aria-label="Come leggere questo report">
          <section id="report-guida" className="report-section report-how-to-read report-card report-xp-section">
            <h2 className="report-section-title">Come leggere questo report</h2>
            <p className="report-section-lead">
              Percorri il documento dall’alto verso il basso: ogni blocco aggiunge un livello di dettaglio rispetto
              al precedente.
            </p>
            <ul className="report-how-to-read-list">
              <li>
                <strong>Sintesi</strong> — famiglia temperamentale prevalente e ripartizione dei cinque colori sulle
                tue risposte.
              </li>
              <li>
                <strong>Profilo emotivo</strong> — testi sulla tua famiglia dominante (natura, racconto, risorse,
                ombre).
              </li>
              <li>
                <strong>Approfondimento</strong> — cosa significano Timbro, Intervalli, Ritmo, Melodia e Armonia in
                relazione alle tue scelte.
              </li>
              <li>
                <strong>Natura di base e quattro rapporti</strong> — impronta di fondo e come ti muovi tra natura,
                sé, altro e agire.
              </li>
              <li>
                <strong>Lessico e tabelle</strong> — parole per ogni famiglia; in chiusura i numeri completi per chi
                vuole il dettaglio tecnico.
              </li>
            </ul>
          </section>
        </div>
        </div>
        </ReportExperienceChrome>
      </div>
    </div>
  )
}

export default ReportPage
