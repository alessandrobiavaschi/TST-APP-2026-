/**
 * Relazioni dal punto di vista anaffettivo — fonte: Il Pianeta della Musica (FM)
 */
import { RELATION_ACCENTS, TIP_LABEL } from './shared.js'

export const SOURCE = 'derivato da Il Pianeta della Musica - FM.pdf'

export const UI = {
  pageTitle: 'L\'Anaffettivo nelle Relazioni',
  pageSubtitle: 'Come si relaziona una persona anaffettiva con gli altri temperamenti',
  tipLabel: TIP_LABEL,
  sourceNote: 'Testi derivati da Il Pianeta della Musica, adattati al formato TST.',
}

export const RELATIONS = [
  {
    key: 'ma',
    icon: '🌑',
    name: 'Con il Malinconico',
    sub: 'Profondo · Sensibile · Riflessivo',
    accent: RELATION_ACCENTS.malinconico,
    tabs: {
      dinamica: {
        label: 'La dinamica',
        title: 'Anaffettivo ↔ Malinconico',
        body: [
          'L\'anaffettivo vive nel distacco razionale e nell\'osservazione trasversale; il malinconico vive nell\'intensità emotiva e nella memoria affettiva, nell\'energia Ovest-Est della riflessione lunare. In superficie sembrano agli antipodi: uno cerca connessione profonda, l\'altro mantiene equilibrio attraverso la distanza.',
          'L\'anaffettivo trova nel malinconico una compagnia che non lo pressiona con richieste emotive immediate; il malinconico trova nell\'anaffettivo stabilità e prevedibilità. Ma col tempo il malinconico può avvertire una solitudine che l\'anaffettivo non sempre percepisce.',
          'Il rischio è consolidare un isolamento reciproco: la relazione funziona in superficie, ma non nutre il bisogno di profondità del malinconico né stimola l\'apertura dell\'anaffettivo.',
        ],
        tip: 'L\'anaffettivo impara a rispondere a richieste concrete, come «raccontami com\'è andata», con brevi segnali di presenza. Per il malinconico, una risposta chiara vale più di un silenzio che interpreta come disinteresse.',
      },
      frizioni: {
        label: 'Le frizioni',
        title: 'Dove nascono i conflitti',
        body: [
          'Il malinconico ha bisogno di sentirsi visto nella propria profondità; l\'anaffettivo non segnala appartenenza in modo riconoscibile. Il malinconico può chiedersi se conta davvero; l\'anaffettivo non capisce cosa manca.',
          'Quando il malinconico esprime un disagio, l\'anaffettivo risponde con logica o silenzio. Il malinconico si sente incompreso; l\'anaffettivo si sente messo in difficoltà da richieste che non sa come soddisfare.',
          'Entrambi evitano il confronto: il malinconico per non esporsi ulteriormente, l\'anaffettivo per non entrare in territorio emotivo. I problemi si sedimentano fino a diventare distanza abituale.',
        ],
        tip: 'L\'anaffettivo non lascia cadere nel silenzio la prima segnalazione del malinconico: una risposta breve e onesta, come «non so cosa dirti, ma ci sono», cambia la dinamica più di quanto sembri.',
      },
      risorse: {
        label: 'Le risorse',
        title: 'Cosa si danno a vicenda',
        body: [
          'L\'anaffettivo offre al malinconico stabilità, coerenza e assenza di alti e bassi che possono amplificare l\'instabilità emotiva. In momenti di eccesso introspettivo, questa calma esterna può essere un ancora.',
          'Il malinconico può aiutare l\'anaffettivo a scoprire gradualmente che la connessione non è minacciosa: attraverso piccoli gesti quotidiani, dimostra che stare vicini non significa perdere controllo.',
          'Se entrambi scelgono consapevolmente questa relazione, possono costruire qualcosa di funzionale: il malinconico porta calore e memoria affettiva, l\'anaffettivo porta chiarezza e struttura.',
        ],
        tip: 'Costruire ponti piccoli e concreti: l\'anaffettivo offre presenza attraverso gesti quotidiani prevedibili. Per il malinconico, la continuità vale più dei grandi momenti, e questo è un terreno su cui l\'anaffettivo può muoversi.',
      },
    },
  },
  {
    key: 'fl',
    icon: '🌊',
    name: 'Con il Flemmatico',
    sub: 'Calmo · Equilibrante · Presente',
    accent: RELATION_ACCENTS.flemmatico,
    tabs: {
      dinamica: {
        label: 'La dinamica',
        title: 'Anaffettivo ↔ Flemmatico',
        body: [
          'L\'anaffettivo è distante e razionale; il flemmatico è paziente e non reattivo, radicato nel continente verde della calma contemplativa. In superficie sembrano compatibili: nessuno dei due richiede grandi aperture emotive, entrambi apprezzano la quiete.',
          'L\'anaffettivo trova nel flemmatico una compagnia che non lo pressiona, non richiede risposte emotive, non alimenta conflitti. Il flemmatico non si sente sopraffatto dalla distanza dell\'anaffettivo, ma col tempo può avvertire una solitudine sottile.',
          'Il rischio è una povertà di connessione che si fa sentire nel tempo: la relazione funziona, ma non nutre. La presenza è costante, ma il contatto vero resta raro.',
        ],
        tip: 'L\'anaffettivo impara a offrire piccoli segnali di presenza esplicita (una domanda concreta, un aggiornamento breve) senza aspettarsi che il flemmatico chieda. Il flemmatico risponde meglio a richieste chiare che a inviti impliciti.',
      },
      frizioni: {
        label: 'Le frizioni',
        title: 'Dove nascono i conflitti',
        body: [
          'Il flemmatico ha bisogno di sentirsi parte di qualcosa, di percepire che la relazione esiste davvero; l\'anaffettivo non segnala questa appartenenza in modo riconoscibile. Il flemmatico può chiedersi se conta davvero per l\'altro.',
          'Entrambi evitano il conflitto diretto, ma per ragioni diverse: il flemmatico per preservare la pace, l\'anaffettivo per evitare il contatto emotivo. I problemi non vengono mai affrontati: si sedimentano in abitudini che nessuno mette in discussione.',
          'Nei rari momenti in cui il flemmatico esprime un disagio, l\'anaffettivo risponde con logica o silenzio. Il flemmatico si sente incompreso, ma non ha gli strumenti per insistere, e lascia perdere.',
        ],
        tip: 'L\'anaffettivo impara a non lasciare cadere nel silenzio le segnalazioni del flemmatico: una risposta concreta, come «ho capito, cosa posso fare?», apre uno spazio che il flemmatico raramente occupa da solo.',
      },
      risorse: {
        label: 'Le risorse',
        title: 'Cosa si danno a vicenda',
        body: [
          'L\'anaffettivo offre al flemmatico una forma paradossale di stabilità: coerenza, assenza di alti e bassi emotivi, prevedibilità. Un ambiente tranquillo dove il flemmatico si muove con sicurezza.',
          'Il flemmatico può aiutare l\'anaffettivo a scoprire che la connessione non è minacciosa: attraverso piccoli gesti quotidiani, dimostra che stare vicini non significa perdere controllo.',
          'Se entrambi scelgono consapevolmente questa relazione, possono costruire qualcosa di solido: il flemmatico porta calore e continuità, l\'anaffettivo porta chiarezza e struttura. Non è un legame visibile dall\'esterno, ma può essere profondamente funzionale.',
        ],
        tip: 'Costruire rituali piccoli e concreti: non chiedere grandi aperture emotive, ma gesti quotidiani di presenza. Per il flemmatico, la continuità vale più dei grandi momenti, e questo è un terreno su cui l\'anaffettivo può muoversi.',
      },
    },
  },
  {
    key: 'en',
    icon: '🔥',
    name: 'Con l\'Entusiasta',
    sub: 'Energico · Luminoso · Impulsivo',
    accent: RELATION_ACCENTS.entusiasta,
    tabs: {
      dinamica: {
        label: 'La dinamica',
        title: 'Anaffettivo ↔ Entusiasta',
        body: [
          'L\'anaffettivo vive nel distacco razionale; l\'entusiasta vive nel movimento, nell\'impulso e nella condivisione emotiva, orientato al futuro e alla scoperta. In apparenza sono agli antipodi: uno mantiene equilibrio attraverso la distanza, l\'altro cerca connessione e slancio.',
          'L\'anaffettivo trova nell\'entusiasta energia che il suo mondo razionale raramente genera; l\'entusiasta può essere affascinato dalla stabilità e dalla lucidità dell\'anaffettivo. Ma col tempo l\'entusiasta può avvertire una freddezza che contrasta con il proprio bisogno di condivisione.',
          'Il rischio è che l\'entusiasta si senta respinto e l\'anaffettivo si senta sopraffatto: due linguaggi emotivi che non si incontrano senza sforzo consapevole.',
        ],
        tip: 'L\'anaffettivo impara a offrire risposte brevi e concrete quando l\'entusiasta chiede, ad esempio «mi piace l\'idea, proviamo», invece del silenzio che viene letto come rifiuto. L\'entusiasta modula l\'intensità quando capisce che non si tratta di dramma, ma di scambio.',
      },
      frizioni: {
        label: 'Le frizioni',
        title: 'Dove nascono i conflitti',
        body: [
          'L\'entusiasta vuole reazione immediata e condivisione; l\'anaffettivo valuta con distacco e può sembrare indifferente. L\'entusiasta interpreta il silenzio come rifiuto; l\'anaffettivo vive l\'urgenza emotiva come invasione del proprio spazio.',
          'Quando l\'entusiasta alza il tono per ottenere risposta, l\'anaffettivo si chiude ulteriormente. L\'entusiasta si sente ignorato; l\'anaffettivo si sente sopraffatto da un\'intensità che non sa come gestire.',
          'L\'entusiasta può accumulare frustrazione senza nominarla; l\'anaffettivo non percepisce i segnali finché un\'esplosione di energia non lo sorprende.',
        ],
        tip: 'L\'anaffettivo segnala il proprio limite con chiarezza, ad esempio «ho bisogno di tempo per rispondere», invece del silenzio che alimenta frustrazione. L\'entusiasta impara a chiedere con precisione: «mi serve un tuo parere» funziona meglio dell\'attesa implicita.',
      },
      risorse: {
        label: 'Le risorse',
        title: 'Cosa si danno a vicenda',
        body: [
          'L\'anaffettivo offre all\'entusiasta lucidità e distanza critica: una valutazione che non è contaminata dall\'impulso, utile quando l\'entusiasmo rischia di travolgere il discernimento.',
          'L\'entusiasta porta all\'anaffettivo movimento, energia e capacità di scoperta: lo spinge fuori dall\'osservazione pura verso l\'esperienza vissuta, senza forzare grandi aperture emotive.',
          'Se entrambi scelgono consapevolmente questa relazione, possono costruire qualcosa di funzionale: l\'entusiasta porta slancio e creatività, l\'anaffettivo porta chiarezza e struttura.',
        ],
        tip: 'Trovare attività condivise concrete (un progetto, un\'analisi, un\'esplorazione) dove entusiasmo e razionalità si incontrano. L\'anaffettivo contribuisce con lucidità; l\'entusiasta con energia: il risultato tiene viva la collaborazione.',
      },
    },
  },
  {
    key: 'as',
    icon: '⚡',
    name: 'Con il Marziale',
    sub: 'Deciso · Diretto · Volitivo',
    accent: RELATION_ACCENTS.assertivo,
    tabs: {
      dinamica: {
        label: 'La dinamica',
        title: 'Anaffettivo ↔ Marziale',
        body: [
          'L\'anaffettivo è orientato all\'osservazione razionale e al distacco; il marziale è orientato all\'azione e al risultato, nel presente marziale della volontà. In superficie possono collaborare bene: entrambi apprezzano chiarezza, concretezza, assenza di drammi emotivi.',
          'L\'anaffettivo trova nel marziale una forza direzionale che dà struttura e movimento; il marziale trova nell\'anaffettivo un interlocutore che non reagisce d\'impulso, che valuta con lucidità, che non alimenta conflitti inutili.',
          'Il pericolo è la povertà di connessione affettiva: la relazione funziona e produce risultati, ma può restare fredda. Nessuno dei due segnala il vuoto finché non compromette la collaborazione.',
        ],
        tip: 'L\'anaffettivo impara a offrire feedback concreto quando il marziale chiede: non solo valutazione logica, ma anche «come ti sembra procedere». Il marziale modula il tono quando serve persuasione, non solo comando.',
      },
      frizioni: {
        label: 'Le frizioni',
        title: 'Dove nascono i conflitti',
        body: [
          'Il marziale vuole adesione e velocità; l\'anaffettivo valuta con distacco e può sembrare resistente. Il marziale interpreta la lentezza razionale come ostilità; l\'anaffettivo vive la pressione come invasione del proprio spazio di osservazione.',
          'Quando il marziale alza il tono, l\'anaffettivo si chiude ulteriormente: non per paura, ma per scelta di non entrare nel gioco emotivo. Il marziale si sente ignorato; l\'anaffettivo si sente sopraffatto.',
          'Entrambi evitano la vulnerabilità: il marziale attraverso la forza, l\'anaffettivo attraverso il distacco. I problemi reali restano sotto la superficie finché non compromettono la funzionalità.',
        ],
        tip: 'L\'anaffettivo segnala il disagio con dati concreti, ad esempio «questa scadenza non è realistica», invece del silenzio che il marziale legge come consenso. Il marziale impara a chiedere valutazione prima di imporre decisioni.',
      },
      risorse: {
        label: 'Le risorse',
        title: 'Cosa si danno a vicenda',
        body: [
          'L\'anaffettivo offre al marziale lucidità e distanza critica: una valutazione che non è contaminata dall\'ego o dalla collera, utile nei momenti in cui la forza rischia di diventare rigidità.',
          'Il marziale dà all\'anaffettivo direzione e slancio: trasforma l\'osservazione in azione, dà forma a ciò che l\'anaffettivo analizza ma fatica a mettere in movimento da solo.',
          'Nella collaborazione, quando i ruoli sono chiari, questa coppia è efficiente e affidabile: la forza del marziale e la lucidità dell\'anaffettivo producono risultati senza drammi inutili.',
        ],
        tip: 'Costruire momenti di verifica reciproca: concreti, non emotivi. L\'anaffettivo chiede chiarezza sugli obiettivi; il marziale chiede valutazione sui progressi. Questo linguaggio comune tiene viva la collaborazione.',
      },
    },
  },
]
