/**
 * Relazioni dal punto di vista Entusiasta/Gioioso-Sanguinico — fonte: Il Pianeta della Musica (FM)
 */
import { RELATION_ACCENTS, TIP_LABEL } from './shared.js'

export const SOURCE = 'derivato da Il Pianeta della Musica - FM.pdf'

export const UI = {
  pageTitle: 'L\'Entusiasta nelle Relazioni',
  pageSubtitle: 'Come si relaziona una persona entusiasta con gli altri temperamenti',
  tipLabel: TIP_LABEL,
  sourceNote: 'Testi derivati da Il Pianeta della Musica - FM.pdf, nel formato TST.',
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
        title: 'Entusiasta ↔ Malinconico',
        body: [
          'L\'entusiasta vive nel futuro e nel movimento, come il sole che irradia energia e scoperta; il malinconico vive nella riflessione e nella memoria, come la luna che raccoglie e trasforma la luce. Sono due poli della stessa mappa emotiva: attrazione e sfregamento convivono con intensità.',
          'L\'entusiasta è affascinato dalla profondità del malinconico: quella sensibilità, quella capacità di dare senso a ciò che si vive. Il malinconico trova nell\'entusiasta uno slancio verso il futuro che fatica a generare da solo, una luce che lo tira fuori dall\'isolamento.',
          'Il pericolo è la frustrazione reciproca: l\'entusiasta si sente frenato e non compreso nella velocità; il malinconico si sente travolto e non rispettato nella lentezza.',
        ],
        tip: 'L\'entusiasta impara a fare pause vere: chiedere e attendere la risposta senza riempire il silenzio. Il malinconico comunica i propri ritmi senza colpevolizzare: «ho bisogno di tempo» è più chiaro del ritiro che l\'entusiasta legge come rifiuto.',
      },
      frizioni: {
        label: 'Le frizioni',
        title: 'Dove nascono i conflitti',
        body: [
          'L\'entusiasta decide in fretta e vuole condivisione immediata; il malinconico elabora lentamente e ha bisogno di spazio. L\'entusiasta interpreta il silenzio come disinteresse; il malinconico vive l\'urgenza come pressione che non lascia respirare.',
          'Nei momenti di conflitto, l\'entusiasta alza il tono e cerca risoluzione rapida; il malinconico si chiude nella riflessione. Nulla viene risolto in profondità: l\'uno si sfoga, l\'altro si protegge.',
          'Il malinconico può accumulare risentimenti senza nominarli; l\'entusiasta non percepisce i segnali finché una reazione intensa non lo sorprende. L\'entusiasta si chiede cosa è successo; il malinconico si chiede perché non è stato visto prima.',
        ],
        tip: 'L\'entusiasta segnala il proprio entusiasmo senza imporlo: «mi piacerebbe condividere questo con te, quando sei pronto». Il malinconico impara a dire «sto male» prima che diventi insostenibile, anche senza avere ancora le parole giuste.',
      },
      risorse: {
        label: 'Le risorse',
        title: 'Cosa si danno a vicenda',
        body: [
          'L\'entusiasta porta al malinconico movimento, scoperta e slancio verso il futuro: lo spinge a uscire dall\'isolamento, a provare cose nuove, a non lasciare che la nostalgia diventi prigione.',
          'Il malinconico offre all\'entusiasta profondità e senso: trasforma l\'entusiasmo in memoria significativa, dà radici a ciò che altrimenti resterebbe solo movimento superficiale.',
          'Quando si rispettano, questa coppia unisce luce e profondità: la visione dell\'entusiasta trova radici nella sensibilità del malinconico; la riflessione del malinconico trova slancio nell\'energia dell\'altro.',
        ],
        tip: 'Trovare un territorio condiviso (un progetto creativo, un viaggio, una musica) dove nessuno debba rinunciare alla propria natura. L\'entusiasta porta il movimento; il malinconico porta la profondità: insieme creano qualcosa che nessuno riuscirebbe da solo.',
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
        title: 'Entusiasta ↔ Flemmatico',
        body: [
          'L\'entusiasta vive nel movimento, nell\'impulso e nelle possibilità; il flemmatico vive nel ritmo lento, nella stabilità e nell\'ascolto contemplativo. Sono due modi di abitare il mondo opposti, che si attraggono e si sfregano con la stessa forza.',
          'L\'entusiasta trova nel flemmatico una presenza rassicurante: qualcuno che non si agita, che ascolta davvero, che non reagisce d\'impulso. Il flemmatico è affascinato dall\'energia dell\'entusiasta: quella capacità di accendersi, di riempire lo spazio, di trascinare gli altri nell\'entusiasmo.',
          'Il pericolo è che la differenza di ritmo si trasformi in frustrazione reciproca: l\'entusiasta si sente frenato e ignorato; il flemmatico si sente travolto e non ascoltato.',
        ],
        tip: 'L\'entusiasta impara che la calma del flemmatico non è indifferenza, ma un modo diverso di essere presenti. Il flemmatico dice esplicitamente quando ha bisogno di rallentare. L\'entusiasta risponde meglio a una richiesta chiara che a un silenzio che interpreta come disinteresse.',
      },
      frizioni: {
        label: 'Le frizioni',
        title: 'Dove nascono i conflitti',
        body: [
          'L\'entusiasta decide in fretta e vuole condivisione immediata; il flemmatico elabora lentamente e ha bisogno di tempo. L\'entusiasta interpreta il silenzio come disinteresse; il flemmatico vive l\'urgenza come pressione.',
          'Nei momenti di conflitto, l\'entusiasta alza il tono e vuole risolvere subito; il flemmatico si chiude e aspetta che la tempesta passi. Il risultato è che nulla viene davvero risolto: l\'entusiasta si sfoga, il flemmatico sopporta.',
          'Il flemmatico può accumulare risentimenti senza nominarli, finché una reazione rara ma decisa sorprende l\'entusiasta, che non aveva percepito i segnali.',
        ],
        tip: 'L\'entusiasta impara a fare pause, a chiedere e aspettare davvero la risposta. Il flemmatico segnala il disagio prima che diventi insostenibile, anche solo con un «ho bisogno di capire meglio».',
      },
      risorse: {
        label: 'Le risorse',
        title: 'Cosa si danno a vicenda',
        body: [
          'L\'entusiasta porta al flemmatico uno slancio che fatica a generare da solo: lo spinge a uscire dalla zona di comfort, a provare cose nuove, a non lasciare che la stabilità diventi inerzia.',
          'Il flemmatico offre all\'entusiasta qualcosa di raro: una presenza che non giudica, non compete, non si stanca. Un porto dove l\'energia può depositarsi senza dover dimostrare nulla.',
          'Quando si rispettano, questa coppia è capace di grandi cose: la visione e il movimento dell\'entusiasta trovano forma e continuità grazie alla costanza e alla cura del flemmatico.',
        ],
        tip: 'Trovare un territorio neutro (un progetto, un luogo, un\'attività) dove nessuno dei due sia in vantaggio di default. Lì si incontrano come pari, senza che nessuno debba adattarsi completamente all\'altro.',
      },
    },
  },
  {
    key: 'as',
    icon: '⚡',
    name: 'Con il Volitivo-Collerico',
    sub: 'Deciso · Diretto · Volitivo',
    accent: RELATION_ACCENTS.assertivo,
    tabs: {
      dinamica: {
        label: 'La dinamica',
        title: 'Entusiasta ↔ Volitivo-Collerico',
        body: [
          'L\'entusiasta e il volitivo-collerico condividono energia e orientamento all\'azione, ma da poli diversi: l\'entusiasta è solare, creativo, orientato al futuro; il volitivo-collerico è marziale, presente, orientato al risultato. Insieme possono generare grande slancio, o competizione per chi guida.',
          'L\'entusiasta trova nel volitivo-collerico una forza direzionale che dà forma alle sue idee; il volitivo-collerico apprezza la creatività e l\'entusiasmo dell\'altro quando si traducono in risultati concreti. Ma entrambi vogliono guidare.',
          'Il pericolo è la competizione implicita: chi decide, chi ha l\'ultima parola. Senza chiarezza sui ruoli, l\'energia comune si trasforma in attrito.',
        ],
        tip: 'L\'entusiasta e il volitivo-collerico beneficiano di territori distinti: uno guida l\'esplorazione e la visione, l\'altro l\'esecuzione e la strategia. Definire chi fa cosa, anche informalmente, evita che l\'entusiasmo e la volontà si scontrino.',
      },
      frizioni: {
        label: 'Le frizioni',
        title: 'Dove nascono i conflitti',
        body: [
          'L\'entusiasta decide in fretta e segue l\'impulso; il volitivo-collerico vuole controllo e coerenza strategica. L\'entusiasta vive il controllo come soffocamento; il volitivo-collerico interpreta l\'impulsività come irresponsabilità.',
          'Nei momenti di conflitto, entrambi alzano il tono con linguaggi diversi: il volitivo-collerico vuole chiudere, l\'entusiasta vuole riaprire e riesprimere. Il risultato è stanchezza reciproca senza risoluzione.',
          'L\'ego di entrambi amplifica le frizioni: il volitivo-collerico non tollera di essere messo in discussione; l\'entusiasta non tollera di essere frenato. Piccole divergenze diventano scontri di volontà.',
        ],
        tip: 'L\'entusiasta impara a chiedere invece di imporre: un invito riceve meno resistenza di un ordine. Il volitivo-collerico impara a lasciare spazio all\'entusiasmo senza perdere la direzione: «prova, ma entro questi limiti».',
      },
      risorse: {
        label: 'Le risorse',
        title: 'Cosa si danno a vicenda',
        body: [
          'L\'entusiasta porta al volitivo-collerico visione, creatività e capacità di accendere gli altri: qualità che il volitivo-collerico fatica a generare quando è troppo concentrato sull\'esecuzione.',
          'Il volitivo-collerico offre all\'entusiasta struttura, direzione e capacità di portare a termine: trasforma l\'entusiasmo in risultati concreti, dà forma a ciò che altrimenti resterebbe solo ispirazione.',
          'Quando si rispettano, questa coppia è capace di grandi cose: la luminosità dell\'entusiasta e la forza marziale del volitivo-collerico creano movimento, scoperta e realizzazione insieme.',
        ],
        tip: 'Celebrare i successi condivisi esplicitamente. L\'entusiasta ha bisogno di riconoscimento per la creatività; il volitivo-collerico per l\'efficacia. Nominali entrambi evita che la competizione sostituisca la collaborazione.',
      },
    },
  },
  {
    key: 'an',
    icon: '🪨',
    name: 'Con l\'Anaffettivo',
    sub: 'Distante · Razionale · Osservatore',
    accent: RELATION_ACCENTS.anaffettivo,
    tabs: {
      dinamica: {
        label: 'La dinamica',
        title: 'Entusiasta ↔ Anaffettivo',
        body: [
          'L\'entusiasta vive nel movimento, nell\'impulso e nella condivisione emotiva; l\'anaffettivo vive nel distacco razionale e nell\'osservazione trasversale. In apparenza sono agli antipodi: uno cerca connessione e slancio, l\'altro mantiene equilibrio attraverso la distanza.',
          'L\'entusiasta può essere affascinato dalla stabilità dell\'anaffettivo (quella coerenza, quella lucidità), ma col tempo avverte una freddezza che contrasta con il proprio bisogno di condivisione. L\'anaffettivo trova nell\'entusiasta energia che il suo mondo razionale raramente genera.',
          'Il pericolo è che l\'entusiasta si senta respinto e l\'anaffettivo si senta sopraffatto: due linguaggi emotivi che non si incontrano senza sforzo consapevole.',
        ],
        tip: 'L\'entusiasta impara a modulare l\'intensità: richieste concrete («dimmi cosa ne pensi») funzionano meglio di inviti emotivi generici. L\'anaffettivo risponde quando capisce che non si tratta di dramma, ma di scambio utile.',
      },
      frizioni: {
        label: 'Le frizioni',
        title: 'Dove nascono i conflitti',
        body: [
          'L\'entusiasta vuole reazione immediata e condivisione; l\'anaffettivo valuta con distacco e può sembrare indifferente. L\'entusiasta interpreta il silenzio come rifiuto; l\'anaffettivo vive l\'urgenza emotiva come invasione.',
          'Quando l\'entusiasta alza il tono per ottenere risposta, l\'anaffettivo si chiude ulteriormente. L\'entusiasta si sente ignorato; l\'anaffettivo si sente sopraffatto da un\'intensità che non sa come gestire.',
          'L\'entusiasta può accumulare frustrazione senza nominarla, finché un\'esplosione di energia sorprende l\'anaffettivo, che non aveva percepito i segnali graduali.',
        ],
        tip: 'L\'entusiasta segnala il bisogno di risposta con precisione: «mi serve un tuo parere su questo», invece di aspettarsi che venga intuito. L\'anaffettivo impara che una risposta breve e concreta vale più del silenzio per entrambi.',
      },
      risorse: {
        label: 'Le risorse',
        title: 'Cosa si danno a vicenda',
        body: [
          'L\'anaffettivo offre all\'entusiasta lucidità e distanza critica: una valutazione che non è contaminata dall\'impulso, utile quando l\'entusiasmo rischia di travolgere il discernimento.',
          'L\'entusiasta porta all\'anaffettivo movimento, energia e capacità di scoperta: lo spinge fuori dall\'osservazione pura verso l\'esperienza vissuta, senza forzare grandi aperture emotive.',
          'Se entrambi scelgono consapevolmente questa relazione, possono costruire qualcosa di funzionale: l\'entusiasta porta slancio e creatività, l\'anaffettivo porta chiarezza e struttura.',
        ],
        tip: 'Trovare attività condivise concrete (un progetto, un\'analisi, un\'esplorazione) dove l\'entusiasmo e la razionalità si incontrano senza dover forzare la connessione affettiva. Il risultato parla da solo.',
      },
    },
  },
]
