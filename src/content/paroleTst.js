/**
 * Fonte unica del lessico TST — aggettivi, sostantivi, parole chiave, sostantivi
 * di sintesi e associazioni tra famiglie, trascritti dal documento
 * "PAROLE PER TST" (Franco Mussida, 29 agosto 2026).
 *
 * Questo è l'unico file del codice con liste di parole hardcoded: la Galassia,
 * il vocabolario del report e le etichette del Dizionario 2 del test derivano
 * tutte da qui, per garantire un'unica fonte di verità lessicale.
 *
 * Struttura: 5 Famiglie -> Nature. Ogni Natura è ancorata al `rawKey` usato dal
 * motore di scoring (testLogic.js, CORRENTE_KEYS).
 */

import { getNaturaByCampo } from '../config/tstSistema.js'

/** Intervallo/parametro musicale: si legge sempre dal sistema unico (config/tstSistema.js). */
function intervalloDi(rawKey) {
  return getNaturaByCampo(rawKey)?.intervallo || ''
}

export const PAROLE_TST_FONTE = 'PAROLE PER TST — Franco Mussida, 29 agosto 2026'

export const FAMIGLIE_TST = [
  {
    id: 'marziale',
    nome: 'Marziale',
    colorKey: 'rosso',
    dispositionId: 'collerico_volitiva',
    nature: [
      {
        rawKey: 'ROSSO_1_Assertivita',
        nome: 'Natura Volitiva',
        intervallo: intervalloDi('ROSSO_1_Assertivita'),
        aggettivi: [
          'Ambizioso', 'Assertivo', 'Autoritario', 'Battagliero', 'Calcolatore', 'Caparbio', 'Certo',
          'Combattivo', 'Decisionista', 'Dominante', 'Esuberante', 'Fattivo', 'Fermo', 'Fiero', 'Focoso',
          'Franco', 'Impaziente', 'Indubitabile', 'Intraprendente', 'Irritabile', 'Orgoglioso', 'Passionale',
          'Perseverante', 'Risoluto', 'Saggio', 'Saldo', 'Schietto', 'Sicuro', 'Sincero', 'Stabile',
          'Volitivo', 'Vulcanico',
        ],
        sostantivi: [
          'Ambizione', 'Assertività', 'Autorità', 'Calcolo', 'Caparbietà', 'Certezza', 'Combattività',
          'Decisionismo', 'Dominanza', 'Esuberanza', 'Operosità', 'Fermezza', 'Fierezza', 'Focosità',
          'Franchezza', 'Impazienza', 'Indubitabilità', 'Intraprendenza', 'Irritabilità', 'Orgoglio',
          'Passione', 'Perseveranza', 'Risolutezza', 'Saggezza', 'Saldezza', 'Schiettezza', 'Sicurezza', 'Sincerità',
          'Stabilità', 'Volizione', 'Vulcanicità',
        ],
        paroleChiave: [
          { parola: 'Assertivo', nota: 'si impone senza esitazioni' },
          { parola: 'Risoluto', nota: 'decide e non torna indietro' },
          { parola: 'Ambizioso', nota: 'proiettato verso obiettivi, verso la conquista' },
          { parola: 'Perseverante', nota: 'costanza nel perseguire il fine' },
          { parola: 'Decisionista', nota: 'tendenza a prendere decisioni rapide e nette' },
        ],
        sostantiviSintesi: [
          'Operosità', 'Impulso all’azione', 'Decisione', 'Perseveranza', 'Determinazione', 'Coraggio',
          'Impulsività', 'Propensione al comando', 'Combattività', 'Forza di volontà',
        ],
        associazioni: {
          malinconica: ['Caparbio', 'Fiero', 'Irritabile', 'Orgoglioso', 'Schietto', 'Sincero'],
          flemmatica: ['Fermo', 'Perseverante', 'Saggio', 'Saldo', 'Sicuro', 'Stabile'],
          entusiasta: [
            'Avventuroso', 'Impaziente', 'Esuberante', 'Focoso', 'Franco', 'Impetuoso', 'Impulsivo',
            'Intraprendente', 'Passionale', 'Vulcanico',
          ],
          razionale: [
            'Ambizioso', 'Assertivo', 'Audace', 'Autoritario', 'Battagliero', 'Calcolatore', 'Certo',
            'Combattivo', 'Decisionista', 'Dominante', 'Fattivo', 'Indubitabile', 'Risoluto', 'Volitivo',
          ],
        },
      },
      {
        rawKey: 'ROSSO_2_Dubbio_Collera',
        nome: 'Natura Collerica',
        intervallo: intervalloDi('ROSSO_2_Dubbio_Collera'),
        // Set di default (polo negativo): usato per chip/vocabolario, coerente con l'uso storico della corrente.
        aggettivi: [
          'Ambiguo', 'Diffidente', 'Dubbioso', 'Elusivo', 'Enigmatico', 'Equivoco', 'Esitante', 'Furioso',
          'Incerto', 'Indeciso', 'Inquieto', 'Irato', 'Iracondo', 'Irrisoluto', 'Misterioso', 'Nevrotico',
          'Precario', 'Rabbioso', 'Rancoroso', 'Sospettoso', 'Subdolo', 'Travagliato', 'Tribolato',
        ],
        sostantivi: [
          'Ambiguità', 'Diffidenza', 'Dubbio', 'Elusività', 'Enigma', 'Equivoco', 'Esitazione', 'Furia',
          'Incertezza', 'Indecisione', 'Inquietudine', 'Ira', 'Iracondia', 'Irresolutezza', 'Mistero',
          'Nevrosi', 'Precarietà', 'Rabbia', 'Rancore', 'Sospetto', 'Subdolità', 'Travaglio', 'Tribolazione',
        ],
        paroleChiave: [
          { parola: 'Furioso', nota: 'massima intensità, esplosione incontrollata' },
          { parola: 'Rabbioso', nota: 'rabbia acuta, quasi fisica, aggressiva' },
          { parola: 'Irato', nota: 'collera manifesta, stato d’animo attivo e diretto' },
          { parola: 'Iracondo', nota: 'tratto caratteriale stabile, predisposizione cronica all’ira' },
          { parola: 'Rancoroso', nota: 'collera trattenuta, covata nel tempo, meno esplosiva ma più radicata' },
        ],
        sostantiviSintesi: [
          'Dubbiosità', 'Incertezza', 'Esitazione', 'Ambiguità', 'Precarietà', 'Rabbia', 'Inquietudine',
        ],
        poloPositivo: {
          aggettivi: [
            'Epico', 'Eroico', 'Glorioso', 'Leggendario', 'Titanico', 'Grandioso', 'Trionfale', 'Maestoso',
            'Invincibile', 'Indomito', 'Valoroso', 'Prodigioso', 'Mitico', 'Fatale', 'Impavido', 'Immortale',
            'Solenne', 'Fulgido', 'Temerario', 'Straordinario', 'Colossale', 'Monumentale', 'Vittorioso',
            'Imponente',
          ],
          sostantivi: [
            'Epopea', 'Gesta', 'Impresa', 'Gloria', 'Leggenda', 'Mito', 'Eroismo', 'Trionfo', 'Grandezza',
            'Destino', 'Valore', 'Coraggio', 'Sfida', 'Conquista', 'Onore', 'Prodezza', 'Saga', 'Battaglia',
            'Vittoria', 'Ardimento', 'Maestosità', 'Titano',
          ],
          paroleChiave: [
            { parola: 'Valoroso' }, { parola: 'Prodigioso' }, { parola: 'Indomito' },
            { parola: 'Vittorioso' }, { parola: 'Eroico' },
          ],
          sostantiviSintesi: ['Coraggio', 'Impresa', 'Prodezza', 'Valore', 'Sfida', 'Conquista', 'Ardimento'],
        },
        associazioni: {
          malinconica: ['Diffidente', 'Sospettoso', 'Travagliato', 'Tribolato'],
          flemmatica: ['Incerto', 'Indeciso', 'Irrisoluto', 'Esitante', 'Dubbioso', 'Perplesso', 'Oscillante', 'Precario'],
          entusiasta: ['Inquieto', 'Nevrotico'],
          razionale: ['Ambiguo', 'Criptico', 'Elusivo', 'Enigmatico', 'Equivoco', 'Infido', 'Subdolo', 'Misterioso'],
        },
      },
    ],
  },
  {
    id: 'malinconica',
    nome: 'Malinconica',
    colorKey: 'blu',
    dispositionId: 'malinconica_nostalgica',
    nature: [
      {
        rawKey: 'BLU_1_Depressiva',
        nome: 'Natura Lunare — Depressiva',
        intervallo: intervalloDi('BLU_1_Depressiva'),
        aggettivi: [
          'Angosciato', 'Avvilito', 'Cupo', 'Chiuso', 'Depresso', 'Desolato', 'Fosco', 'Impotente', 'Nero',
          'Negativo', 'Nostalgico', 'Ombroso', 'Pauroso', 'Rimuginante', 'Scombussolato', 'Sconfortato',
          'Scosso', 'Sgomento', 'Scoraggiato', 'Sofferente', 'Struggente', 'Straziato', 'Svuotato',
          'Terrorizzato', 'Tormentato',
        ],
        sostantivi: [
          'Angoscia', 'Avvilimento', 'Cupezza', 'Chiusura', 'Depressione', 'Desolazione', 'Foschezza',
          'Impotenza', 'Nerezza', 'Negatività', 'Nostalgia', 'Ombrosità', 'Paura', 'Rimuginio',
          'Scombussolamento', 'Sconforto', 'Scossa', 'Sgomento', 'Scoraggiamento', 'Sofferenza',
          'Struggimento', 'Strazio', 'Svuotamento', 'Terrore', 'Tormento',
        ],
        paroleChiave: [
          { parola: 'Nero / Negativo', nota: 'lettura negativa di ogni aspetto del reale' },
          { parola: 'Impotente', nota: 'sentirsi senza idee, senza volontà, senza capacità di resistere o di attaccare' },
          { parola: 'Chiuso', nota: 'l’impenetrabilità a ogni sentimento' },
          { parola: 'Avvilito', nota: 'il peso della disistima che arriva da presunte sconfitte' },
          { parola: 'Svuotato', nota: 'un sentire privo di energia, senza alcuna reattività' },
        ],
        sostantiviSintesi: [
          'Sofferenza', 'Avvilimento', 'Cupezza', 'Chiusura', 'Depressione', 'Desolazione', 'Impotenza',
          'Sconforto', 'Svuotamento', 'Tormento',
        ],
        associazioni: {
          marziale: ['Angosciato', 'Ombroso', 'Pauroso', 'Scombussolato', 'Scosso', 'Sgomento', 'Straziato', 'Terrorizzato', 'Tormentato'],
          flemmatica: ['Chiuso', 'Impotente', 'Scoraggiato', 'Svuotato', 'Fosco'],
          entusiasta: ['Avvilito', 'Struggente', 'Sconfortato'],
        },
      },
      {
        rawKey: 'BLU_2_Lunare',
        nome: 'Natura Lunare — Introspettiva',
        intervallo: intervalloDi('BLU_2_Lunare'),
        aggettivi: [
          'Amareggiato', 'Ansioso', 'Assorto', 'Deluso', 'Demotivato', 'Disilluso', 'Introverso',
          'Introspettivo', 'Lunatico', 'Malinconico', 'Mesto', 'Ombroso', 'Pensieroso', 'Pessimista',
          'Rassegnato', 'Riservato', 'Sconfortato', 'Solitario', 'Taciturno', 'Timido', 'Schivo', 'Triste',
          'Turbato',
        ],
        sostantivi: [
          'Amarezza', 'Ansia', 'Assorbimento', 'Delusione', 'Demotivazione', 'Disillusione', 'Introversione',
          'Introspezione', 'Lunaticità', 'Malinconia', 'Mestizia', 'Ombrosità', 'Pensosità', 'Pessimismo',
          'Rassegnazione', 'Riservatezza', 'Sconforto', 'Solitudine', 'Taciturnità', 'Timidezza', 'Schivezza',
          'Tristezza', 'Turbamento',
        ],
        paroleChiave: [
          { parola: 'Solitario', nota: 'tendenza al ritiro, percezione di isolamento, dolce piacere della solitudine' },
          { parola: 'Introspettivo', nota: 'il tratto centrale: guarda dentro, non fuori' },
          { parola: 'Triste', nota: 'leggera percezione di dolore, un dispiacere emotivo elaborato in solitudine' },
          { parola: 'Pessimista', nota: 'lettura negativa anticipata degli eventi' },
          { parola: 'Timido', nota: 'il timore del confronto' },
        ],
        sostantiviSintesi: [
          'Profondità', 'Sensibilità emotiva', 'Introspettività', 'Pensierosità', 'Malinconicità', 'Timidezza',
          'Idealismo', 'Riflessività', 'Lunaticità', 'Riservatezza',
        ],
        associazioni: {
          marziale: ['Ansioso', 'Ombroso', 'Turbato'],
          flemmatica: ['Demotivato', 'Introverso', 'Rassegnato', 'Riservato', 'Solitario', 'Taciturno', 'Timido', 'Schivo'],
          entusiasta: ['Lunatico'],
        },
      },
      {
        rawKey: 'BLU_4_Solare',
        nome: 'Natura Solare',
        intervallo: intervalloDi('BLU_4_Solare'),
        aggettivi: [
          'Accogliente', 'Aperto', 'Armonioso', 'Amorevole', 'Ammirato', 'Benevolo', 'Chiaro', 'Confidente',
          'Confortato', 'Consolato', 'Contento', 'Delicato', 'Disteso', 'Devoto', 'Deferente', 'Fervente',
          'Fiducioso', 'Gentile', 'Grato', 'Lieto', 'Mansueto', 'Mite', 'Ottimista', 'Pacato', 'Positivo',
          'Premuroso', 'Quieto', 'Raccolto', 'Radioso pacato', 'Rasserenato', 'Riflessivo', 'Rinfrancato',
          'Sereno', 'Speranzoso', 'Tenero',
        ],
        sostantivi: [
          'Accoglienza', 'Apertura', 'Armonia', 'Amorevolezza', 'Ammirazione', 'Benevolenza', 'Chiarezza',
          'Confidenza', 'Conforto', 'Consolazione', 'Contentezza', 'Delicatezza', 'Distensione', 'Devozione',
          'Deferenza', 'Fervore', 'Fiducia', 'Gentilezza', 'Gratitudine', 'Letizia', 'Mansuetudine', 'Mitezza',
          'Ottimismo', 'Pacatezza', 'Positività', 'Premura', 'Quiete', 'Raccoglimento', 'Radiosità pacata',
          'Rasserenamento', 'Riflessione', 'Rinfrancamento', 'Serenità', 'Speranza', 'Tenerezza',
        ],
        paroleChiave: [
          { parola: 'Mite', nota: 'dolcezza, assenza di asprezza o urto' },
          { parola: 'Ottimista', nota: 'uno stato d’animo ampio e generalista, che restituisce a tutto un sorriso lieve' },
          { parola: 'Fiducioso', nota: 'la base su cui poggia la speranza, non ingenua ma vissuta' },
          { parola: 'Consolato', nota: 'la ferita malinconica è integrata, non negata ma pacificata' },
        ],
        sostantiviSintesi: [
          'Accoglienza', 'Apertura', 'Armoniosità', 'Amorevolezza', 'Benevolenza', 'Fiducia', 'Gratitudine',
          'Ottimismo', 'Serenità', 'Speranza',
        ],
        associazioni: {
          marziale: ['Confidente', 'Fervente', 'Rinfrancato'],
          flemmatica: ['Armonioso', 'Confortato', 'Consolato', 'Delicato', 'Deferente', 'Disteso', 'Gentile', 'Mansueto', 'Mite', 'Pacato', 'Quieto', 'Rasserenato', 'Sereno'],
          entusiasta: ['Accogliente', 'Aperto', 'Ammirato', 'Amorevole', 'Benevolo', 'Contento', 'Fiducioso', 'Grato', 'Lieto', 'Ottimista', 'Positivo', 'Premuroso', 'Radioso pacato', 'Speranzoso', 'Tenero'],
          malinconicaIntrospettiva: ['Chiaro', 'Devoto', 'Raccolto', 'Riflessivo'],
        },
      },
      {
        rawKey: 'BLU_3_Nostalgia',
        nome: 'Natura Nostalgica',
        intervallo: intervalloDi('BLU_3_Nostalgia'),
        aggettivi: [
          'Abbandonato', 'Afflitto', 'Amareggiato', 'Assente', 'Congedato', 'Deluso', 'Desolato', 'Disperato',
          'Dissolto', 'Distante', 'Esiliato', 'Evocativo', 'Inconsolabile', 'Isolato', 'Mortificato',
          'Nostalgico', 'Orfano', 'Perso', 'Rammaricato', 'Remoto', 'Rimembrante', 'Rimpiangente',
          'Sconsolato', 'Smarrito', 'Sospeso', 'Sperduto', 'Sradicato', 'Struggente', 'Svanito', 'Vuoto',
        ],
        sostantivi: [
          'Abbandono', 'Afflizione', 'Amarezza', 'Assenza', 'Congedo', 'Delusione', 'Desolazione',
          'Disperazione', 'Dissoluzione', 'Distanza', 'Esilio', 'Evocazione', 'Inconsolabilità', 'Isolamento',
          'Mortificazione', 'Nostalgia', 'Orfanità', 'Perdita', 'Rammarico', 'Remotezza', 'Rimembranza',
          'Rimpianto', 'Sconsolazione', 'Smarrimento', 'Sospensione', 'Sperdimento', 'Sradicamento',
          'Struggimento', 'Svanimento', 'Vuoto',
        ],
        paroleChiave: [
          { parola: 'Evocativo', nota: 'la presenza che riaffiora tramite immagini e memoria' },
          { parola: 'Rimpiangente', nota: 'il rimpianto per ciò che si è perso' },
          { parola: 'Desolato', nota: 'il vuoto lasciato da ciò che manca' },
          { parola: 'Perso', nota: 'privo di riferimenti, una foglia al vento' },
          { parola: 'Abbandonato', nota: 'il senso di essere stati lasciati, non solo di aver perso' },
        ],
        sostantiviSintesi: [
          'Abbandono', 'Afflizione', 'Vivere nel ricordo', 'Rimpianto', 'Sconsolazione', 'Smarrimento',
          'Isolamento', 'Desolazione', 'Struggimento', 'Saudade',
        ],
        associazioni: {
          marziale: ['Abbandonato', 'Disperato', 'Mortificato', 'Smarrito', 'Sradicato'],
          flemmatica: ['Assente', 'Congedato', 'Distante', 'Dissolto', 'Isolato', 'Perso', 'Remoto', 'Sospeso', 'Sperduto', 'Svanito', 'Vuoto'],
          entusiasta: ['Afflitto', 'Inconsolabile'],
        },
      },
    ],
  },
  {
    id: 'flemmatica',
    nome: 'Flemmatica',
    colorKey: 'verde',
    dispositionId: 'flemmatica',
    nature: [
      {
        rawKey: 'VERDE_1_CalmaContemplativa',
        nome: 'Natura — Calma Contemplativa',
        intervallo: intervalloDi('VERDE_1_CalmaContemplativa'),
        aggettivi: [
          'Ammirato', 'Ascetico', 'Beato', 'Contemplativo', 'Devoto', 'Estatico', 'Fatalista', 'Meditativo',
          'Olimpico', 'Pacato', 'Meravigliato', 'Mistico', 'Serafico', 'Sognante', 'Trascendente', 'Visionario',
        ],
        sostantivi: [
          'Ammirazione', 'Contemplazione', 'Devozione', 'Distacco', 'Fatalismo', 'Meditazione', 'Misticismo',
          'Neutralità', 'Serafismo', 'Sogno (Sognanza)', 'Visionarietà',
        ],
        paroleChiave: [
          { parola: 'Ascetico' }, { parola: 'Ammirato' }, { parola: 'Estatico' }, { parola: 'Sognante' },
          { parola: 'Meravigliato' },
        ],
        sostantiviSintesi: [
          'Meditazione', 'Ammirazione', 'Misticismo', 'Visionarietà', 'Sogno', 'Devozione', 'Estasi',
          'Illuminazione', 'Trascendenza', 'Ascesi',
        ],
        associazioni: {},
      },
      {
        rawKey: 'VERDE_2_CalmaFisica',
        nome: 'Natura — Calma Fisica',
        intervallo: intervalloDi('VERDE_2_CalmaFisica'),
        aggettivi: [
          'Apatico', 'Calmo', 'Bonario', 'Indolente', 'Inerte', 'Lento', 'Ozioso', 'Meticoloso', 'Metodico',
          'Pacifico', 'Paziente', 'Pigro', 'Placido', 'Quieto', 'Rilassato', 'Rimandatario', 'Ripetitivo',
          'Procrastinatore', 'Prudente', 'Sedentario', 'Sospeso', 'Statico', 'Svogliato', 'Tranquillo',
          'Torpido', 'Letargico', 'Fiacco', 'Molle', 'Accidioso', 'Sonnacchioso',
        ],
        sostantivi: [
          'Accidiosità', 'Calma', 'Indolenza', 'Bonarietà', 'Fiacchezza', 'Inerzia', 'Lentezza', 'Oziosità',
          'Pacificità', 'Pazienza', 'Pigrizia', 'Prudenza', 'Placidità', 'Quiete', 'Rilassamento',
          'Procrastinazione', 'Ripetitività', 'Sedentarietà', 'Sonnolenza', 'Sospensione', 'Staticità',
          'Svogliatezza', 'Tranquillità',
        ],
        paroleChiave: [
          { parola: 'Calmo', nota: 'la tonalità di fondo, senza increspature' },
          { parola: 'Prudente', nota: 'cautela nell’agire, valutazione prima del movimento' },
          { parola: 'Meticoloso', nota: 'attenzione minuziosa, senza l’urgenza di intervenire' },
          { parola: 'Lento', nota: 'fa le cose con calma, senza fretta' },
          { parola: 'Pigro', nota: 'riluttante a mettere in moto l’energia del fare, preferendo il riposo' },
        ],
        sostantiviSintesi: [
          'Indolenza', 'Ripetitività', 'Pacatezza', 'Contemplatività', 'Abitudinarietà', 'Lentezza',
          'Tranquillità', 'Oziosità', 'Prudenza', 'Metodicità',
        ],
        associazioni: {
          marziale: ['Paziente', 'Prudente', 'Meticoloso', 'Metodico'],
          malinconica: ['Apatico', 'Indolente', 'Inerte', 'Lento', 'Ozioso', 'Pigro', 'Rimandatario', 'Ripetitivo', 'Procrastinatore', 'Sedentario', 'Sospeso', 'Statico', 'Svogliato', 'Torpido', 'Letargico', 'Fiacco', 'Molle', 'Accidioso', 'Sonnacchioso'],
          entusiasta: ['Calmo', 'Bonario', 'Pacifico', 'Placido', 'Quieto', 'Rilassato', 'Tranquillo'],
        },
      },
    ],
  },
  {
    id: 'entusiasta',
    nome: 'Entusiasta',
    colorKey: 'giallo',
    dispositionId: 'entusiasmo',
    nature: [
      {
        rawKey: 'GIALLO_1_Gioia_Entusiasmo',
        nome: 'Natura Gioiosa — Solare',
        intervallo: intervalloDi('GIALLO_1_Gioia_Entusiasmo'),
        aggettivi: [
          'Allegro', 'Dinamico', 'Brioso', 'Caloroso', 'Effervescente', 'Espansivo', 'Euforico', 'Felice',
          'Frizzante', 'Giocoso', 'Gioioso', 'Socievole', 'Spensierato', 'Trascinante', 'Vivace', 'Ammirato',
          'Compassionevole', 'Radioso', 'Solare', 'Luminoso', 'Festoso', 'Ridente', 'Scherzoso', 'Simpatico',
          'Affettuoso', 'Cordiale', 'Ilare', 'Buffo', 'Zampillante',
        ],
        sostantivi: [
          'Allegria', 'Dinamicità', 'Brio', 'Calore', 'Effervescenza', 'Espansività', 'Euforia', 'Felicità',
          'Frizzantezza', 'Giocosità', 'Gioia', 'Socievolezza', 'Spensieratezza', 'Trascinamento', 'Vivacità',
          'Ammirazione', 'Compassione', 'Radiosità', 'Solarità', 'Luminosità', 'Festosità', 'Ilarità',
          'Scherzosità', 'Simpatia', 'Affetto', 'Cordialità', 'Buffoneria', 'Zampillio',
        ],
        paroleChiave: [
          { parola: 'Vivace' }, { parola: 'Solare' }, { parola: 'Simpatico' }, { parola: 'Allegro' },
          { parola: 'Socievole' },
        ],
        sostantiviSintesi: [
          'Calorosità', 'Vivacità', 'Radiosità', 'Spensieratezza', 'Socievolezza', 'Dinamicità', 'Allegria',
          'Luminosità', 'Festosità', 'Felicità',
        ],
        associazioni: {
          marziale: ['Trionfante', 'Fervente', 'Fulgido', 'Impavido', 'Combattivo'],
          malinconica: ['Nostalgico', 'Devoto', 'Struggente', 'Rassegnato', 'Riservato'],
          flemmatica: ['Sereno', 'Mite', 'Placido', 'Quieto', 'Pacato'],
        },
      },
      {
        rawKey: 'GIALLO_2_Volitivo_Passionale',
        nome: 'Natura Sanguigna — Operosa',
        intervallo: intervalloDi('GIALLO_2_Volitivo_Passionale'),
        aggettivi: [
          'Ardente', 'Comunicativo', 'Coraggioso', 'Curioso', 'Entusiasta', 'Esaltato', 'Esuberante', 'Fluido',
          'Impavido', 'Impaziente', 'Innamorato', 'Intraprendente', 'Intrepido', 'Irrefrenabile', 'Infuocato',
          'Mutevole', 'Passionale', 'Reattivo', 'Spontaneo', 'Versatile', 'Vitale', 'Brillante', 'Vivo',
          'Estroverso', 'Aperto', 'Ricco d’iniziativa', 'Instancabile', 'Propositivo', 'Esplosivo',
        ],
        sostantivi: [
          'Ardore', 'Comunicativa', 'Coraggio', 'Curiosità', 'Decisionismo', 'Dinamismo', 'Entusiasmo',
          'Esaltazione', 'Esuberanza', 'Fluidità', 'Impavidità', 'Impazienza', 'Innamoramento', 'Intraprendenza',
          'Intrepidezza', 'Irrefrenabilità', 'Foga', 'Mutevolezza', 'Passione', 'Reattività', 'Spontaneità',
          'Versatilità', 'Vitalità', 'Brillantezza', 'Vivezza', 'Estroversione', 'Apertura', 'Iniziativa',
          'Instancabilità', 'Propositività', 'Esplosività',
        ],
        paroleChiave: [
          { parola: 'Coraggioso' }, { parola: 'Curioso' }, { parola: 'Ardente' }, { parola: 'Dinamico' },
          { parola: 'Passionale' },
        ],
        sostantiviSintesi: [
          'Intraprendenza', 'Vitalità', 'Ardore', 'Spontaneità', 'Coraggio', 'Passione', 'Iniziativa',
          'Instancabilità', 'Esplosività', 'Entusiasmo',
        ],
        associazioni: {
          marziale: ['Coraggioso', 'Determinato', 'Audace', 'Focoso', 'Impetuoso', 'Intraprendente', 'Temerario', 'Ardente'],
          malinconica: ['Idealista', 'Visionario', 'Passionale', 'Inquieto', 'Fatalista'],
          flemmatica: ['Fiducioso', 'Metodico', 'Fervente pacato', 'Costante', 'Saldo'],
        },
      },
    ],
  },
  {
    id: 'razionale',
    nome: 'Razionale',
    colorKey: 'grigio',
    dispositionId: 'agnostica_anaffettiva',
    nature: [
      {
        rawKey: 'GRIGIO_1_Anaffettiva',
        nome: 'Natura Anaffettiva',
        intervallo: intervalloDi('GRIGIO_1_Anaffettiva'),
        aggettivi: [
          'Algido', 'Anaffettivo', 'Analitico', 'Autocontrollato', 'Calcolatore', 'Contenuto', 'Disincantato',
          'Distaccato', 'Distante', 'Ermetico', 'Freddo', 'Glaciale', 'Impassibile', 'Impersonale',
          'Indifferente', 'Insensibile', 'Logico', 'Lucido', 'Osservatore', 'Razionale',
        ],
        sostantivi: [
          'Algidità', 'Anaffettività', 'Analiticità', 'Autocontrollo', 'Calcolo', 'Contenimento', 'Disincanto',
          'Distacco', 'Distanza', 'Ermeticità', 'Freddezza', 'Glacialità', 'Impassibilità', 'Impersonalità',
          'Indifferenza', 'Insensibilità', 'Logicità', 'Lucidità', 'Osservazione', 'Razionalità', 'Asetticità',
          'Impenetrabilità', 'Inespressività', 'Marmoreità', 'Neutralità', 'Opacità', 'Rigidità',
          'Spassionatezza', 'Meccanicità', 'Vuoto emotivo',
        ],
        paroleChiave: [
          { parola: 'Freddo' }, { parola: 'Impassibile' }, { parola: 'Razionale' }, { parola: 'Insensibile' },
          { parola: 'Indifferente' },
        ],
        sostantiviSintesi: [
          'Anaffettività', 'Freddezza', 'Autocontrollo', 'Distacco', 'Insensibilità', 'Impassibilità',
          'Vuoto emotivo', 'Indifferenza', 'Aridità affettiva', 'Impersonalità', 'Algidità',
        ],
        associazioni: {
          marziale: ['Duro', 'Glaciale (nell’azione)', 'Inflessibile', 'Spietato', 'Imperturbabile'],
          malinconica: ['Disincantato', 'Cinico', 'Disilluso', 'Arido', 'Rassegnato-distante'],
          entusiasta: ['Spassionato', 'Distratto (dall’emozione)', 'Superficiale', 'Leggero-indifferente', 'Anestetizzato'],
          flemmatica: ['Inerte-emotivamente', 'Neutro', 'Passivo', 'Opaco', 'Sospeso-affettivamente'],
        },
      },
      {
        rawKey: 'GRIGIO_2_Distaccata',
        nome: 'Natura Distaccata',
        intervallo: intervalloDi('GRIGIO_2_Distaccata'),
        aggettivi: [
          'Analitico', 'Appartato', 'Cauto', 'Cinico', 'Composto', 'Contenuto', 'Controllato', 'Critico',
          'Disincantato', 'Distaccato', 'Distante', 'Ironico', 'Lucido', 'Obiettivo', 'Osservatore', 'Razionale',
          'Riflessivo', 'Riservato', 'Scettico', 'Schermato', 'Sobrio', 'Trattenuto', 'Vigile',
        ],
        sostantivi: [
          'Analiticità', 'Autocontrollo', 'Cautela', 'Chiarezza', 'Cinismo', 'Compostezza', 'Contenimento',
          'Controllo', 'Disincanto', 'Distacco', 'Distanza', 'Intellettualizzazione', 'Ironia', 'Lucidità',
          'Obiettività', 'Osservazione', 'Pensiero puro', 'Prevedibilità', 'Realismo', 'Riflessione', 'Ritegno',
          'Riservatezza', 'Ritiro', 'Scetticismo', 'Schermatura', 'Sobrietà', 'Spirito critico', 'Vigilanza',
        ],
        paroleChiave: [
          { parola: 'Lucido' }, { parola: 'Disincantato' }, { parola: 'Osservatore' }, { parola: 'Controllato' },
          { parola: 'Riservato' },
        ],
        sostantiviSintesi: [
          'Distacco', 'Lucidità', 'Autocontrollo', 'Osservazione', 'Disincanto', 'Riservatezza', 'Ironia',
          'Prevedibilità', 'Intellettualizzazione', 'Scetticismo',
        ],
        associazioni: {
          marziale: ['Rigoroso', 'Calcolatore', 'Autodisciplinato', 'Lucido (nella decisione)', 'Imperturbabile-vigile'],
          malinconica: ['Cinico', 'Disincantato-pensoso', 'Scettico', 'Appartato', 'Ironico-amaro'],
          entusiasta: ['Ironico', 'Sarcastico', 'Frenato (nell’entusiasmo)', 'Contenuto (nella gioia)', 'Sornione'],
          flemmatica: ['Pacato', 'Paziente', 'Composto', 'Sobrio', 'Tranquillo-vigile'],
        },
        segnaleDistintivo:
          'La distanza del distaccato si nota come sforzo o come gesto: c’è un movimento di allontanamento e qualcosa da cui allontanarsi. Dove l’anaffettivo non ha affetto da tenere lontano, il distaccato ne ha e lo sposta.',
      },
    ],
  },
]

