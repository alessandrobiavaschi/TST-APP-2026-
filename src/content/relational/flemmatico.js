/**
 * Relazioni dal punto di vista flemmatico — fonte: flemmatico_relazioni.html
 * @see docs/fonti-scientifiche/flemmatico_relazioni.html
 */
import { RELATION_ACCENTS, TIP_LABEL } from './shared.js'

export const SOURCE = 'flemmatico_relazioni.html'

export const UI = {
  pageTitle: 'Il Flemmatico nelle Relazioni',
  pageSubtitle: 'Come si relaziona una persona flemmatica con gli altri temperamenti',
  tipLabel: TIP_LABEL,
  sourceNote: 'Testi da materiale ufficiale TST (flemmatico_relazioni.html).',
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
        title: 'Flemmatico ↔ Malinconico',
        body: [
          'Il flemmatico porta calma, costanza e un ascolto non reattivo; il malinconico porta profondità, intensità emotiva e un bisogno continuo di senso. Tra questi due nasce spesso una sintonia silenziosa e genuina.',
          'Il flemmatico offre al malinconico qualcosa di raro: una presenza che non giudica, non minimizza e non ha fretta di risolvere. Il malinconico, dal canto suo, porta al flemmatico una vita interiore ricca e una sensibilità verso le cose che tende a trascurare.',
          'Il rischio è la stasi: entrambi tendono all\'introversione e nessuno prende facilmente l\'iniziativa. La relazione può diventare profonda ma immobile, capace di riflessione ma povera di slancio.',
        ],
        tip: 'Il flemmatico impara a fare piccoli gesti di iniziativa, anche solo proporre una passeggiata, per dare ossigeno alla relazione. Il malinconico lo aiuta a farlo sentendo che la sua presenza silenziosa ha valore, non è passività.',
      },
      frizioni: {
        label: 'Le frizioni',
        title: 'Dove nascono i conflitti',
        body: [
          'Il malinconico ha bisogno di essere compreso in profondità; il flemmatico ascolta, ma raramente risponde con la stessa intensità emotiva. Il malinconico può sentirsi solo anche in presenza dell\'altro, e il flemmatico non sempre se ne accorge.',
          'Nei momenti di chiusura del malinconico, il flemmatico tende a non intervenire: rispetta il silenzio, ma questo viene vissuto come disinteresse o abbandono. Il flemmatico non capisce di aver fatto qualcosa di sbagliato.',
          'Entrambi evitano il conflitto diretto: le tensioni si accumulano senza essere nominate, finché diventano distanza emotiva difficile da colmare. Nessuno dei due rompe il ghiaccio.',
        ],
        tip: 'Il flemmatico conferma la propria presenza con parole esplicite, non solo con la vicinanza silenziosa. Per il malinconico la differenza è enorme: sapere di essere visto vale quanto essere ascoltato.',
      },
      risorse: {
        label: 'Le risorse',
        title: 'Cosa si danno a vicenda',
        body: [
          'Il flemmatico offre al malinconico un porto sicuro: uno spazio dove non serve spiegare, giustificare o ridimensionare ciò che si prova. Per un temperamento che spesso si sente \'troppo\', questo è un sollievo profondo.',
          'Il malinconico restituisce al flemmatico qualcosa di prezioso: lo abitua a riconoscere le sfumature emotive, a non lasciare che i sentimenti si sedimentino in silenzio, a curare la qualità dei legami.',
          'Insieme costruiscono relazioni lente ma solide, fondate sulla fiducia reciproca e sul rispetto dei rispettivi ritmi. Non hanno bisogno di molto rumore per stare bene insieme.',
        ],
        tip: 'Creare rituali condivisi di qualità (una cena, una lettura, una musica) che nutrano entrambi senza richiedere prestazione o energia eccessiva. La bellezza condivisa è il loro linguaggio comune.',
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
        title: 'Flemmatico ↔ Entusiasta',
        body: [
          'Il flemmatico vive nel ritmo lento, nella stabilità e nell\'ascolto; l\'entusiasta vive nel movimento, nell\'impulso e nelle possibilità. Sono due modi di abitare il mondo opposti, che si attraggono e si sfregano con la stessa forza.',
          'Il flemmatico è affascinato dall\'energia dell\'entusiasta: quella capacità di accendersi, di riempire lo spazio, di trascinare gli altri nell\'entusiasmo. L\'entusiasta trova nel flemmatico una presenza rassicurante: qualcuno che non si agita, che ascolta davvero, che non reagisce d\'impulso.',
          'Il pericolo è che la differenza di ritmo si trasformi in frustrazione reciproca: il flemmatico si sente travolto e non ascoltato, l\'entusiasta si sente frenato e ignorato.',
        ],
        tip: 'Il flemmatico dice esplicitamente quando ha bisogno di rallentare, senza aspettarsi che l\'entusiasta lo intuisca. L\'entusiasta impara che la calma del flemmatico non è indifferenza, ma un modo diverso di essere presenti.',
      },
      frizioni: {
        label: 'Le frizioni',
        title: 'Dove nascono i conflitti',
        body: [
          'L\'entusiasta decide in fretta e vuole condivisione immediata; il flemmatico elabora lentamente e ha bisogno di tempo prima di rispondere. Questa differenza di velocità genera frequenti incomprensioni: l\'entusiasta interpreta il silenzio come disinteresse, il flemmatico vive l\'urgenza come pressione.',
          'Nei momenti di conflitto, l\'entusiasta alza il tono e vuole risolvere subito; il flemmatico si chiude e aspetta che la tempesta passi. Il risultato è che nulla viene davvero risolto: l\'entusiasta si sfoga, il flemmatico sopporta.',
          'Il flemmatico può accumulare risentimenti senza nominarli, finché la reazione, rara ma decisa, sorprende l\'entusiasta, che non aveva percepito i segnali.',
        ],
        tip: 'Il flemmatico impara a segnalare prima che il disagio diventi insostenibile, anche solo con un \'ho bisogno di capire meglio\'. L\'entusiasta impara a fare pause, a chiedere e aspettare davvero la risposta.',
      },
      risorse: {
        label: 'Le risorse',
        title: 'Cosa si danno a vicenda',
        body: [
          'L\'entusiasta porta al flemmatico uno slancio che fatica a generare da solo: lo spinge a uscire dalla zona di comfort, a provare cose nuove, a non lasciare che la stabilità diventi inerzia.',
          'Il flemmatico offre all\'entusiasta qualcosa di raro nel suo mondo: una presenza che non giudica, non compete, non si stanca. Un porto dove l\'energia può depositarsi senza dover dimostrare nulla.',
          'Quando si rispettano, questa coppia è capace di grandi cose: la visione e il movimento dell\'entusiasta trovano forma e continuità grazie alla costanza e alla cura del flemmatico.',
        ],
        tip: 'Trovare un territorio neutro (un progetto, un luogo, un\'attività) dove nessuno dei due sia in vantaggio di default. Lì si incontrano come pari, senza che nessuno debba adattarsi all\'altro.',
      },
    },
  },
  {
    key: 'as',
    icon: '⚡',
    name: 'Con il Volitivo-Collerico',
    sub: 'Deciso · Diretto · Pratico',
    accent: RELATION_ACCENTS.assertivo,
    tabs: {
      dinamica: {
        label: 'La dinamica',
        title: 'Flemmatico ↔ Volitivo-Collerico',
        body: [
          'Il flemmatico è paziente, adattabile, orientato alla pace; il volitivo-collerico è deciso, diretto, orientato al risultato. In apparenza si completano: uno guida, l\'altro segue. Ma questa apparente armonia nasconde tensioni che si manifestano nel tempo.',
          'Il volitivo-collerico apprezza la capacità del flemmatico di non creare conflitti, di lavorare con costanza, di non alimentare drammi. Il flemmatico riconosce nel volitivo-collerico una chiarezza di direzione che lo rassicura, ma può anche sentirsi schiacciato dalla sua forza.',
          'Il pericolo è che la relazione si cristallizzi in una gerarchia implicita: il volitivo-collerico decide, il flemmatico esegue. Finché questo non viene nominato, la tensione cresce in silenzio.',
        ],
        tip: 'Il flemmatico esprime le proprie opinioni anche quando non gli viene chiesto, non aspetta il momento giusto, che spesso non arriva. Il volitivo-collerico impara a fare spazio attivo: non basta non interrompere, serve invitare.',
      },
      frizioni: {
        label: 'Le frizioni',
        title: 'Dove nascono i conflitti',
        body: [
          'Il volitivo-collerico vuole risposte rapide e decisioni chiare; il flemmatico ha bisogno di tempo per elaborare e non ama essere messo alle strette. Questa differenza di velocità genera spesso frustrazione: il volitivo-collerico interpreta la lentezza come indecisione, il flemmatico vive l\'urgenza come mancanza di rispetto.',
          'Il flemmatico tende a cedere per evitare il conflitto, anche quando non è d\'accordo. Nel breve periodo funziona; nel lungo costruisce un risentimento silenzioso che il volitivo-collerico non riesce a vedere, finché non esplode in modo inatteso.',
          'Nei conflitti aperti, il volitivo-collerico alza il tono e vuole risolvere sul momento; il flemmatico si chiude e aspetta che passi. Nessuno dei due ottiene quello di cui ha bisogno.',
        ],
        tip: 'Il flemmatico si allena a dire \'non sono d\'accordo\' prima di arrendersi, anche in piccole cose. Il volitivo-collerico impara che il silenzio del flemmatico non significa consenso: chiedere esplicitamente \'cosa ne pensi davvero?\' cambia la qualità della relazione.',
      },
      risorse: {
        label: 'Le risorse',
        title: 'Cosa si danno a vicenda',
        body: [
          'Il volitivo-collerico dà al flemmatico direzione e slancio: lo aiuta a tradurre la disponibilità in azione, a non restare in attesa indefinita, a fare scelte anche quando non sente certezza assoluta.',
          'Il flemmatico porta al volitivo-collerico qualcosa che raramente trova altrove: la capacità di ascoltare senza giudicare, di smorzare i toni senza perdere la sostanza, di tenere insieme le relazioni anche nei momenti di tensione.',
          'Nella collaborazione, quando i ruoli sono chiari e il rispetto è reciproco, questa coppia è solida e produttiva: la forza esecutiva del volitivo-collerico unita alla costanza e alla cura del flemmatico produce risultati duraturi.',
        ],
        tip: 'Riconoscere esplicitamente il contributo dell\'altro. Il volitivo-collerico ha bisogno di sentire che la sua efficacia è rispettata; il flemmatico ha bisogno di sentire che la sua presenza e la sua lealtà sono apprezzate, non date per scontate.',
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
        title: 'Flemmatico ↔ Anaffettivo',
        body: [
          'Il flemmatico è paziente e non reattivo; l\'anaffettivo è distante e razionale. In superficie sembrano compatibili: nessuno dei due richiede grandi aperture emotive, entrambi apprezzano la quiete. Ma questa somiglianza apparente può nascondere una povertà di connessione che si fa sentire nel tempo.',
          'Il flemmatico non si sente sopraffatto dalla distanza dell\'anaffettivo, ma col tempo può avvertire una solitudine sottile: la relazione funziona, ma non nutre. La presenza dell\'altro è costante, ma il contatto vero è raro.',
          'L\'anaffettivo trova nel flemmatico una compagnia che non lo pressiona, non richiede risposte emotive, non alimenta conflitti. Questo lo rassicura, ma rischia anche di consolidare un isolamento che nessuno dei due nomina mai.',
        ],
        tip: 'Il flemmatico impara a chiedere piccoli gesti di presenza esplicita, senza aspettarsi grandi aperture. L\'anaffettivo risponde meglio a richieste concrete (\'dimmi come è andata la tua giornata\') che a inviti emotivi generici.',
      },
      frizioni: {
        label: 'Le frizioni',
        title: 'Dove nascono i conflitti',
        body: [
          'Il flemmatico ha bisogno di sentirsi parte di qualcosa, di percepire che la relazione esiste davvero; l\'anaffettivo non segnala questa appartenenza in modo riconoscibile. Il flemmatico può chiedersi se conta davvero per l\'altro, senza trovare risposta.',
          'Entrambi evitano il conflitto diretto, ma per ragioni diverse: il flemmatico per preservare la pace, l\'anaffettivo per evitare il contatto emotivo. Il risultato è che i problemi non vengono mai affrontati: si sedimentano in abitudini che nessuno mette in discussione.',
          'Nei rari momenti in cui il flemmatico esprime un disagio, l\'anaffettivo risponde con logica o silenzio. Il flemmatico si sente incompreso, ma non ha gli strumenti per dirlo, e lascia perdere.',
        ],
        tip: 'Il flemmatico si allena a non lasciare perdere: nominare il disagio anche una sola volta cambia la dinamica. L\'anaffettivo, se capisce che non si tratta di una richiesta emotiva ma di una segnalazione concreta, riesce a rispondere.',
      },
      risorse: {
        label: 'Le risorse',
        title: 'Cosa si danno a vicenda',
        body: [
          'L\'anaffettivo offre al flemmatico una forma paradossale di stabilità: la sua coerenza, la sua assenza di alti e bassi emotivi, la sua prevedibilità creano un ambiente tranquillo dove il flemmatico si muove con sicurezza.',
          'Il flemmatico può aiutare l\'anaffettivo a scoprire gradualmente che la connessione non è minacciosa: attraverso piccoli gesti quotidiani, dimostra che stare vicini non significa perdere controllo.',
          'Se entrambi scelgono consapevolmente questa relazione, possono costruire qualcosa di solido: il flemmatico porta calore e continuità, l\'anaffettivo porta chiarezza e struttura. Non è una relazione visibile dall\'esterno, ma può essere profondamente funzionale.',
        ],
        tip: 'Costruire ponti piccoli e concreti: non chiedere grandi aperture emotive, ma piccoli gesti quotidiani di presenza. Per il flemmatico, la continuità vale più dei grandi momenti, e questo è un terreno su cui l\'anaffettivo può muoversi.',
      },
    },
  },
]
