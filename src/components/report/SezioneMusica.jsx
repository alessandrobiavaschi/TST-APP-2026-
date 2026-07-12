import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { MUSICISTI_INTRO, MUSICISTI_SCHEDE } from '../../content/musicaDisposizione.js'
import ReportPassageHeader from './ReportPassageHeader.jsx'
import { buildMusicalitaTitle } from './reportSectionsConfig.js'
import '../../styles/sezione-musica.css'

// Il flat-config ESLint del repo non rileva l'uso di `motion` via JSX member.
void motion

const cardVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      delay: Math.min(index * 0.06, 0.24),
      ease: [0.22, 1, 0.36, 1],
    },
  }),
}

function BulletList({ items }) {
  if (!items?.length) return null
  return (
    <ul className="sezione-musica__list">
      {items.map((item) => (
        <li key={item}>
          {item}
        </li>
      ))}
    </ul>
  )
}

function CompactRows({ items }) {
  if (!items?.length) return null

  return (
    <div className="sezione-musica__detail-list">
      {items.map((item) => (
        <article
          key={item.title}
          className="sezione-musica__detail-row"
        >
          <h4>{item.title}</h4>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  )
}

function MusicLanguage({ linguaggio }) {
  if (!linguaggio) return null
  const items = [
    { title: 'Timbri', text: linguaggio.timbri },
    { title: 'Ritmo', text: linguaggio.ritmo },
    { title: 'Melodia e armonia', text: linguaggio.melodiaArmonia },
  ]

  return <CompactRows items={items} />
}

function PracticeCards({ fareMusica }) {
  if (!fareMusica) return null
  const items = [
    { title: 'Eseguire', text: fareMusica.suonare },
    { title: 'Interpretare', text: fareMusica.interpretare },
    { title: 'Comporre', text: fareMusica.comporre },
  ]

  return <CompactRows items={items} />
}

function KeywordLine({ words }) {
  if (!words?.length) return null
  return <p className="sezione-musica__keywords">{words.join(' • ')}</p>
}

function SectionBlock({ title, children, variant, index = 0, reduceMotion }) {
  return (
    <motion.section
      className={`sezione-musica__block${variant ? ` sezione-musica__block--${variant}` : ''}`}
      variants={reduceMotion ? undefined : cardVariants}
      initial={reduceMotion ? false : 'hidden'}
      whileInView={reduceMotion ? undefined : 'visible'}
      viewport={{ once: true, margin: '-10% 0px' }}
      custom={index}
    >
      <h3>{title}</h3>
      {children}
    </motion.section>
  )
}

export default function SezioneMusica({ musicista, profilo, accentColor, step = '5' }) {
  const reduceMotion = useReducedMotion()
  const famiglia = profilo?.famiglia || ''
  const scheda = MUSICISTI_SCHEDE[famiglia]
  const title = buildMusicalitaTitle(profilo)

  if (!scheda) return null

  return (
    <section
      id="report-tst-musica"
      className="sezione-musica report-tst-section-anchor"
      aria-labelledby="sezione-musica-title"
    >
      <ReportPassageHeader
        step={step}
        title={title}
        lead={MUSICISTI_INTRO}
        accentColor={accentColor}
        titleId="sezione-musica-title"
      />

      <div className="sezione-musica__meta-row">
        <span className="sezione-musica__badge" style={{ '--music-accent': accentColor }}>
          Famiglia: {scheda.label}
        </span>
        {musicista.strumento ? (
          <span className="sezione-musica__instrument">
            Strumento indicato nel test: <strong>{musicista.strumento}</strong>
          </span>
        ) : null}
      </div>

      <div className="sezione-musica__content">
        <SectionBlock
          title="Cosa cerca nella Musica"
          variant="lead"
          index={0}
          reduceMotion={reduceMotion}
        >
          <p>{scheda.cosaCerca}</p>
        </SectionBlock>

        <SectionBlock
          title="Linguaggio"
          variant="panel"
          index={1}
          reduceMotion={reduceMotion}
        >
          <MusicLanguage linguaggio={scheda.linguaggioMusicale} />
        </SectionBlock>

        <SectionBlock
          title="Fare Musica"
          variant="panel"
          index={2}
          reduceMotion={reduceMotion}
        >
          <PracticeCards fareMusica={scheda.fareMusica} />
        </SectionBlock>

        <SectionBlock
          title="Sintesi operativa"
          variant="panel"
          index={3}
          reduceMotion={reduceMotion}
        >
          <div className="sezione-musica__summary-grid">
            <div>
              <h4>Cosa valorizza</h4>
              <BulletList items={scheda.valorizza} />
            </div>
            <div>
              <h4>Attenzioni</h4>
              <BulletList items={scheda.difficolta} />
            </div>
          </div>
        </SectionBlock>

        <SectionBlock
          title="Parole chiave"
          variant="keywords"
          index={4}
          reduceMotion={reduceMotion}
        >
          <KeywordLine words={scheda.paroleChiave} />
        </SectionBlock>
      </div>
    </section>
  )
}