const NATURA_BY_RAW_KEY = FAMIGLIE_TST.reduce((acc, famiglia) => {
  for (const natura of famiglia.nature) {
    acc[natura.rawKey] = { ...natura, famigliaId: famiglia.id, famigliaNome: famiglia.nome, colorKey: famiglia.colorKey }
  }
  return acc
}, {})

const FAMIGLIA_BY_ID = FAMIGLIE_TST.reduce((acc, famiglia) => {
  acc[famiglia.id] = famiglia
  return acc
}, {})

const FAMIGLIA_BY_COLOR_KEY = FAMIGLIE_TST.reduce((acc, famiglia) => {
  acc[famiglia.colorKey] = famiglia
  return acc
}, {})

export function getNaturaByRawKey(rawKey) {
  return NATURA_BY_RAW_KEY[rawKey] || null
}

export function getFamigliaById(famigliaId) {
  return FAMIGLIA_BY_ID[famigliaId] || null
}

export function getFamigliaByColorKey(colorKey) {
  return FAMIGLIA_BY_COLOR_KEY[colorKey] || null
}

export function getAggettiviForRawKey(rawKey) {
  return getNaturaByRawKey(rawKey)?.aggettivi || []
}

export function getSostantiviForRawKey(rawKey) {
  return getNaturaByRawKey(rawKey)?.sostantivi || []
}

export function getParoleChiaveForRawKey(rawKey) {
  return (getNaturaByRawKey(rawKey)?.paroleChiave || []).map((p) => p.parola)
}

/** Unione dei sostantivi di tutte le Nature di una famiglia (per il vocabolario per famiglia). */
export function getSostantiviForFamiglia(famigliaIdOrColorKey) {
  const famiglia = FAMIGLIA_BY_ID[famigliaIdOrColorKey] || FAMIGLIA_BY_COLOR_KEY[famigliaIdOrColorKey]
  if (!famiglia) return []
  const set = new Set()
  for (const natura of famiglia.nature) {
    for (const s of natura.sostantivi) set.add(s)
  }
  return [...set]
}
