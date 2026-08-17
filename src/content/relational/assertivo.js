/**
 * Relazioni dal punto di vista assertivo — derivato da Il Pianeta della Musica (FM).
 */
import { RELATION_ACCENTS, TIP_LABEL } from './shared.js'

export const SOURCE = 'derivato da Il Pianeta della Musica - FM.pdf'

export const UI = {
  pageTitle: 'L\'Assertivo nelle Relazioni',
  pageSubtitle: 'Come si relaziona una persona assertiva con gli altri temperamenti',
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
        title: 'Assertivo ↔ Malinconico',
        body: [
          'L\'assertivo agisce nel presente con decisione e chiarezza; il malinconico riflette sul passato con profondità e bisogno di senso. Il Sole e la Luna del modello: energie diverse che possono completarsi o ostacolarsi.',
          'L\'assertivo può dare struttura e protezione al malinconico; il malinconico può richiamare l\'assertivo alla sensibilità quando la volontà diventa troppo rigida.',
          'Il pericolo è che l\'assertivo interpreti la lentezza malinconica come debolezza, e il malinconico viva la forza assertiva come mancanza di cura.',
        ],
        tip: 'L\'assertivo rallenta e chiede prima di concludere. Il malinconico esprime bisogni con parole semplici, senza aspettare che l\'altro indovini.',
      },
      frizioni: {
        label: 'Le frizioni',
        title: 'Dove nascono i conflitti',
        body: [
          'L\'assertivo vuole risposte rapide; il malinconico ha bisogno di tempo. La frustrazione è reciproca e frequente.',
          'Nei conflitti, l\'assertivo alza il tono; il malinconico si chiude. Nulla viene risolto davvero.',
          'Il malinconico può accumulare risentimento per la fretta dell\'altro, finché la reazione sorprende l\'assertivo.',
        ],
        tip: 'L\'assertivo offre tempo esplicito («parliamone domani»). Il malinconico si impegna a non sparire senza spiegare.',
      },
      risorse: {
        label: 'Le risorse',
        title: 'Cosa si danno a vicenda',
        body: [
          'L\'assertivo dà direzione, coraggio e slancio verso il fare.',
          'Il malinconico restituisce profondità, ascolto e richiamo al sentire quando l\'azione si irrigidisce.',
          'La Musica malinconica può dialogare con la volitività: nel modello FM è risorsa per riequilibrare l\'eccesso di martello.',
        ],
        tip: 'Condividere un ascolto musicale può aprire dialogo dove le parole dirette si bloccano.',
      },
    },
  },
  {
    key: 'fl',
    icon: '🌊',
    name: 'Con il Flemmatico',
    sub: 'Calmo · Paziente · Contemplativo',
    accent: RELATION_ACCENTS.flemmatico,
    tabs: {
      dinamica: {
        label: 'La dinamica',
        title: 'Assertivo ↔ Flemmatico',
        body: [
          'L\'assertivo è deciso e orientato al risultato; il flemmatico è paziente e orientato alla pace. In apparenza si completano: uno guida, l\'altro sostiene.',
          'L\'assertivo apprezza la costanza del flemmatico; il flemmatico trova rassicurante la chiarezza assertiva, ma può sentirsi schiacciato.',
          'Il pericolo è una gerarchia implicita: l\'assertivo decide, il flemmatico esegue, finché la tensione cresce in silenzio.',
        ],
        tip: 'L\'assertivo invita attivamente il parere del flemmatico. Il flemmatico esprime dissenso prima di cedere per evitare conflitto.',
      },
      frizioni: {
        label: 'Le frizioni',
        title: 'Dove nascono i conflitti',
        body: [
          'L\'assertivo vuole decisioni rapide; il flemmatico elabora lentamente. Lentezza viene letta come indecisione, urgenza come pressione.',
          'Il flemmatico cede per pace, accumulando risentimento che l\'assertivo non vede.',
          'Nei conflitti aperti, l\'assertivo alza il tono; il flemmatico si chiude. Nessuno ottiene ciò di cui ha bisogno.',
        ],
        tip: 'L\'assertivo chiede «cosa ne pensi davvero?». Il flemmatico impara che il silenzio non significa consenso.',
      },
      risorse: {
        label: 'Le risorse',
        title: 'Cosa si danno a vicenda',
        body: [
          'L\'assertivo dà direzione e slancio; il flemmatico dà ascolto, smorzamento dei toni e continuità relazionale.',
          'Nella collaborazione, forza esecutiva e costanza producono risultati duraturi.',
          'Il flemmatico svolge la funzione equilibratrice descritta nel modello: smussa l\'eccesso di collera o volontà rigida.',
        ],
        tip: 'Riconoscere esplicitamente il contributo reciproco: efficacia e lealtà vanno nominate, non date per scontate.',
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
        title: 'Assertivo ↔ Entusiasta',
        body: [
          'Entrambi vivono nel movimento e nell\'azione, ma con accenti diversi: l\'assertivo nel decidere e realizzare, l\'entusiasta nello scoprire e accendersi. Possono essere alleati potenti o in competizione.',
          'L\'entusiasta porta creatività e slancio; l\'assertivo porta struttura e follow-through. Insieme possono trasformare idee in risultati.',
          'Il pericolo è la competizione per lo spazio: chi guida, chi brilla, chi decide, chi vince e chi si prende la scena.',
        ],
        tip: 'Definire ruoli espliciti in progetti condivisi. L\'entusiasta genera, l\'assertivo finalizza, o viceversa, ma con accordo chiaro.',
      },
      frizioni: {
        label: 'Le frizioni',
        title: 'Dove nascono i conflitti',
        body: [
          'L\'entusiasta cambia direzione spesso; l\'assertivo vuole coerenza e completamento. La frustrazione è alta su entrambi i lati.',
          'L\'assertivo può giudicare l\'entusiasta superficiale; l\'entusiasta può sentire l\'assertivo oppressivo.',
          'Nei conflitti, entrambi alzano l\'intensità, ma con modalità diverse: uno spinge, l\'altro sfoga.',
        ],
        tip: 'Concordare criteri di successo prima di iniziare. Rivederli quando l\'entusiasmo cambia rotta.',
      },
      risorse: {
        label: 'Le risorse',
        title: 'Cosa si danno a vicenda',
        body: [
          'Energia congiunta verso obiettivi concreti: questa coppia può essere molto produttiva.',
          'L\'entusiasta apre possibilità; l\'assertivo le rende realizzabili.',
          'La Musica entusiasta e volitiva condivisa può canalizzare l\'energia senza dispersione.',
        ],
        tip: 'Celebrare i risultati intermedi: l\'entusiasta ha bisogno di riconoscimento lungo il percorso, non solo alla fine.',
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
        title: 'Assertivo ↔ Anaffettivo',
        body: [
          'L\'assertivo spinge verso azione e coinvolgimento; l\'anaffettivo mantiene distanza e osservazione razionale. Possono collaborare bene su obiettivi concreti, meno su intimità emotiva.',
          'L\'anaffettivo offre chiarezza e obiettività; l\'assertivo offre direzione e slancio.',
          'Il pericolo è che l\'assertivo si senta freddo o non sostenuto, mentre l\'anaffettivo si senta pressato a reazioni emotive che non vuole dare.',
        ],
        tip: 'L\'assertivo chiede feedback concreto, non affettivo. L\'anaffettivo risponde meglio a domande precise che a richieste di empatia generica.',
      },
      frizioni: {
        label: 'Le frizioni',
        title: 'Dove nascono i conflitti',
        body: [
          'L\'assertivo interpreta il distacco come mancanza di impegno; l\'anaffettivo interpreta l\'urgenza come invasione.',
          'L\'assertivo può diventare collerico quando l\'anaffettivo non risponde; l\'anaffettivo si chiude ulteriormente.',
          'Entrambi possono evitare il dialogo su ciò che davvero non funziona.',
        ],
        tip: 'Separare obiettivi (su cui collaborare) da aspettative emotive (su cui negoziare). L\'assertivo riduce il tono quando chiede, non quando ordina.',
      },
      risorse: {
        label: 'Le risorse',
        title: 'Cosa si danno a vicenda',
        body: [
          'Collaborazione efficace su compiti e progetti: chiarezza anaffettiva e decisione assertiva.',
          'L\'anaffettivo aiuta l\'assertivo a non egoizzare la volontà; l\'assertivo aiuta l\'anaffettivo a passare dal distacco all\'azione.',
          'Un legame funzionale, se scelto consapevolmente, può essere solido e produttivo.',
        ],
        tip: 'Definire confini chiari: cosa ci si chiede reciprocamente e cosa no.',
      },
    },
  },
]
