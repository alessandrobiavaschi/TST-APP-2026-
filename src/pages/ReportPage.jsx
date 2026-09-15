import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import reportContent from '../content_report.json'
import {
  computeColorTotals,
  normalizeLevels,
  downloadCsvSingleRecord,
  getDominantColorInfo,
  computeRapportiTotalsFromRaw,
} from '../utils/reportRecordUtils.js'
import FinalFlowerTransition from '../components/report/FinalFlowerTransition'
import ReportShell from '../components/report/ReportShell.jsx'
import { buildReportData } from '../utils/buildReportData.js'
import { getMergedReportBlock } from '../reportContentMerged.js'
import { createEmptyTestRecord } from '../dbSchema.js'
import '../styles/report-tst.css'

// Record di esempio per /report-preview: stessa pipeline di calcolo dei report
// reali (buildReportData, computeColorTotals, ecc.), nessun dato inventato nei
// contenuti — solo punteggi di prova per una famiglia Marziale prevalente, utili
// a verificare il layout senza dover passare da login/archivio Firebase.
const SAMPLE_PREVIEW_RECORD = {
  id: 'anteprima-report',
  raw: {
    ...createEmptyTestRecord(),
    Nome: 'Anteprima',
    Cognome: 'Report',
    Data_Test: '2026-08-20',
    Data_Ora_Fine_Test: '2026-08-20',
    PE_Simpatia: 6,
    PE_Antipatia: 2,
    PE_Indifferenza: 3,
    BLU_1_Depressiva: 3,
    BLU_2_Lunare: 5,
    BLU_3_Nostalgia: 3,
    BLU_4_Solare: 2,
    ROSSO_1_Assertivita: 14,
    ROSSO_2_Dubbio_Collera: 6,
    VERDE_1_Calma: 5,
    GIALLO_1_Gioia_Entusiasmo: 4,
    GIALLO_2_Volitivo_Passionale: 3,
    GRIGIO_1_Distaccato_Nichilista: 2,
    GRIGIO_2_Intellettuale_Saggio: 1,
    Disposizione_Prevalente: 'Marziale',
    Sottodisposizione_Prevalente: 'Assertivita',
    Portato_Esperienziale_Prevalente: 'Simpatia',
  },
}

function ReportPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const isPreviewRoute = location.pathname === '/report-preview'
  const record = location.state?.record || (isPreviewRoute ? SAMPLE_PREVIEW_RECORD : undefined)
  const fromSubmit = Boolean(location.state?.fromSubmit)
  const skipReportTransition = Boolean(location.state?.skipReportTransition)
  const playSubmitTransition = fromSubmit && !skipReportTransition
  const [transitionPhase, setTransitionPhase] = useState(playSubmitTransition ? 'video' : 'none')
  const [resultRevealPhase, setResultRevealPhase] = useState(playSubmitTransition ? 'hold' : 'visible')
  useEffect(() => {
    if (resultRevealPhase !== 'hold') return undefined
    const timer = window.setTimeout(() => {
      setResultRevealPhase('visible')
    }, 500)
    return () => window.clearTimeout(timer)
  }, [resultRevealPhase])

  const showIntroFrame = resultRevealPhase !== 'visible'

  useEffect(() => {
    if (showIntroFrame) return
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [showIntroFrame, record])

  if (!record || !record.raw || typeof record.raw !== 'object') {
    return (
      <div className="page report-page-empty">
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
  const totalsByKey = { blu, rosso, verde, giallo, grigio }
  const { dominantKey, dominantColorName } = getDominantColorInfo(totalsByKey)
  const textBlock =
    getMergedReportBlock(dominantColorName) || reportContent[dominantColorName] || reportContent.Giallo
  const restituzione = textBlock.restituzione_natura
    ? {
        natura: textBlock.restituzione_natura,
        caratteri: textBlock.restituzione_caratteri,
        caratteri_estesi: textBlock.restituzione_caratteri_estesi,
        dimensione: textBlock.restituzione_dimensione,
      }
    : null

  let rapportiLevels
  let rapportiTotals
  try {
    rapportiTotals = computeRapportiTotalsFromRaw(record.raw || {})
    rapportiLevels = {
      natura: normalizeLevels(rapportiTotals.natura),
      se: normalizeLevels(rapportiTotals.se),
      altro: normalizeLevels(rapportiTotals.altro),
      agire: normalizeLevels(rapportiTotals.agire),
    }
  } catch (err) {
    console.warn('computeRapportiTotalsFromRaw failed, radar rapporti a 0', err)
    rapportiLevels = {
      natura: normalizeLevels({ blu: 0, rosso: 0, verde: 0, giallo: 0, grigio: 0 }),
      se: normalizeLevels({ blu: 0, rosso: 0, verde: 0, giallo: 0, grigio: 0 }),
      altro: normalizeLevels({ blu: 0, rosso: 0, verde: 0, giallo: 0, grigio: 0 }),
      agire: normalizeLevels({ blu: 0, rosso: 0, verde: 0, giallo: 0, grigio: 0 }),
    }
    rapportiTotals = { natura: {}, se: {}, altro: {}, agire: {} }
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
  const focus = restituzione?.dimensione || ''

  // reportData unico: l'adattatore consuma esclusivamente i punteggi già
  // calcolati sopra (no nuovo scoring) e i contenuti del modello.
  let reportData
  try {
    reportData = buildReportData({
      record,
      totalsByKey,
      dominantColorName,
      textBlock,
      rapportiLevels,
      rapportiTotals,
      portatoEsperienziale,
      focus,
      nomeCompleto: nomeCompleto === 'Test anonimo' ? '' : nomeCompleto,
    })
  } catch (err) {
    console.error('buildReportData failed:', err)
    return (
      <div className="page report-page-empty">
        <section className="page-card">
          <h1 className="report-display-title">Report non disponibile</h1>
          <p className="results-empty-message">
            Non è stato possibile preparare il report per questo test. Torna ai risultati e riprova; se il problema
            persiste, contatta il supporto.
          </p>
          <div className="report-final-actions-buttons">
            <button type="button" className="nav-button primary" onClick={() => navigate('/risultati')}>
              Vai ai risultati
            </button>
            <button type="button" className="nav-button secondary" onClick={() => navigate('/home')}>
              Torna alla home
            </button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="report-page-wrapper page-video-bg-root report-page-wrapper--night" lang="it">
      {showIntroFrame ? (
        <div className="report-page report-page-frame min-h-screen">
          {playSubmitTransition && transitionPhase === 'video' && (
            <FinalFlowerTransition
              colorKey={dominantKey}
              onEnded={() => {
                setTransitionPhase('done')
                setResultRevealPhase('hold')
              }}
              onSkipped={() => {
                setTransitionPhase('skipped')
                setResultRevealPhase('hold')
              }}
            />
          )}
          {playSubmitTransition && resultRevealPhase === 'hold' && (
            <div className="report-final-reveal-blank" aria-hidden="true" />
          )}
        </div>
      ) : (
        <ReportShell
          reportData={reportData}
          onDownload={() => downloadCsvSingleRecord(record)}
          onNavigateHome={() => navigate('/home')}
          onNavigateArchive={handleClose}
        />
      )}
    </div>
  )
}

export default ReportPage
