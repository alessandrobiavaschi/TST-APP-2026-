import React, { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { FioreVisivo } from '../../pages/ResultsPage'

void motion

const SLIDE_HEADING_COPY = {
  Blu: {
    natura: 'NATURA LUNARE',
    caratteri: 'MALINCONICO NOSTALGICA',
    caratteriEstesi: 'CARATTERI EMOTIVI CHE PREDILIGONO RIFLESSIVITA, DIALOGO INTIMO, INTIMA PERCEZIONE EMOTIVA.',
  },
  Rosso: {
    natura: 'NATURA MARZIALE',
    caratteri: 'VOLITIVO COLLERICA',
    caratteriEstesi: 'CARATTERI EMOTIVI IN CUI PREVALE L’ASSERTIVITA.',
  },
  Verde: {
    natura: 'NATURA FLEMMATICA',
    caratteri: 'CONTEMPLATIVA',
    caratteriEstesi: 'CARATTERI EMOTIVI CHE PREDILIGONO CALMA, RIPOSO E CONTEMPLAZIONE.',
  },
  Giallo: {
    natura: 'NATURA SOLARE',
    caratteri: 'SANGUINICO ENTUSIASTA',
    caratteriEstesi: 'CARATTERI EMOTIVI ORIENTATI AL MOVIMENTO E ALLA SCOPERTA.',
  },
  Grigio: {
    natura: 'NATURA ANAFFETTIVA',
    caratteri: '',
    caratteriEstesi: 'CORRENTE AGNOSTICO-ANAFFETTIVA, DISTACCO INTELLETTUALE.',
  },
}

const SIDE_SUMMARY_BRIDGE =
  'Più sotto trovi natura e racconto del profilo, le cinque disposizioni musicali, i quattro rapporti e il lessico degli stati d’animo.'

function sideSummaryFirstLine(descrizioneBreve, dominantColorName) {
  const d = typeof descrizioneBreve === 'string' ? descrizioneBreve.trim() : ''
  if (!d) {
    return `Famiglia temperamentale prevalente: ${dominantColorName || '—'}.`
  }
  const parts = d.split('.').map((s) => s.trim()).filter(Boolean)
  let line = parts.length > 0 ? `${parts[0]}.` : d
  if (line.length > 155) {
    line = `${line.slice(0, 152).trimEnd()}…`
  }
  return line
}

const NATURE_FALLBACK_DESCRIPTION = {
  Blu: 'CARATTERI EMOTIVI CHE PREDILIGONO RIFLESSIVITA, DIALOGO INTIMO, INTIMA PERCEZIONE EMOTIVA.',
  Rosso: 'CARATTERI EMOTIVI IN CUI PREVALE L’ASSERTIVITA.',
  Verde: 'CARATTERI EMOTIVI CHE PREDILIGONO CALMA, RIPOSO E CONTEMPLAZIONE.',
  Giallo: 'CARATTERI EMOTIVI ORIENTATI AL MOVIMENTO E ALLA SCOPERTA.',
  Grigio: 'CORRENTE AGNOSTICO-ANAFFETTIVA, DISTACCO INTELLETTUALE.',
}

export default function HeroSummary({
  record,
  nomeCompleto,
  age,
  restituzione,
  dominantColorName,
  accentColor,
  levels,
  totalsByKey,
  formatDateShort,
  showAuthoritySeal = false,
  onDownload,
  onClose,
  onEnterCommandCenter,
}) {
  const isAnonymousProfile = !nomeCompleto || nomeCompleto === 'Test anonimo'
  const slideHeading = SLIDE_HEADING_COPY[dominantColorName] || null
  const profileColor = dominantColorName?.toUpperCase() || ''
  const profileTitle = slideHeading?.natura || restituzione?.natura || `NATURA ${profileColor}`
  const profileTraits = slideHeading?.caratteri || restituzione?.caratteri || ''
  const appartenenza = nomeCompleto && nomeCompleto !== 'Test anonimo'
    ? `${nomeCompleto} appartiene alla famiglia ${dominantColorName}.`
    : `Appartieni alla famiglia ${dominantColorName}.`
  const descrizioneBreve = slideHeading?.caratteriEstesi || NATURE_FALLBACK_DESCRIPTION[dominantColorName] || restituzione?.caratteri_estesi || ''
  const specifiche = restituzione?.dimensione || ''
  const email = record?.raw?.Email ?? ''
  const telefono = record?.raw?.Telefono ?? ''
  const hasContatti = email || telefono
  const formattedDate = record?.raw?.Data_Ora_Fine_Test
    ? formatDateShort(record.raw.Data_Ora_Fine_Test)
    : ''
  const profileIdentity = isAnonymousProfile ? 'Profilo personale' : nomeCompleto
  const reduceMotion = useReducedMotion()
  const sideSummaryLine1 = useMemo(
    () => sideSummaryFirstLine(descrizioneBreve, dominantColorName),
    [descrizioneBreve, dominantColorName],
  )

  return (
    <section
      id="report-sintesi"
      className="report-xp-hero report-xp-section space-y-6"
      aria-labelledby="hero-badge"
    >
      {/* Barra superiore: identificazione report + azioni */}
      <header
        id="hero-badge"
        className="report-profilazione-header"
        aria-label="Scheda di profilazione"
      >
        <div className="report-profilazione-header-main">
          <p className="report-profilazione-kicker">Report TST</p>
          <p className="report-profilazione-identita">{profileIdentity}</p>
          <p className="report-profilazione-meta">
            {age ? `${age} anni` : 'Eta non indicata'}
            {formattedDate ? ` · Aggiornato al ${formattedDate}` : ''}
          </p>
        </div>
        <div className="report-profilazione-azioni">
          <button
            type="button"
            className="report-profilazione-btn"
            onClick={onDownload}
          >
            Scarica dati
          </button>
          <button
            type="button"
            className="report-profilazione-btn report-profilazione-btn--ghost"
            onClick={onClose}
          >
            Chiudi
          </button>
        </div>
      </header>

      <motion.div
        className="report-xp-bento"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={`report-xp-bento-main ${showAuthoritySeal ? 'report-xp-bento-main--authority' : ''}`}>
          <div className="report-xp-bento-main-inner">
            {showAuthoritySeal && (
              <p className="report-authority-seal-label" aria-label="Esito certificato TST">
                Esito certificato TST
              </p>
            )}
            <p className="report-profilazione-stato">
              Forma singola
              <span className="report-profilazione-badge" style={{ color: accentColor }}>
                {profileColor}
              </span>
            </p>
            <h1
              className={`report-profilazione-titolone report-profilazione-titolone--hero ${showAuthoritySeal ? 'report-profilazione-titolone--authority' : ''}`}
              style={{ color: accentColor }}
            >
              {profileTitle}
            </h1>
            {profileTraits && (
              <p className="report-profilazione-specifica">{profileTraits}</p>
            )}
            <p className="report-profilazione-appartenenza">{appartenenza}</p>
            {descrizioneBreve && (
              <p className="report-profilazione-desc">
                {descrizioneBreve}
              </p>
            )}
            <p className="report-profilazione-context">
              Come leggerlo: questa restituzione segue la nomenclatura del modello testuale ufficiale.
            </p>
            {hasContatti && (
              <div className="report-profilazione-contatti">
                {email && <span>{email}</span>}
                {telefono && <span>{telefono}</span>}
              </div>
            )}
          </div>
        </div>

        <aside className="report-xp-bento-side report-profilazione-hero-side" aria-label="Riepilogo rapido del profilo">
          <p className="report-profilazione-side-kicker">Sintesi iniziale</p>
          <div className="report-profilazione-highlights">
            <span className="report-profilazione-highlight">
              Dominante: <strong>{profileColor}</strong>
            </span>
            {specifiche && (
              <span className="report-profilazione-highlight">
                Focus: <strong>{specifiche}</strong>
              </span>
            )}
            {age && (
              <span className="report-profilazione-highlight">
                Eta: <strong>{age} anni</strong>
              </span>
            )}
          </div>
          <div className="report-profilazione-side-list">
            <p><strong>Profilo:</strong> {profileIdentity}</p>
            {formattedDate && <p><strong>Aggiornato:</strong> {formattedDate}</p>}
            <p><strong>Famiglia:</strong> {dominantColorName}</p>
          </div>
          <div className="report-profilazione-side-summary">
            <p>{sideSummaryLine1}</p>
            <p>{SIDE_SUMMARY_BRIDGE}</p>
          </div>
        </aside>

        {levels && totalsByKey && (
          <motion.div
            className="report-xp-bento-radar"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-8%' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="report-hero-radar-only" aria-label="Risultati principali: profilo a 5 disposizioni">
              <div className="report-hero-scroll-strip">
                <article className="report-hero-scroll-card">
                  <h2 className="report-hero-radar-comparative-title">Radar principale</h2>
                  <p className="report-hero-radar-comparative-subtitle">
                    Mappa estesa con dettagli e legenda completa delle disposizioni.
                  </p>
                  <div className="report-hero-command-entry">
                    <button
                      type="button"
                      className="report-hero-command-entry-btn"
                      onClick={onEnterCommandCenter}
                    >
                      Entra nel Centro di Comando
                    </button>
                  </div>
                  <div className="report-hero-radar-card-content">
                    <FioreVisivo
                      levels={levels}
                      totals={totalsByKey}
                      chartHeight={460}
                      dispositionAccentColor={accentColor}
                      showLegend={true}
                    />
                  </div>
                </article>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}
