import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const NATURE_SHORT_DESCRIPTION = {
  Blu: 'Profilo introspettivo, orientato alla riflessione del passato.',
  Rosso: 'Energia volitiva, orientata all\'azione e all\'assertivita nel presente.',
  Verde: 'Calma profonda, bisogno di riposo e spazi di silenzio.',
  Giallo: 'Gioia di movimento, curiosita ed entusiasmo verso il nuovo.',
  Grigio: 'Sguardo analitico e razionale, che osserva e misura prima di sentire.',
}

/** Wrap parenthesized color/current names in <strong> */
function boldImportantPhrases(str) {
  if (!str || typeof str !== 'string') return str
  const regex = /\((?:Blu|Rosso|Amaranto|Celeste|Verde|Giallo|Grigio)(?:\s+[a-z]+)?\)/gi
  const parts = []
  let lastIndex = 0
  let match
  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: str.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'strong', value: match[0] })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < str.length) {
    parts.push({ type: 'text', value: str.slice(lastIndex) })
  }
  if (parts.length === 0) return str
  return parts.map((p, i) =>
    p.type === 'strong' ? <strong key={i}>{p.value}</strong> : p.value
  )
}

/** Split text into paragraphs and list items; return blocks for rendering */
function chunkText(text, { enableList = true } = {}) {
  if (!text || typeof text !== 'string') return []
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const blocks = []
  let currentList = []

  lines.forEach((line) => {
    const isListItem = enableList && line.startsWith('- ')
    if (isListItem) {
      const itemText = line.slice(2).trim()
      currentList.push(itemText)
    } else {
      if (currentList.length > 0) {
        blocks.push({ type: 'ul', items: currentList })
        currentList = []
      }
      blocks.push({ type: 'p', text: line })
    }
  })
  if (currentList.length > 0) {
    blocks.push({ type: 'ul', items: currentList })
  }
  return blocks
}

/** Icon: star (risorse) */
function IconStar({ className = '' }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

/** Icon: circle/info (ombre) */
function IconCircleInfo({ className = '' }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  )
}

