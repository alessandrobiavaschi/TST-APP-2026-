import React, { useState } from 'react'
import InfoTip from './InfoTip.jsx'
import { normalizeFamigliaName } from '../../content/reportRestitution.js'
import { NATURE as NATURE_TST } from '../../config/tstSistema.js'
import { getTestoNatura, getSintesiFamiglia } from '../../content/testiFissiTemperamenti.js'
import { naturePdfDiFamiglia } from '../../utils/naturePdf.js'
import { FAMILY_THEME } from '../../config/reportFamilyTheme.js'

/**
 * Apertura della sezione 01: il risultato, detto una volta sola.
 *  1. famiglia prevalente e sua sintesi (prima frase del testo fisso di
 *     Franco Mussida; il testo completo è nella sezione 02);
 *  2. nature della famiglia e natura emersa dal test.
 * Le famiglie presenti con le loro quote stanno nei grafici (FamigliePresenti).
 */

const FAMILY_LABEL = { Blu: 'Malinconica', Giallo: 'Entusiasta', Rosso: 'Marziale', Verde: 'Flemmatica', Grigio: 'Razionale' }
const COLOR_KEY_BY_FAMILY_NAME = { Blu: 'blu', Rosso: 'rosso', Verde: 'verde', Giallo: 'giallo', Grigio: 'grigio' }

// Approfondimento facoltativo per Blu: versante lunare/solare e nota non diagnostica
// sulle etichette delle nature. Non compare altrove nel report.
const DEEP_DIVE_BY_FAMILY = {
  Blu: [
    'Il versante lunare della Malinconia, associato alla terza minore, orienta verso l’introspezione e il raccoglimento e, nelle forme più accentuate, verso la tristezza e la depressione. Il versante solare, associato alla terza maggiore, orienta invece verso l’apertura, la speranza, l’ottimismo e l’avvicinamento alla gioia.',
    'La natura specifica emersa dal test indica quale di queste manifestazioni risulta più presente nel tuo profilo: non esaurisce l’intera persona. Etichette come «Depressiva» appartengono al linguaggio del modello TST e non costituiscono una diagnosi clinica.',
  ],
}

function primaFrase(testo = '') {
  const m = String(testo).trim().match(/^.*?[.!?](?=\s|$)/)
  return (m ? m[0] : String(testo)).trim()
}

function capitalizeSentence(text) {
  if (!text) return ''
  const t = text.trim()
  const c = t.charAt(0).toUpperCase() + t.slice(1)
  return /[.!?]$/.test(c) ? c : `${c}.`
}

// Nature della famiglia SOLO dai PDF: nomi da «Parole per TST», definizione
// (prima frase) da «Testi fissi».
function natureFamigliaPdf(familyName) {
  const colorKey = COLOR_KEY_BY_FAMILY_NAME[familyName] || 'verde'
  const ordine = naturePdfDiFamiglia(colorKey)
  return NATURE_TST.filter((n) => n.colorKey === colorKey)
    .map((n) => ({ nome: n.nome, definizione: primaFrase(getTestoNatura(n.campoDb)?.testo || '') }))
    .sort((x, y) => ordine.indexOf(x.nome) - ordine.indexOf(y.nome))
}

function joinNodes(nodes) {
  return nodes.reduce((acc, node, i) => {
    if (i === 0) return [node]
    if (i === nodes.length - 1) return [...acc, ' e ', node]
    return [...acc, ', ', node]
  }, [])
}

function DeepDive({ familyLabel, paragraphs }) {
  const [open, setOpen] = useState(false)
  if (!paragraphs?.length) return null
  return (
    <div className="sintesi-correnti__disclosure">
      <button
        type="button"
        id="sintesi-intro-approfondisci-trigger"
        className="sintesi-correnti__disclosure-trigger"
        aria-expanded={open}
        aria-controls="sintesi-intro-approfondisci-panel"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sintesi-correnti__disclosure-title">Approfondisci la famiglia {familyLabel}</span>
        <span className="sintesi-correnti__disclosure-chevron" aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      {open ? (
        <div
          id="sintesi-intro-approfondisci-panel"
          role="region"
          aria-labelledby="sintesi-intro-approfondisci-trigger"
          className="sintesi-correnti__disclosure-panel"
        >
          {paragraphs.map((p) => <p key={p} className="sintesi-correnti__narrative-p">{p}</p>)}
        </div>
      ) : null}
    </div>
  )
}

export default function SintesiIntro({
  famiglia = '',
  sottodisposizione = '',
}) {
  const [activeTip, setActiveTip] = useState(null)
  const toggleTip = (id) => setActiveTip((cur) => (cur === id ? null : id))

  const familyName = normalizeFamigliaName(famiglia)
  const familyLabel = FAMILY_LABEL[familyName] || FAMILY_LABEL.Verde
  const nature = natureFamigliaPdf(familyName)
  const norm = (v) => String(v || '').trim().toLowerCase()
  const naturaEmersa = nature.find((n) => norm(n.nome) === norm(sottodisposizione)) || nature[0] || null
  const sintesiFamiglia = getSintesiFamiglia(familyName || 'Verde')

  const natureNodes = nature.map((n) => (
    n.definizione ? (
      <InfoTip
        key={n.nome}
        term={`Natura ${n.nome}`}
        tip={capitalizeSentence(n.definizione)}
        open={activeTip === `natura-${n.nome}`}
        onToggle={() => toggleTip(`natura-${n.nome}`)}
      />
    ) : <span key={n.nome}>Natura {n.nome}</span>
  ))

  return (
    <div className="report-room-intro sintesi-intro" style={{ '--sc-accent': FAMILY_THEME[familyName]?.dot }}>
      <p className="report-room-intro__key">
        La tua famiglia emotiva prevalente è{' '}
        <strong className="sintesi-editorial-highlight">{familyLabel}</strong>.
      </p>
      {sintesiFamiglia || (nature.length > 1 && naturaEmersa) ? (
        <p>
          {sintesiFamiglia}
          {nature.length > 1 && naturaEmersa ? (
            <>
              {sintesiFamiglia ? ' ' : ''}Al suo interno si distinguono nature legate {joinNodes(natureNodes.map((node) => <React.Fragment key={node.key}>alla {node}</React.Fragment>))}.
              {' '}Nel tuo caso, emerge in particolare la Natura emotiva temperamentale{' '}
              <strong className="sintesi-editorial-highlight">{naturaEmersa.nome}</strong>.
            </>
          ) : null}
        </p>
      ) : null}
      <DeepDive familyLabel={familyLabel} paragraphs={DEEP_DIVE_BY_FAMILY[familyName]} />
    </div>
  )
}
