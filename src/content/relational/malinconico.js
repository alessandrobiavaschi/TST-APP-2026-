/**
 * Relazioni dal punto di vista malinconico — derivato da Il Pianeta della Musica (FM).
 * @see docs/fonti-scientifiche/Il Pianeta della Musica - FM.pdf
 */
import { RELATION_ACCENTS, TIP_LABEL } from './shared.js'

export const SOURCE = 'derivato da Il Pianeta della Musica - FM.pdf'

export const UI = {
  pageTitle: 'Il Malinconico nelle Relazioni',
  pageSubtitle: 'Come si relaziona una persona malinconica con gli altri temperamenti',
  tipLabel: TIP_LABEL,
  sourceNote: 'Testi derivati da Il Pianeta della Musica - FM.pdf, nel formato TST.',
}

export const RELATIONS = [
  {
    key: 'fl',
    icon: '🌊',
    name: 'Con il Flemmatico',
    sub: 'Calmo · Paziente · Contemplativo',
    accent: RELATION_ACCENTS.flemmatico,
    tabs: {
      dinamica: {
        label: 'La dinamica',
        title: 'Malinconico ↔ Flemmatico',
        body: [
          'Il malinconico porta profondità, riflessione e bisogno di senso; il flemmatico porta calma, ascolto e presenza non reattiva. Spesso nasce una sintonia silenziosa: entrambi tollerano il ritmo lento e l\'introspezione.',
          'Per il malinconico, il flemmatico è un porto dove non serve difendersi dall\'intensità del proprio sentire. Per il flemmatico, il malinconico apre una vita interiore ricca che tende a non esplorare da solo.',
          'Il rischio è la stasi condivisa: nessuno dei due spinge verso il movimento, e la relazione può diventare profonda ma immobile, chiusa nel proprio mondo.',
        ],
        tip: 'Il malinconico propone piccoli gesti concreti — una musica, una passeggiata — per dare ossigeno al legame. Il flemmatico risponde meglio a inviti leggeri che a richieste emotive troppo dense.',
      },
      frizioni: {
        label: 'Le frizioni',
        title: 'Dove nascono i conflitti',
        body: [
          'Il malinconico ha bisogno di essere compreso in profondità; il flemmatico ascolta ma raramente risponde con la stessa intensità. Il malinconico può sentirsi solo anche in presenza dell\'altro.',
          'Nei momenti di chiusura, il flemmatico rispetta il silenzio senza intervenire — gesto che il malinconico può leggere come abbandono o disinteresse.',
          'Entrambi evitano il conflitto diretto: le tensioni si accumulano senza essere nominate, finché diventano distanza emotiva difficile da colmare.',
        ],
        tip: 'Il malinconico chiede esplicitamente presenza («resta con me un momento») invece di aspettare che l\'altro intuisca. Il flemmatico impara che poche parole chiare valgono più di lunghe attese silenziose.',
      },
      risorse: {
        label: 'Le risorse',
        title: 'Cosa si danno a vicenda',
        body: [
          'Il flemmatico offre al malinconico uno spazio sicuro dove non serve giustificare ciò che si prova — un sollievo per chi spesso si sente «troppo».',
          'Il malinconico restituisce al flemmatico una maggiore consapevolezza emotiva: lo abitua a riconoscere sfumature che tende a lasciare sedimentare in silenzio.',
          'Insieme possono costruire legami lenti ma solidi, fondati su rituali condivisi — musica, lettura, contemplazione — che non richiedono prestazione.',
        ],
        tip: 'Creare rituali di qualità condivisa: la bellezza estetica e musicale è il linguaggio comune tra riflessione malinconica e calma flemmatica.',
      },
    },
  },
  {
    key: 'en',
    icon: '🔥',
    name: 'Con l\'Entusiasta',
    sub: 'Energico · Creativo · Impulsivo',
    accent: RELATION_ACCENTS.entusiasta,
    tabs: {
      dinamica: {
        label: 'La dinamica',
        title: 'Malinconico ↔ Entusiasta',
        body: [
          'Il malinconico vive nel riflesso interiore, orientato al passato e alla profondità; l\'entusiasta vive nel movimento, nel futuro e nell\'apertura. Sono venti opposti sulla Rosa dei venti che possono arricchirsi o scontrarsi.',
          'L\'entusiasta può tirare il malinconico fuori dal chiuso, offrendo slancio e possibilità. Il malinconico può dare all\'entusiasta profondità e senso, impedendo che l\'energia si disperda in superficie.',
          'Il pericolo è la frustrazione reciproca: il malinconico si sente travolto e non compreso, l\'entusiasta si sente frenato e respinto.',
        ],
        tip: 'Il malinconico comunica quando ha bisogno di rallentare, senza colpevolizzare. L\'entusiasta impara che il ritiro malinconico non è rifiuto personale, ma un bisogno di riposo interiore.',
      },
      frizioni: {
        label: 'Le frizioni',
        title: 'Dove nascono i conflitti',
        body: [
          'L\'entusiasta decide in fretta e vuole condivisione immediata; il malinconico elabora lentamente e ha bisogno di tempo. Il silenzio malinconico viene letto come disinteresse, l\'urgenza entusiasta come invasione.',
          'Nei conflitti, l\'entusiasta alza il tono e vuole risolvere subito; il malinconico si chiude nel proprio mondo. Nulla viene davvero risolto.',
          'Il malinconico può accumulare risentimento per la leggerezza con cui l\'altro tratta ciò che per lui ha peso — finché la reazione sorprende l\'entusiasta.',
        ],
        tip: 'Concordare tempi diversi per parlare: l\'entusiasta aspetta la risposta, il malinconico si impegna a non restare in silenzio indefinito.',
      },
      risorse: {
        label: 'Le risorse',
        title: 'Cosa si danno a vicenda',
        body: [
          'L\'entusiasta porta al malinconico movimento, curiosità e aperture verso il mondo — una breccia verso la malinconia solare descritta nel modello.',
          'Il malinconico offre all\'entusiasta profondità, autenticità e capacità di stare con ciò che non è solo gioia immediata.',
          'Nella Musica condivisa, timbri e ritmi diversi possono diventare ponte: l\'entusiasta scopre la malinconia come risorsa, il malinconico scopre l\'entusiasmo come luce.',
        ],
        tip: 'Esplorare insieme repertori che uniscono slancio e profondità — non solo musica allegra o solo musica malinconica, ma opere che tengono entrambi i poli.',
      },
    },
  },
  {
    key: 'as',
    icon: '⚡',
    name: 'Con l\'Assertivo',
    sub: 'Deciso · Diretto · Pratico',
    accent: RELATION_ACCENTS.assertivo,
    tabs: {
      dinamica: {
        label: 'La dinamica',
        title: 'Malinconico ↔ Assertivo',
        body: [
          'Il malinconico riflette, elabora, cerca senso; l\'assertivo decide, agisce, punta al risultato. Il vento da Est (volontà) incontra il vento da Ovest (malinconia): presente e passato che si misurano.',
          'L\'assertivo può dare al malinconico struttura e direzione quando il chiuso rischia di diventare paralisi. Il malinconico può richiamare l\'assertivo alla sensibilità quando il fare diventa troppo «martello».',
          'Il pericolo è che il malinconico si senta schiacciato dalla forza decisionale dell\'altro, mentre l\'assertivo interpreti la lentezza come debolezza o indecisione.',
        ],
        tip: 'Il malinconico esprime bisogni con chiarezza prima di chiudersi. L\'assertivo impara a fare pause e a chiedere «cosa stai provando?» senza voler risolvere subito.',
      },
      frizioni: {
        label: 'Le frizioni',
        title: 'Dove nascono i conflitti',
        body: [
          'L\'assertivo vuole risposte rapide; il malinconico ha bisogno di tempo e profondità. La frustrazione è frequente su entrambi i fronti.',
          'Il malinconico può cedere per evitare il conflitto, accumulando risentimento silenzioso che l\'assertivo non percepisce.',
          'Nei momenti di rabbia assertiva, il malinconico si ritira ulteriormente — e la distanza si allarga senza conciliazione.',
        ],
        tip: 'L\'assertivo riduce il tono e offre spazio temporale. Il malinconico impara a dire «ho bisogno di tempo» invece di sparire.',
      },
      risorse: {
        label: 'Le risorse',
        title: 'Cosa si danno a vicenda',
        body: [
          'L\'assertivo dà al malinconico slancio verso l\'azione e protezione nel mondo esterno.',
          'Il malinconico restituisce all\'assertivo profondità affettiva, capacità di ascolto e richiamo al sentire quando la volontà si irrigidisce.',
          'La Musica malinconica può dialogare con la volitività forte: nel modello FM è una risorsa esplicita per riequilibrare l\'eccesso di fare.',
        ],
        tip: 'Usare la musica come mediatore: un ascolto condiviso può aprire dialogo dove le parole dirette si bloccano.',
      },
    },
  },
  {
    key: 'an',
    icon: '🪨',
    name: 'Con l\'Anaffettivo',
    sub: 'Distante · Razionale · Chiuso',
    accent: RELATION_ACCENTS.anaffettivo,
    tabs: {
      dinamica: {
        label: 'La dinamica',
        title: 'Malinconico ↔ Anaffettivo',
        body: [
          'Il malinconico vive l\'intensità affettiva e il bisogno di connessione profonda; l\'anaffettivo mantiene distanza razionale e osservazione. Sembrano opposti, ma possono rispettarsi se non si pretendono lo stesso linguaggio.',
          'L\'anaffettivo offre al malinconico chiarezza e stabilità emotiva bassa — niente alti e bassi che affaticano. Il malinconico può offrire all\'anaffettivo un graduale accesso al sentire attraverso piccoli gesti.',
          'Il pericolo è che il malinconico si senta freddo o incompreso, mentre l\'anaffettivo si senta invaso da richieste emotive che non sa come sostenere.',
        ],
        tip: 'Il malinconico formula richieste concrete («raccontami una cosa della tua giornata») invece di inviti emotivi ampi. L\'anaffettivo risponde meglio a segnali chiari che a impliciti.',
      },
      frizioni: {
        label: 'Le frizioni',
        title: 'Dove nascono i conflitti',
        body: [
          'Il malinconico ha bisogno di sentirsi visto; l\'anaffettivo non segnala presenza in modo riconoscibile. Il malinconico può dubitare di contare davvero per l\'altro.',
          'L\'anaffettivo risponde con logica o silenzio ai momenti di apertura malinconica — e il malinconico si sente respinto senza capire perché.',
          'Entrambi possono evitare il confronto: il malinconico per paura del rifiuto, l\'anaffettivo per evitare il contatto emotivo.',
        ],
        tip: 'Il malinconico nomina il disagio una volta, con precisione. L\'anaffettivo, se capisce che è una segnalazione concreta e non un dramma, può rispondere.',
      },
      risorse: {
        label: 'Le risorse',
        title: 'Cosa si danno a vicenda',
        body: [
          'L\'anaffettivo offre al malinconico un ambiente prevedibile, senza turbolenze emotive che possono affaticare chi è già sensibile.',
          'Il malinconico può aiutare l\'anaffettivo a scoprire che la connessione non minaccia il controllo — attraverso continuità e gentilezza, non pressione.',
          'Insieme possono costruire un legame funzionale: profondità malinconica e chiarezza anaffettiva, se entrambi scelgono consapevolmente la relazione.',
        ],
        tip: 'Costruire ponti piccoli e quotidiani: per l\'anaffettivo funzionano meglio i gesti ripetuti che le grandi aperture.',
      },
    },
  },
]
