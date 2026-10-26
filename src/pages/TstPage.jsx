import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useUiSounds } from '../UiSoundProvider.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import '../styles/tst-page.css'

const FAQ_CATEGORIES = [
  { id: 'all', label: 'Tutte le domande', icon: '✦' },
  { id: 'metodo', label: 'Il Metodo & La Scienza', icon: '🔬' },
  { id: 'ascolto', label: "L'Esperienza di Ascolto", icon: '🎧' },
  { id: 'report', label: 'Il Report & Le 12 Nature', icon: '🧭' },
  { id: 'ambiti', label: "Ambiti di Applicazione", icon: '🌱' },
  { id: 'privacy', label: 'Privacy & Riservatezza', icon: '🔒' },
]

const TST_STATS = [
  { value: '72', label: 'Ascolti calibrati', sub: 'Frammenti brevi da ~10-15 secondi su timbro, ritmo e armonia' },
  { value: '12', label: 'Nature temperamentali', sub: 'Mappate sulle 5 grandi Famiglie Emotive (Mussida)' },
  { value: '30-45', unit: 'min', label: 'Tempo indicativo', sub: 'Ascolto meditativo in cuffia al tuo ritmo libero' },
  { value: '100%', label: 'Oggettività del suono', sub: 'Nessuna risposta giusta o sbagliata, nessuna etichetta' },
]

const SOUND_DIMENSIONS = [
  {
    name: 'Timbro',
    sub: 'La materia corporea',
    desc: 'Il colore e la firma acustica dello strumento che risuonano direttamente nella sensibilità viscerale dell\'ascoltatore.',
    icon: '〰️',
  },
  {
    name: 'Intervalli',
    sub: 'Tensione e risoluzione',
    desc: 'La distanza melodica e armonica tra due note che risveglia nostalgia, sospensione o quiete liberatoria.',
    icon: '∿',
  },
  {
    name: 'Ritmo',
    sub: 'La pulsazione vitale',
    desc: 'L\'impulso motorio e il respiro temporale che sollecitano l\'energia marziale, la prontezza o il riposo.',
    icon: '⚡',
  },
  {
    name: 'Melodia',
    sub: 'La narrazione orizzontale',
    desc: 'La linea continua in cui il sentire si dipana nello spazio e nel tempo, tessendo memoria affettiva.',
    icon: '✦',
  },
  {
    name: 'Armonia',
    sub: 'Densità delle relazioni',
    desc: 'La simultaneità di più suoni che specchia la complessità emotiva interiore e il senso di comunione.',
    icon: '✧',
  },
]

