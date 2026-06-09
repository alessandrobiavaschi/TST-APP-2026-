import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUiSounds } from '../UiSoundProvider.jsx'
import { TEST_STORY_SLIDES } from '../components/TestStorySlider.jsx'

const HOW_SLIDES = TEST_STORY_SLIDES.slice(0, 3)

function TstPage() {
  const [openFaqId, setOpenFaqId] = useState(null)
  const { playTransition, playGhostTap } = useUiSounds()

  const toggleFaq = (id) => {
    const isOpening = openFaqId !== id
    if (isOpening) {
      playTransition()
    } else {
      playGhostTap()
    }
    setOpenFaqId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="page info-page">
      <header className="page-header info-hero">
        <div className="info-hero-card section-hero-card section-hero-card--newtest">
          <h1 className="section-hero-title">Scopri il TST</h1>
          <p className="section-hero-subtitle">
            Tutto quello che può servirti prima di provare il Test.
          </p>
        </div>
      </header>

      <section className="info-section" id="faq">
        <h2 className="info-section-title">FAQ</h2>
        <p className="info-section-lead">
          Domande frequenti sul test e link per provarlo.
        </p>
        <div className="nuovo-test-faq info-page-faq">
          <div className="nuovo-test-faq-list">
            <article className={`nuovo-test-faq-item ${openFaqId === 'how' ? 'is-open' : ''}`}>
              <button
                type="button"
                className="nuovo-test-faq-trigger"
                onClick={() => toggleFaq('how')}
                aria-expanded={openFaqId === 'how'}
              >
                <span>Come funziona</span>
                <span className="nuovo-test-faq-icon" aria-hidden="true" />
              </button>
              <div className="nuovo-test-faq-panel">
                {HOW_SLIDES.map((slide) => (
                  <div key={slide.id} className="tst-info-how-slide">
                    <p className="nuovo-test-section-subtitle">{slide.kicker}</p>
                    <h3 className="info-card-subtitle">{slide.title}</h3>
                    {slide.body.map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                ))}
              </div>
            </article>

            <article className={`nuovo-test-faq-item ${openFaqId === 'tutorial' ? 'is-open' : ''}`}>
              <button
                type="button"
                className="nuovo-test-faq-trigger"
                onClick={() => toggleFaq('tutorial')}
                aria-expanded={openFaqId === 'tutorial'}
              >
                <span>Tutorial</span>
                <span className="nuovo-test-faq-icon" aria-hidden="true" />
              </button>
              <div className="nuovo-test-faq-panel">
                <p>
                  Indossa le cuffie quando puoi, scegli un ambiente tranquillo e dedicati al percorso senza
                  fretta. Durante il test segui le istruzioni a schermo: ogni passo ti guida nell&apos;ascolto e
                  nella scelta. Non serve prepararti in anticipo.
                </p>
                <p>
                  Quando sei pronto, apri la pagina{' '}
                  <Link to="/nuovo-test" className="info-contacts-links">
                    Nuovo test
                  </Link>{' '}
                  e inizia da lì.
                </p>
              </div>
            </article>

            <article className={`nuovo-test-faq-item ${openFaqId === 'clip' ? 'is-open' : ''}`}>
              <button
                type="button"
                className="nuovo-test-faq-trigger"
                onClick={() => toggleFaq('clip')}
                aria-expanded={openFaqId === 'clip'}
              >
                <span>E se non capisco alcuni file audio?</span>
                <span className="nuovo-test-faq-icon" aria-hidden="true" />
              </button>
              <div className="nuovo-test-faq-panel">
                <p>
                  Non serve &quot;capire&quot; razionalmente ogni suono. Ti chiediamo di notare come ti fa sentire e scegliere
                  l&apos;opzione che ti risuona di più, anche se non sai spiegare il perché.
                </p>
              </div>
            </article>
            <article className={`nuovo-test-faq-item ${openFaqId === 'durata' ? 'is-open' : ''}`}>
              <button
                type="button"
                className="nuovo-test-faq-trigger"
                onClick={() => toggleFaq('durata')}
                aria-expanded={openFaqId === 'durata'}
              >
                <span>Quanto dura davvero il test?</span>
                <span className="nuovo-test-faq-icon" aria-hidden="true" />
              </button>
              <div className="nuovo-test-faq-panel">
                <p>
                  Dipende dal tuo ritmo, ma in media servono tra i 30 e i 45 minuti. Puoi fare piccole pause tra uno
                  step e l&apos;altro, ma ti consigliamo di completarlo in un unico arco di tempo.
                </p>
              </div>
            </article>
            <article className={`nuovo-test-faq-item ${openFaqId === 'musicista' ? 'is-open' : ''}`}>
              <button
                type="button"
                className="nuovo-test-faq-trigger"
                onClick={() => toggleFaq('musicista')}
                aria-expanded={openFaqId === 'musicista'}
              >
                <span>Serve essere musicisti per farlo?</span>
                <span className="nuovo-test-faq-icon" aria-hidden="true" />
              </button>
              <div className="nuovo-test-faq-panel">
                <p>
                  No. Il test è pensato per chiunque: ciò che ci interessa non è la competenza tecnica, ma il tuo modo
                  spontaneo di reagire ai suoni.
                </p>
              </div>
            </article>
            <article className={`nuovo-test-faq-item ${openFaqId === 'perche-funziona' ? 'is-open' : ''}`}>
              <button
                type="button"
                className="nuovo-test-faq-trigger"
                onClick={() => toggleFaq('perche-funziona')}
                aria-expanded={openFaqId === 'perche-funziona'}
              >
                <span>Perché funziona</span>
                <span className="nuovo-test-faq-icon" aria-hidden="true" />
              </button>
              <div className="nuovo-test-faq-panel">
                <div className="tst-info-how-slide">
                  <p className="nuovo-test-section-subtitle">Ascolto guidato</p>
                  <p>
                    È fatto da 72 brevi frammenti sonori da sentire, uno alla volta, organizzati per timbro,
                    intervalli, ritmo, melodia e armonia.
                  </p>
                  <p>
                    Associa in modo istintivo i suoni alle tue sensazioni e barra le risposte che corrispondono alle
                    tue percezioni.
                  </p>
                </div>
                <div className="tst-info-how-slide">
                  <p className="nuovo-test-section-subtitle">Lettura operativa</p>
                  <p>
                    Il risultato non è una diagnosi e non è un&apos;etichetta, ma una mappa utile per comprendere il tuo
                    temperamento emotivo in modo innovativo. Il report si costruisce man mano che svolgi il test: ogni
                    risposta racconta qualcosa su di te, come ti senti in relazione a un suono, quali preferisci e
                    quali ti suonano antipatici.
                  </p>
                </div>
                <div className="tst-info-how-slide">
                  <p className="nuovo-test-section-subtitle">Uso concreto</p>
                  <p>
                    La restituzione è leggibile sia in autonomia, per approfondire la conoscenza di sé, sia in contesti
                    educativi, professionali e di supporto relazionale.
                  </p>
                </div>
              </div>
            </article>

            <article className={`nuovo-test-faq-item ${openFaqId === 'utilizzi' ? 'is-open' : ''}`}>
              <button
                type="button"
                className="nuovo-test-faq-trigger"
                onClick={() => toggleFaq('utilizzi')}
                aria-expanded={openFaqId === 'utilizzi'}
              >
                <span>In quali contesti si può usare il TST?</span>
                <span className="nuovo-test-faq-icon" aria-hidden="true" />
              </button>
              <div className="nuovo-test-faq-panel">
                <p>
                  Il TST può essere utilizzato in più contesti. In ambito <strong>educativo-scolastico</strong>, come supporto a
                  insegnanti e tutor nella composizione delle classi e nell&apos;orientamento ai
                  percorsi di studio.
                </p>
                <p>
                  In ambito <strong>sociologico</strong>, può offrire una chiave di lettura delle dinamiche
                  relazionali e delle tendenze emotive di gruppo. Nell&apos;ambito delle <strong>risorse umane</strong>, può
                  affiancare la costruzione di gruppi di lavoro e team equilibrati in base alle funzioni umanistiche e organizzative
                  aziendali.
                </p>
                <p>
                  In ambito <strong>terapeutico</strong>, è un possibile strumento coadiuvante nei percorsi
                  trattamentali o psicoterapici, a completamento di altri test clinici. In ogni caso, non sostituisce
                  una diagnosi clinica.
                </p>
              </div>
            </article>
            <article className={`nuovo-test-faq-item ${openFaqId === 'diagnosi' ? 'is-open' : ''}`}>
              <button
                type="button"
                className="nuovo-test-faq-trigger"
                onClick={() => toggleFaq('diagnosi')}
                aria-expanded={openFaqId === 'diagnosi'}
              >
                <span>Il TST è una diagnosi?</span>
                <span className="nuovo-test-faq-icon" aria-hidden="true" />
              </button>
              <div className="nuovo-test-faq-panel">
                <p>
                  No: il TST non è una diagnosi clinica. È uno strumento di
                  esplorazione del tuo funzionamento emotivo, utile per aumentare consapevolezza personale.
                </p>
              </div>
            </article>
          </div>
        </div>
        <div className="info-faq-cta">
          <p>Quando sei pronto puoi provare il test direttamente dalla pagina Nuovo Test.</p>
          <Link to="/nuovo-test" className="btn btn-primary">
            Prova il test
          </Link>
        </div>
      </section>
    </div>
  )
}

export default TstPage