export default function EmotionalProfileCards({
  textBlock,
  restituzione,
  dominantColorName,
  accentColor,
}) {
  const naturaTagline = restituzione
    ? [restituzione.natura, restituzione.caratteri].filter(Boolean).join(' · ')
    : `Famiglia dominante: ${dominantColorName}`
  const naturaIntro = restituzione?.caratteri_estesi || ''
  const naturaLead = NATURE_SHORT_DESCRIPTION[dominantColorName] || ''

  const raccontoBlocks = textBlock?.descrizione_estesa
    ? chunkText(textBlock.descrizione_estesa, { enableList: true })
    : []
  const risorseBlocks = textBlock?.risorse ? chunkText(textBlock.risorse) : []
  const ombreBlocks = textBlock?.ombre ? chunkText(textBlock.ombre) : []

  const raccontoParagraphs = raccontoBlocks.filter((b) => b.type === 'p')
  const raccontoListItems = raccontoBlocks.filter((b) => b.type === 'ul').flatMap((b) => b.items)
  const risorseListItems = risorseBlocks.filter((b) => b.type === 'ul').flatMap((b) => b.items)
  const ombreListItems = ombreBlocks.filter((b) => b.type === 'ul').flatMap((b) => b.items)
  const reduceMotion = useReducedMotion()
  const chapterMotion = {
    initial: reduceMotion ? false : { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-10%' },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }

  return (
    <section
      id="report-profilo"
      className="report-profilo-emotivo report-profilo-emotivo--longform report-xp-section"
      aria-labelledby="profile-cards-heading"
      style={{ '--accent': accentColor }}
    >
      <div className="report-profilo-emotivo-inner">
        <h2
          id="profile-cards-heading"
          className="report-profilo-emotivo-title"
        >
          Il tuo profilo emotivo
        </h2>

        <div className="report-profilo-longform">
          <motion.article
            className="report-report-chapter report-report-chapter--natura"
            aria-labelledby="report-chapter-natura"
            {...chapterMotion}
          >
            <header className="report-report-chapter-head">
              <h3 id="report-chapter-natura" className="report-report-chapter-title">
                La tua Natura
              </h3>
            </header>
            <div className="report-report-prose">
              <p className="report-profilo-natura-tagline">
                {naturaTagline.replace(/\s+/g, ' ').trim()}
              </p>
              {naturaIntro && (
                <p className="report-profilo-natura-intro">
                  {boldImportantPhrases(naturaIntro)}
                </p>
              )}
              <p className="report-profilo-natura-lead">
                {boldImportantPhrases(naturaLead)}
              </p>
            </div>
          </motion.article>

          <motion.article
            className="report-report-chapter report-report-chapter--racconto"
            aria-labelledby="report-chapter-racconto"
            {...chapterMotion}
          >
            <header className="report-report-chapter-head">
              <h3 id="report-chapter-racconto" className="report-report-chapter-title">
                Il tuo Racconto
              </h3>
            </header>
            <div className="report-report-prose">
              {raccontoParagraphs.map((block, i) => {
                const isSectionTitle = /^FAMIGLIA\s+\d+/i.test(block.text)
                if (isSectionTitle) return null
                return (
                  <p
                    key={`racconto-p-${i}`}
                    className="report-profilo-block-text"
                  >
                    {boldImportantPhrases(block.text)}
                  </p>
                )
              })}
              {raccontoListItems.length > 0 && (
                <ul className="report-profilo-list report-profilo-list-racconto">
                  {raccontoListItems.map((item, i) => (
                    <li key={`racconto-li-${i}`} className="report-profilo-list-item">
                      <span className="report-profilo-list-text">
                        {boldImportantPhrases(item)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {raccontoBlocks.length === 0 && (
                <p className="report-profilo-empty">Nessun racconto disponibile.</p>
              )}
            </div>
          </motion.article>

          <motion.article
            className="report-report-chapter report-report-chapter--risorse"
            aria-labelledby="report-chapter-risorse"
            style={{ '--chapter-accent': accentColor }}
            {...chapterMotion}
          >
            <header className="report-report-chapter-head">
              <h3 id="report-chapter-risorse" className="report-report-chapter-title">
                Le tue Risorse
              </h3>
            </header>
            <div className="report-report-prose">
              <p className="report-profilo-block-intro">
                Le risorse della famiglia {dominantColorName} comprendono:
              </p>
              <ul className="report-profilo-list report-profilo-list-risorse">
                {risorseListItems.map((item, i) => (
                  <li key={i} className="report-profilo-list-item">
                    <span
                      className="report-profilo-list-icon report-profilo-list-icon-risorse"
                      style={{ color: accentColor }}
                      aria-hidden
                    >
                      <IconStar />
                    </span>
                    <span className="report-profilo-list-text">
                      {boldImportantPhrases(item)}
                    </span>
                  </li>
                ))}
              </ul>
              {risorseBlocks.length === 0 && (
                <p className="report-profilo-empty">Nessuna risorsa indicata.</p>
              )}
            </div>
          </motion.article>

          <motion.article
            className="report-report-chapter report-report-chapter--ombre"
            aria-labelledby="report-chapter-ombre"
            {...chapterMotion}
          >
            <header className="report-report-chapter-head">
              <h3 id="report-chapter-ombre" className="report-report-chapter-title">
                Le tue Ombre
              </h3>
            </header>
            <div className="report-report-prose">
              <p className="report-profilo-block-intro">
                Le ombre della famiglia {dominantColorName} comprendono:
              </p>
              <ul className="report-profilo-list report-profilo-list-ombre">
                {ombreListItems.map((item, i) => (
                  <li key={i} className="report-profilo-list-item">
                    <span
                      className="report-profilo-list-icon report-profilo-list-icon-ombre"
                      aria-hidden
                    >
                      <IconCircleInfo />
                    </span>
                    <span className="report-profilo-list-text">
                      {boldImportantPhrases(item)}
                    </span>
                  </li>
                ))}
              </ul>
              {ombreBlocks.length === 0 && (
                <p className="report-profilo-empty">Nessuna ombra indicata.</p>
              )}
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  )
}