const FAQ_ITEMS = [
  {
    id: 'come-funziona',
    category: 'metodo',
    kicker: 'Fondamenti del Metodo',
    question: 'Come funziona esattamente il Test Temperamentale (TST)?',
    paragraphs: [
      'Il TST non è un questionario verbale convenzionale né un test di personalità logico-razionale: è un\'indagine psico-musicale e psicofisiologica basata sull\'ascolto consapevole di 72 brevi frammenti sonori oggettivi (di durata compresa tra 10 e 15 secondi ciascuno).',
      'A ogni passo non ti viene chiesto di valutare esteticamente il brano o indovinare gli strumenti, ma di osservare la tua risonanza istintiva immediata: se quel flusso sonoro suscita in te simpatia, antipatia o indifferenza, e quale termine tra quelli proposti esprime ciò che risuona nel tuo animo.',
    ],
    highlights: [
      '72 ascolti che attraversano le 5 dimensioni del codice musicale: timbro, intervalli, ritmo, melodia e armonia.',
      'Risposta immediata e viscerale, senza mediazione del ragionamento astratto.',
      'Elaborazione algoritmica deterministica verso le 12 Nature temperamentali e le 5 Famiglie Emotive.',
    ],
    callout: 'Non servono conoscenze musicali: il test registra la pura reazione umana spontanea al codice sonoro.',
  },
  {
    id: 'musicista',
    category: 'ascolto',
    kicker: 'Accessibilità per Tutti',
    question: 'Serve essere musicisti o avere studiato musica per fare il test?',
    paragraphs: [
      'Assolutamente no. Il TST è stato concepito per essere svolto da chiunque, indipendentemente dalla cultura musicale, dall\'età o dall\'orecchio allenato.',
      'Ciò che viene indagato non è la competenza teorica o la memoria tecnica, ma la reazione biologica e affettiva che ogni essere umano sperimenta spontaneamente di fronte alle vibrazioni sonore.',
      'I musicisti e i professionisti dell\'ascolto scopriranno una preziosa chiave di lettura del proprio gesto espressivo e dell\'intenzione artistica; chi non ha mai suonato uno strumento troverà uno specchio nitido e accessibile del proprio mondo interiore.',
    ],
    actionLink: {
      text: 'Vuoi capire meglio come ascoltare? Consulta la guida introduttiva.',
      to: '/tutorial',
    },
  },
  {
    id: 'durata',
    category: 'ascolto',
    kicker: 'Tempi & Svolgimento',
    question: 'Quanto dura il percorso e posso fare delle pause?',
    paragraphs: [
      'In media il test richiede tra i 30 e i 45 minuti. La procedura non impone alcun limite di tempo per singolo ascolto: procedi al tuo ritmo naturale, prendendoti qualche istante per riascoltare il frammento sonoro prima di confermare la risposta.',
      'Se necessario puoi fare una breve pausa tra un passaggio e l\'altro. Raccomandiamo tuttavia di svolgerlo in un\'unica sessione dedicata, per garantire la massima continuità e freschezza della percezione interiore.',
    ],
  },
  {
    id: 'cuffie-ambiente',
    category: 'ascolto',
    kicker: 'Strumentazione Consigliata',
    question: 'Quale strumentazione è necessaria? È indispensabile usare le cuffie?',
    paragraphs: [
      'Raccomandiamo fortemente l\'uso di cuffie o auricolari, anche standard. Gli altoparlanti integrati di smartphone, tablet o computer portatili tendono a tagliare le frequenze basse e medie, appiattendo la spazialità e il timbro dei singoli suoni.',
      'Scegli una stanza tranquilla, riduci le distrazioni ambientali, disattiva le notifiche sul dispositivo e regola il volume a un livello confortevole, né troppo fievole né eccessivamente alto.',
    ],
    callout: 'Le cuffie garantiscono l\'ascolto a campo ravvicinato ideale per cogliere le sfumature fisiologiche del suono.',
  },
  {
    id: 'indecisione',
    category: 'ascolto',
    kicker: 'Atteggiamento di Ascolto',
    question: 'E se non riesco a decifrare alcuni suoni o non trovo la parola perfetta?',
    paragraphs: [
      'È un\'esperienza del tutto naturale e fisiologica: il codice sonoro opera a un livello profondo, prima che il pensiero razionale formuli una spiegazione verbale.',
      'Non sforzarti di interpretare razionalmente ciò che senti. Chiediti semplicemente: "Questo suono mi attira, mi infastidisce o mi lascia neutro? Che tipo di vibrazione lascia nel mio respiro?".',
      'Se nessuna parola ti sembra esatta al 100%, seleziona quella che per istinto iniziale si avvicina di più: il primo moto emotivo è quasi sempre il più sincero.',
    ],
  },
  {
    id: 'scienza',
    category: 'metodo',
    kicker: 'Ricerca & Fondamenti',
    question: 'Qual è il fondamento scientifico e artistico del metodo Franco Mussida?',
    paragraphs: [
      'Il TST nasce da oltre trent\'anni di ricerca e pubblicazioni condotte da Franco Mussida sul rapporto tra l\'oggettività fisica del codice musicale e la dimensione affettiva della persona (tra cui le opere "La Musica Ignorata", "Le Chiavi Nascoste della Musica" e "Il Pianeta della Musica").',
      'La procedura informatica e il protocollo di decodifica sono stati sviluppati e validati in collaborazione con il comitato scientifico del progetto CO2, docenti dell\'Università degli Studi di Pavia e il CPM Music Institute di Milano.',
      'La ricerca dimostra che il codice sonoro possiede parametri universali (proporzioni intervallari, spettralità timbrica, tensioni ritmiche) capaci di risvegliare risonanze psicofisiologiche coerenti e analizzabili.',
    ],
    actionLink: {
      text: 'Scopri i partner scientifici e le certificazioni ufficiali.',
      to: '/info',
    },
  },
  {
    id: 'report-restituzione',
    category: 'report',
    kicker: 'Cosa Ricevi al Termine',
    question: 'Cosa ricevo al termine del test? Com\'è strutturato il Report?',
    paragraphs: [
      'Appena completato il 72° ascolto, il sistema elabora in tempo reale il tuo Report Emotivo interattivo, salvato nel tuo archivio personale e sempre accessibile:',
    ],
    highlights: [
      'Natura Temperamentale Prevalente: la tua identità di base tra le 12 Nature e la distribuzione percentuale tra le 5 Famiglie Emotive (Calma, Entusiasmo, Malinconia, Volontà, Razionalità).',
      'I Quattro Rapporti: la lettura interiore del rapporto con Te Stesso, con l\'Altro, con l\'Agire nel mondo e con la dimensione temporale.',
      'Portato Esperienziale: l\'equilibrio globale tra Simpatia (apertura), Antipatia (confine critico) e Indifferenza (distacco o protezione).',
      'Galassia Lessicale 3D: una rappresentazione immersiva tridimensionale della tua costellazione di stati d\'animo e sfumature affettive.',
    ],
  },
  {
    id: 'diagnosi',
    category: 'report',
    kicker: 'Natura e Limiti del Test',
    question: 'Il TST è una diagnosi medica o una valutazione clinica?',
    paragraphs: [
      'No. Il TST non è una diagnosi medica né un test psicometrico clinico. Non classifica le persone in categorie patologiche e non esprime giudizi morali o di valore.',
      'Nel modello del TST non esistono profili "buoni" o "sbagliati", né nature "migliori" di altre: ogni disposizione temperamentale custodisce risorse preziose e specifiche zone d\'ombra da integrare.',
      'È una mappa fenomenologica per accrescere la consapevolezza di sé, l\'intelligenza emotiva e la qualità delle proprie relazioni.',
    ],
    callout: 'In ambito terapeutico o di counseling, il TST agisce come coadiuvante dell\'introspezione, mai come sostituto di una valutazione clinica.',
  },
  {
    id: 'ambiti-applicazione',
    category: 'ambiti',
    kicker: 'Contesti di Utilizzo',
    question: 'In quali contesti concreti viene utilizzato il TST?',
    paragraphs: [
      'Grazie alla sua natura trasversale, il TST trova applicazione in molteplici ambiti professionali, formativi ed educativi:',
    ],
    highlights: [
      'Scuola ed Educazione: orientamento scolastico, comprensione delle inclinazioni degli studenti e supporto ai tutor nella gestione delle dinamiche di gruppo.',
      'Risorse Umane e Team Building: valorizzazione delle intelligenze affettive individuali, composizione di team bilanciati e prevenzione del sovraccarico emotivo.',
      'Counseling e Relazione d\'Aiuto: strumento di facilitazione del dialogo interiore per percorsi di crescita personale, ascolto e musicoterapia.',
      'Musicisti e Artisti: indagine della connessione intima tra il proprio temperamento e il modo di improvvisare, interpretare ed eseguire.',
    ],
  },
  {
    id: 'privacy',
    category: 'privacy',
    kicker: 'Sicurezza & Riservatezza',
    question: 'Come sono tutelati i miei dati e le risposte fornite?',
    paragraphs: [
      'La riservatezza dei tuoi dati è garantita in conformità al Regolamento Generale sulla Protezione dei Dati (GDPR - Regolamento UE 2016/679).',
      'Ogni test svolto è salvato in un archivio privato crittografato associato univocamente al tuo account. Nessun altro utente può visualizzare i tuoi punteggi né le tue risposte.',
      'I dati non vengono in alcun caso commercializzati né ceduti a terze parti per profilazione pubblicitaria. Puoi richiedere la cancellazione totale del tuo profilo e dei tuoi dati in qualunque momento.',
    ],
    actionLink: {
      text: 'Leggi l\'informativa privacy completa e i dettagli sul trattamento dei dati.',
      to: '/info#privacy',
    },
  },
  {
    id: 'costo',
    category: 'metodo',
    kicker: 'Accesso alla Piattaforma',
    question: 'Il test è a pagamento o è accessibile gratuitamente?',
    paragraphs: [
      'Il TST è accessibile direttamente tramite la presente piattaforma web. La registrazione permette di svolgere il test completo a 72 passi, ricevere il report analitico dettagliato e conservarlo nella propria area personale.',
      'Non ci sono abbonamenti nascosti o pagamenti necessari per consultare i risultati della prova standard.',
    ],
  },
]

