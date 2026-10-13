import CalculationDisclosure from './CalculationDisclosure.jsx'
import './CompositionContentCards.css'

const PANEL_FIELDS = [
  { key: 'natura', heading: 'Natura' },
  { key: 'racconto', heading: 'Racconto' },
  { key: 'qualita', heading: 'Risorse' },
  { key: 'ombre', heading: 'Ombre' },
]

/**
 * Riga di badge compatti per la sintesi (Livello 1): solo nomi Famiglia e qualificatori
 * brevi, nessun testo lungo, nessuna formula, nessuna chiave tecnica.
 */
export function CompositionBadgeRow({ primaryFamilies = [], compactCompanion = null, className = '' }) {
  if (!primaryFamilies.length) return null
  const heading = primaryFamilies.length > 1 ? 'Famiglie principali' : 'Profilo principale'

  return (
    <div className={`composition-badges ${className}`.trim()}>
      <div className="composition-badges__group">
        <span className="composition-badges__heading">{heading}</span>
        <div className="composition-badges__chips">
          {primaryFamilies.map((item) => (
            <span
              key={item.familyKey}
              className="composition-badges__chip"
              style={item.colore ? { '--chip-accent': item.colore } : undefined}
            >
              {item.content?.nome || item.familyName}
              {item.isQuasiParitaria ? (
                <span className="composition-badges__qualifier"> · quasi paritaria</span>
              ) : null}
            </span>
          ))}
        </div>
      </div>
      {compactCompanion ? (
        <div className="composition-badges__group composition-badges__group--companion">
          <span className="composition-badges__heading">componente secondaria</span>
          <div className="composition-badges__chips">
            <span
              className="composition-badges__chip composition-badges__chip--companion"
              style={compactCompanion.colore ? { '--chip-accent': compactCompanion.colore } : undefined}
            >
              {compactCompanion.content?.nome || compactCompanion.familyName}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function FamilyCard({ card, triggerSuffix = '' }) {
  if (!card?.available || !card.content) return null
  const { content } = card
  const title = content.nome || card.familyName || ''

  return (
    <CalculationDisclosure
      className="composition-family-card"
      label={triggerSuffix ? `${title} · ${triggerSuffix}` : title}
    >
      {PANEL_FIELDS.map(({ key, heading }) => (
        Array.isArray(content[key]) && content[key].length ? (
          <div key={key} className="composition-family-card__block">
            <h5 className="composition-family-card__block-title">{heading}</h5>
            {content[key].map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="composition-family-card__paragraph">
                {paragraph}
              </p>
            ))}
          </div>
        ) : null
      ))}
    </CalculationDisclosure>
  )
}

/**
 * Elenco di schede famiglia integrali (Livello 2/3), ciascuna chiusa di default.
 * Il contenuto di ogni scheda resta quello restituito da getFamigliaApprofondimento,
 * senza fondere paragrafi tra famiglie diverse.
 */
export function CompositionFamilyCards({ cards = [], className = '' }) {
  const visible = cards.filter((card) => card?.available)
  if (!visible.length) return null

  return (
    <div className={`composition-family-cards ${className}`.trim()}>
      {visible.map((card) => (
        <FamilyCard
          key={card.familyKey}
          card={card}
          triggerSuffix={card.isQuasiParitaria ? 'quasi paritaria' : ''}
        />
      ))}
    </div>
  )
}
