import React, { useState } from 'react'

function OperatorInstitutionalStory() {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggle = () => {
    setIsExpanded((prev) => !prev)
  }

  return (
    <section className="operator-institutional-shell" aria-labelledby="operator-institutional-title">
      <header className="operator-institutional-header">
        <p className="operator-institutional-kicker">Musica come linguaggio dell&apos;identità emotiva</p>
        <h2 id="operator-institutional-title" className="operator-institutional-title">
          Perché un Test Sonoro
        </h2>
        <div className="operator-institutional-preview">
          <p>
            Questo Test usa la Musica non come intrattenimento, ma come linguaggio emotivo. I flussi sonori
            diventano una lente per osservare l&apos;area del sentire, oltre la sola sfera cognitiva.
          </p>
          <p>
            È uno <strong>strumento per l&apos;osservazione dell&apos;area del sentire</strong>: attraverso gli stimoli
            sonori si esplorano le reazioni emotive e affettive della persona, senza attribuire etichette rigide.
          </p>
        </div>
        <button
          type="button"
          className="operator-institutional-toggle"
          onClick={handleToggle}
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Chiudi il racconto completo' : 'Leggi il racconto completo'}
        </button>
      </header>

      {isExpanded && (
        <div className="operator-institutional-body">
          <div className="home-institutional-text operator-institutional-text">
            <section className="operator-institutional-section">
              <h3 className="operator-institutional-section-title">Uso umanistico della Musica</h3>
              <p>
                Questo Test è un primo concreto esempio di un uso della Musica a fini umanistici. Utilizza gli
                elementi del codice musicale come naturali strumenti suscitatori di emozioni e stati d&apos;animo, e i
                suoni di diverse famiglie di strumenti musicali come mezzi per l&apos;osservazione dell&apos;area del
                sentire individuale: l&apos;area emotiva e affettiva.
              </p>
              <p>
                La Musica viene utilizzata come linguaggio non verbale per mettere in luce come una persona si muove
                tra stati d&apos;animo diversi, offrendo una mappa dell&apos;identità emotiva più che una diagnosi.
              </p>
            </section>

            <section className="operator-institutional-section">
              <h3 className="operator-institutional-section-title">Radici filosofiche e ricerca</h3>
              <p>
                Le radici filosofiche e intellettuali di questo Test, che associa le percezioni emotive ai flussi
                musicali, sono esplicitate in termini tecnici in letteratura dedicata. La Musica è un&apos;arte
                antichissima, un linguaggio universale che qui è utilizzato in una visione che supera il consueto
                utilizzo formale creativo, espressivo, performativo, spettacolare e commerciale.
              </p>
            </section>

            <section className="operator-institutional-section">
              <h3 className="operator-institutional-section-title">Flussi musicali come rivelatori</h3>
              <p>
                I flussi musicali vengono così utilizzati come{' '}
                <strong>strumenti rivelatori di aspetti interiori che vanno oltre la sfera cognitiva</strong>: flussi di
                suono mossi da energia emotiva che, vibrando per simpatia o antipatia, entrano in contatto in modo
                diretto con la parte più sacra e privata della persona, rivelando le singole qualità temperamentali
                individuali e fornendo un quadro esaustivo della singola identità emotiva.
              </p>
            </section>

            <section className="operator-institutional-section">
              <h3 className="operator-institutional-section-title">Metodo, contesti d&apos;uso e nota di età</h3>
              <p>
                Il Test può essere eseguito e fatto decodificare da professionisti autorizzati. Nella versione
                informatica viene utilizzato un linguaggio assemblato in modo automatico ma con un uso di parole
                controllato dal comitato scientifico che rispecchia in modo corretto il rapporto tra suoni, emozioni e
                caratteristiche temperamentali.
              </p>
              <p>
                Come negli studi che hanno generato il Test, la Musica è utilizzata come{' '}
                <strong>strumento rivelatore del portato umanistico temperamentale</strong> delle persone. Il metodo
                nasce dalla sperimentazione in <strong>13 istituti di pena</strong> italiani, per ricavare preziose
                informazioni preventive sull&apos;identità emotiva.
              </p>
              <p className="home-ps">
                PS – Se ne consiglia l&apos;uso a partire dal sedicesimo anno di età.
              </p>
            </section>
          </div>
        </div>
      )}
    </section>
  )
}

export default OperatorInstitutionalStory