export default function TstPage() {
  useDocumentTitle('Scopri il TST · FAQ e Metodo')
  const { playTransition, playGhostTap } = useUiSounds()

  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [openIds, setOpenIds] = useState(() => new Set(['come-funziona']))

  const toggleFaq = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        playGhostTap()
        next.delete(id)
      } else {
        playTransition()
        next.add(id)
      }
      return next
    })
  }

  const expandAll = () => {
    playTransition()
    setOpenIds(new Set(FAQ_ITEMS.map((item) => item.id)))
  }

  const collapseAll = () => {
    playGhostTap()
    setOpenIds(new Set())
  }

  const handleCategoryChange = (catId) => {
    if (activeCategory !== catId) {
      playTransition()
      setActiveCategory(catId)
    }
  }

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return FAQ_ITEMS.filter((item) => {
      const matchCategory = activeCategory === 'all' || item.category === activeCategory
      if (!matchCategory) return false

      if (!q) return true

      const inQuestion = item.question.toLowerCase().includes(q)
      const inKicker = item.kicker.toLowerCase().includes(q)
      const inParagraphs = item.paragraphs.some((p) => p.toLowerCase().includes(q))
      const inHighlights = item.highlights ? item.highlights.some((h) => h.toLowerCase().includes(q)) : false
      const inCallout = item.callout ? item.callout.toLowerCase().includes(q) : false

      return inQuestion || inKicker || inParagraphs || inHighlights || inCallout
    })
  }, [activeCategory, searchQuery])

  const categoryCounts = useMemo(() => {
    const counts = { all: FAQ_ITEMS.length }
    FAQ_ITEMS.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1
    })
    return counts
  }, [])

  return (
    <div className="page info-page tst-page-shell">
      <div className="tst-faq-container">
        {/* ── 1. Hero Card ── */}
        <header className="tst-faq-hero" aria-labelledby="tst-hero-title">
          <div className="tst-faq-hero-badge">
            <span className="tst-faq-hero-badge-dot" aria-hidden="true" />
            <span>Metodo Franco Mussida · Guida all&apos;ascolto</span>
          </div>

          <h1 id="tst-hero-title" className="tst-faq-hero-title">
            Scopri il Test Temperamentale
          </h1>

          <p className="tst-faq-hero-lead">
            Uno strumento scientifico-artistico musicale unico nel suo genere che mappa l&apos;intima architettura emotiva
            attraverso l&apos;ascolto consapevole di 72 stimoli sonori. Trova risposte rapide sul funzionamento, i fondamenti
            psicofisiologici e il significato del report.
          </p>

          <div className="tst-faq-hero-actions">
            <Link to="/nuovo-test" className="tst-hero-btn tst-hero-btn--primary">
              <span>Inizia il test adesso</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link to="/tutorial" className="tst-hero-btn tst-hero-btn--secondary">
              <span>Guarda il tutorial</span>
            </Link>
          </div>
        </header>

        {/* ── 2. Stat Highlights Grid ── */}
        <section className="tst-faq-stats-grid" aria-label="Caratteristiche principali del TST">
          {TST_STATS.map((stat, idx) => (
            <div key={idx} className="tst-stat-card">
              <div className="tst-stat-value">
                <span>{stat.value}</span>
                {stat.unit ? <span className="tst-stat-unit">{stat.unit}</span> : null}
              </div>
              <div className="tst-stat-label">{stat.label}</div>
              <div className="tst-stat-sub">{stat.sub}</div>
            </div>
          ))}
        </section>

        {/* ── 3. Pannello di Ricerca e Categorie ── */}
        <section className="tst-faq-search-panel" aria-label="Filtri e ricerca domande">
          <div className="tst-faq-search-box">
            <span className="tst-faq-search-icon" aria-hidden="true">🔍</span>
            <input
              type="text"
              className="tst-faq-search-input"
              placeholder="Cerca una domanda (es. cuffie, durata, diagnosi, privacy, scuola...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Cerca nelle domande frequenti"
            />
            {searchQuery ? (
              <button
                type="button"
                className="tst-faq-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Cancella ricerca"
              >
                ✕
              </button>
            ) : null}
          </div>

          <div className="tst-faq-categories-list" role="tablist" aria-label="Categorie FAQ">
            {FAQ_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id
              const count = categoryCounts[cat.id] || 0
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`tst-faq-cat-pill ${isActive ? 'is-active' : ''}`}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  <span aria-hidden="true">{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className="tst-faq-cat-count">{count}</span>
                </button>
              )
            })}
          </div>

          <div className="tst-faq-toolbar">
            <span className="tst-faq-toolbar-count">
              {filteredFaqs.length === FAQ_ITEMS.length
                ? `${filteredFaqs.length} domande disponibili`
                : `${filteredFaqs.length} di ${FAQ_ITEMS.length} domande trovate`}
            </span>
            <div className="tst-faq-toolbar-toggles">
              <button type="button" className="tst-faq-toggle-btn" onClick={expandAll}>
                Espandi tutte
              </button>
              <button type="button" className="tst-faq-toggle-btn" onClick={collapseAll}>
                Comprimi tutte
              </button>
            </div>
          </div>
        </section>

        {/* ── 4. Accordion FAQ ── */}
        <section className="tst-faq-section" id="faq" aria-label="Domande frequenti">
          {filteredFaqs.length === 0 ? (
            <div className="tst-faq-empty-state">
              <div className="tst-faq-empty-icon" aria-hidden="true">🔎</div>
              <h3 className="tst-faq-empty-title">Nessuna domanda trovata</h3>
              <p className="tst-faq-empty-text">
                Nessun risultato corrisponde a &quot;{searchQuery}&quot;. Prova a reimpostare la ricerca o a selezionare
                un&apos;altra categoria.
              </p>
              <button
                type="button"
                className="tst-hero-btn tst-hero-btn--secondary"
                onClick={() => {
                  setSearchQuery('')
                  setActiveCategory('all')
                }}
              >
                Reimposta filtri
              </button>
            </div>
          ) : (
            <div className="tst-faq-list">
              {filteredFaqs.map((item) => {
                const isOpen = openIds.has(item.id)
                return (
                  <article
                    key={item.id}
                    className={`tst-faq-item-card ${isOpen ? 'is-open' : ''}`}
                  >
                    <button
                      type="button"
                      className="tst-faq-trigger-btn nuovo-test-faq-trigger"
                      onClick={() => toggleFaq(item.id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${item.id}`}
                      id={`faq-btn-${item.id}`}
                    >
                      <div className="tst-faq-question-wrap">
                        <span className="tst-faq-kicker-tag">{item.kicker}</span>
                        <span className="tst-faq-question-text">{item.question}</span>
                      </div>
                      <div className="tst-faq-chevron" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </button>

                    {isOpen ? (
                      <div
                        id={`faq-panel-${item.id}`}
                        role="region"
                        aria-labelledby={`faq-btn-${item.id}`}
                        className="tst-faq-panel-content"
                      >
                        <div className="tst-faq-answer-body">
                          {item.paragraphs.map((p, pIdx) => (
                            <p key={pIdx}>{p}</p>
                          ))}

                          {item.highlights ? (
                            <ul className="tst-faq-bullet-list">
                              {item.highlights.map((hl, hlIdx) => (
                                <li key={hlIdx}>
                                  <strong>{hl.split(':')[0]}:</strong>
                                  {hl.includes(':') ? hl.substring(hl.indexOf(':') + 1) : ''}
                                </li>
                              ))}
                            </ul>
                          ) : null}

                          {item.callout ? (
                            <div className="tst-faq-callout">
                              💡 <strong>Nota chiave:</strong> {item.callout}
                            </div>
                          ) : null}

                          {item.actionLink ? (
                            <p>
                              <Link to={item.actionLink.to} className="tst-faq-inline-link">
                                {item.actionLink.text} →
                              </Link>
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* ── 5. Le 5 Dimensioni del Codice Musicale ── */}
        <section className="tst-code-section" aria-labelledby="tst-code-title">
          <div className="tst-code-header">
            <span className="tst-faq-hero-badge">Architettura Sonora</span>
            <h2 id="tst-code-title" className="tst-code-title">I 5 Elementi del Codice Musicale</h2>
            <p className="tst-code-lead">
              Il TST scompone la realtà del suono in 5 pilastri fisici e percettivi, ciascuno deputato a dialogare
              con una specifica area dell&apos;animo e della reattività umana.
            </p>
          </div>

          <div className="tst-code-grid">
            {SOUND_DIMENSIONS.map((dim, idx) => (
              <div key={idx} className="tst-code-card">
                <div className="tst-code-card-icon" aria-hidden="true">{dim.icon}</div>
                <div className="tst-code-card-name">{dim.name}</div>
                <div className="tst-code-card-sub">{dim.sub}</div>
                <div className="tst-code-card-desc">{dim.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. Call To Action Finale ── */}
        <section className="tst-faq-final-cta" aria-labelledby="tst-cta-title">
          <h2 id="tst-cta-title" className="tst-faq-final-title">
            Pronto a scoprire la tua risonanza interiore?
          </h2>
          <p className="tst-faq-final-desc">
            Mettiti comodo, indossa le cuffie e lasciati guidare da 72 frammenti sonori. Al termine riceverai la tua mappa
            temperamentale completa e personalizzata.
          </p>
          <div className="tst-faq-final-buttons">
            <Link to="/nuovo-test" className="tst-hero-btn tst-hero-btn--primary">
              <span>Inizia il test adesso (72 ascolti)</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link to="/tutorial" className="tst-hero-btn tst-hero-btn--secondary">
              <span>Tutorial di ascolto</span>
            </Link>
          </div>
          <div className="tst-faq-final-meta">
            Hai altre domande o esigenze per istituti e aziende?{' '}
            <Link to="/info" className="tst-faq-inline-link">
              Contatta il team TST
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
