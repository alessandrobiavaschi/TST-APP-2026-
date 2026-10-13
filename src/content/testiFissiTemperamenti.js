/**
 * Fonte unica dei testi descrittivi di famiglie e nature, trascritti alla lettera
 * dal documento «TESTI FISSI — Temperamenti» (comitato scientifico / F. Mussida).
 *
 * Galassia e Vocabolario del report leggono descrizioni di famiglia e di natura
 * SOLO da qui; le parole (aggettivi, sostantivi, associazioni) restano in
 * content/paroleTst.js. Interventi ammessi: nessuno, salvo i titoli normalizzati
 * (nel PDF: "NATURA- IL DISTACCATA" → "Natura Distaccata").
 *
 * Chiavi: famiglie per colorKey ('blu' | 'rosso' | 'verde' | 'giallo' | 'grigio'),
 * nature per campo Firestore (rawKey, es. 'BLU_2_Lunare').
 */

export const TESTI_FISSI_FONTE = 'TESTI FISSI — Temperamenti (PDF)'

/** @type {Record<string, { titolo: string, testo: string[] }>} */
export const TESTI_FAMIGLIA = {
  "blu": {
    "titolo": "La famiglia Malinconica",
    "testo": [
      "Il temperamento malinconico offre l'esperienza di osservarsi “da dentro”. È il più complesso tra i cinque temperamenti che compongono l'identità emotiva. Una forza che spinge a sperimentare tutto ciò che si muove nell'Interiorità, uno spazio vivo e magico dove i sensi si rispecchiano come un'eco, mischiandosi a ricordi, immagini e pensieri, e restituendo emozioni, sentimenti e un intero arcobaleno di stati d'animo. Il malinconico prova un piacere sottile per la solitudine, quando è in equilibrio sta davvero bene da solo. La Malinconia è una delle forze emotive più complesse.",
      "Possediamo un cielo interiore, copia di quello esteriore. Le stesse forze che ci toccano fisicamente, soffiano dentro di noi come energia, come correnti emotive che si muovono tra zone luminose dirette o riflesse solari e lunari, tra luce e buio. Il manifestarsi, sperimentare la Malinconia rende consapevoli di una sensibilità profonda, di una spiccata vita interiore. In quella sfera le forze emotive possono prendere orientamenti diversi: verso l'interno (lunare introspettiva), verso il peso (lunare depressiva), verso l'esterno (solare) e verso il passato (nostalgica)."
    ]
  },
  "grigio": {
    "titolo": "La famiglia Razionale",
    "testo": [
      "Questa famiglia si distingue nettamente dagli altri temperamenti in quanto tende a vivere il proprio piacere fuori dalla sfera della pura passionalità. Si può dire si trovi nel suo polo opposto. È il piacere del matematico, del Fisico, dello scienziato dove la componente razionale/intellettuale anaffettiva (priva di passione) finisce per sostituire quasi completamente l'asse emotivo come motore anche nel comportamento. Lì dove le forze della Malinconia tendono non solo ad illuminare l’interiorità ma a ritirarsi fino a scavare in profondità a rimuginare sul proprio sentire, il razionale tende a ritirarsi verso il pensiero puro, con l'affettività attenuata o tenuta attivamente a distanza, spesso come meccanismo di difesa e di protezione dal \"disturbo affettivo\" attraverso una postura intellettuale deliberata (il cinismo come lucidità rivendicata). Nella famiglia Razionale \"distaccato\" e \"anaffettivo\" indicano due rapporti diversi con l'affettività. Il punto comune sono due diversi aspetti di un unico piacere che guida il comportamento. Dentro questo spostamento si distinguono due movimenti. Il primo riguarda ciò che muove la persona, il secondo riguarda ciò che la persona fa con quello che sente. Nel distaccato il sentire c'è, ma viene tenuto lontano con una scelta, spesso difensiva. Nell'anaffettivo l'affetto non è ciò che fa muovere, e il piacere si trova altrove."
    ]
  },
  "verde": {
    "titolo": "La famiglia Flemmatica",
    "testo": [
      "Alla Famiglia dei flemmatici appartengono persone che manifestano la propensione a ricercare il piacere della calma e di un equilibrio. Prima di agire preferiscono valutare con attenzione procedendo con lentezza e metodo. Si trovano a loro agio solidificando certezze. Per questo preferiscono la routine, cercano il piacere della ripetitività, tutto ciò che può educare ad aver pazienza. Preferiscono rimanere nell’ambito del conosciuto, del prevedibile, anziché lanciarsi con convinzione in nuove avventure, anche per questo non si trovano a loro agio nel dover improvvisare. Il loro progressivo distillare regole per dare la sicurezza di fare la cosa giusta, li rende agli occhi del mondo persone affidabili, pazienti e costanti. Ottimi ascoltatori e mediatori nei conflitti, raramente si lasciano trascinare dalla concitazione e dalle relazioni che richiedono eccessiva passionalità, che fanno spendere troppe energie emotive. Il loro talento vero sta nell’accorgersene e di conseguenza: evitarle. Il loro limite è una certa lentezza nel reagire che tende a renderli freddi, distaccati o pigri. Faticano ad adattarsi ai cambiamenti rapidi e, davanti a chi chiede slancio, possono risultare poco coinvolti o indifferenti, anche quando in realtà non lo sono."
    ]
  },
  "giallo": {
    "titolo": "La famiglia Entusiasta",
    "testo": [
      "Appartengono alla famiglia degli entusiasti gli estroversi, le persone vivaci ricche di energia, che si accendono con facilità davanti a idee, progetti e persone nuove. Comunicativi, ottimisti e generosi, trasmettono agli altri il proprio slancio e si fanno benvolere per la spontaneità e la capacità di vedere il lato positivo delle cose. Amano stare in gruppo, sperimentare e cambiare. Il rovescio della medaglia è l'incostanza: iniziano molte cose con grande passione ma le portano a termine con difficoltà, perdono interesse quando l'effetto novità svanisce e passano rapidamente dall'euforia alla delusione. Possono inoltre risultare superficiali, dispersivi o poco puntuali nei dettagli.",
      "Sono determinati, ambiziosi e fortemente orientati all'azione, con una spiccata capacità decisionale e doti naturali di leadership. Si pongono obiettivi chiari, pianificano con concretezza e li perseguono con tenacia, senza scoraggiarsi di fronte agli ostacoli, che vivono come sfide. Hanno fiducia in sé stessi, spirito pratico e grande resistenza allo stress. D'altra parte possono apparire autoritari, impazienti e poco inclini all'ascolto o al compromesso, con una tendenza al controllo e alla rigidità. Nei rapporti personali rischiano di trascurare la sfera emotiva, considerando i sentimenti secondari rispetto al risultato da raggiungere."
    ]
  },
  "rosso": {
    "titolo": "La famiglia Marziale",
    "testo": [
      "La famiglia Marziale raccoglie i temperamenti che hanno propensione all'azione presente, operare nel qui e ora. Persone che vivono in modo forte il piacere dell'iniziativa e dell'affermazione di sé. Chi ne fa parte ha un'energia intensa, un’autostima che chiede di essere spesa in modo concreto. Preferisce il fare e la sintesi all’elucubrare troppo, ama il movimento più che l'attesa. Ha coraggio, spirito competitivo e un forte senso della propria autonomia. Si esprime in modo diretto, senza giri di parole né compromessi inutili. Ama guidare, decidere e assumersi la responsabilità di ciò che intraprende. Davanti agli ostacoli non arretra: li affronta e li trasforma in occasioni per misurarsi. Sa difendere sé stesso e gli altri con lealtà e determinazione. Il suo limite è l'impazienza, che può renderlo duro, dominante o incline allo scontro. Quando impara a dosare la propria forza, diventa un alleato prezioso e un vero punto di riferimento."
    ]
  }
}

/** @type {Record<string, { titolo: string, testo: string }>} */
export const TESTI_NATURA = {
  "BLU_2_Lunare": {
    "titolo": "Natura Lunare – Introspettiva",
    "testo": "È il volto più contemplativo della malinconia quello che fa tendere alla riflessione. La persona manifesta la propensione, il piacere di osservare il proprio mondo interiore, dove elabora emozioni, pensieri e impressioni con lentezza e profondità. Come la luna, riflette e non irradia: assorbe ciò che accade intorno e lo trasforma cercando consapevolezza emotiva. Ama la solitudine scelta, il silenzio, o la Musica ricca di un’organizzazione di suoni che invitano all’introspezione, la lettura, la scrittura e tutto ciò che permette di interrogarsi sul senso delle cose. Ha un forte spirito di osservazione, coglie le sfumature nei toni e nei comportamenti altrui ed è dotata di intuito. Il rischio è l'eccesso di analisi: il rimuginio, l'isolamento e la difficoltà a tradurre in azione ciò che ha compreso. Fa fatica a esporsi, e chi le sta accanto può scambiare la sua riservatezza per distanza."
  },
  "BLU_1_Depressiva": {
    "titolo": "Natura Lunare – Depressiva",
    "testo": "Quando riflettere intimamente diventa scavare la sensibilità lunare si carica di un peso quasi fisico e di ombra. È una tendenza a vivere l'esistenza con un tono di fondo grave, segnato da sfiducia, senso di inadeguatezza e facilità allo scoraggiamento. La persona avverte con particolare intensità le perdite, i fallimenti e le delusioni, e tende a leggerli come conferme di un proprio limite. Si autocritica con durezza, si svaluta e aspetta poco da sé e dalla vita. Gli stati d'animo possono essere lunghi e ciclici, con periodi di stanchezza emotiva, ritiro e perdita di slancio. Questo stesso temperamento ha anche una risorsa preziosa, forgia la capacità di comprendere la sofferenza altrui con una profondità rara. È uno stato temperamentale che non coincide ancora con la depressione clinica. Se però questa tristezza si incupisce può diventare persistente, invalidante fino a togliere interesse alle attività di sempre."
  },
  "BLU_4_Solare": {
    "titolo": "Natura Solare",
    "testo": "È la malinconia che non si chiude in sé ma trova una via verso la luce. La persona conserva la sensibilità e la profondità del malinconico, ma le accompagna calore, espressività e desiderio di condividere. Sa trasformare il proprio sentire in creatività, dedizione e generosità, e spesso trova nell'arte, nella cura degli altri o nell'impegno una forma di riscatto. Ha una malinconia dolce, che non spegne l'energia ma la rende più consapevole e autentica. Sa sorridere, ma senza superficialità, perché conosce anche il lato più fragile della vita. Ha bisogno di legami veri e di rapporti significativi, e in essi dà il meglio di sé. Il limite sta nel rischio di sostenere gli altri trascurando i propri bisogni, oppure di alternare fasi luminose e fasi di calo che sorprendono anche chi le vive."
  },
  "BLU_3_Nostalgia": {
    "titolo": "Natura Nostalgica",
    "testo": "È la componente malinconica che guarda soprattutto al passato al già sperimentato, o vive la convinzione che un certo desiderio non verrà appagato. La persona si sente fortemente legata ai ricordi, ai luoghi, alle stagioni della vita e alle persone che hanno contato, e conserva il passato come un tesoro affettivo da custodire. Ha una memoria emotiva che porta a sviluppare attenzione ai dettagli, a dare un gusto quasi poetico per ciò che è stato, a nutrire rispetto per le tradizioni, per i rituali e a dare agli oggetti un carico maggiore di significato. Una fedeltà al passato che sviluppa un affetto costante e un senso di gratitudine. Il suo lato fragile è la tendenza a idealizzare il passato e a confrontarlo con un presente che appare più povero. Ne possono derivare difficoltà ad accettare i cambiamenti, rimpianti e una certa chiusura verso il nuovo. La sfida è trasformare il rimpianto di momenti felici in un rivivere con il cuore, ringraziando per il dono ricevuto, integrando la memoria nella vita presente, facendone una radice e non un rifugio."
  },
  "GRIGIO_2_Distaccata": {
    "titolo": "Natura Distaccata",
    "testo": "Il distaccato sente, ma pone una distanza deliberata tra sé e ciò che prova: l'affettività non manca, viene attenuata e tenuta fuori dalla porta come un rumore che disturba il lavoro. Il malinconico scava nel proprio sentire, il flemmatico cerca riposo, l'entusiasta si perde nella passione; lui si ritira verso il pensiero puro. La distanza ha una funzione protettiva: conserva chiarezza, controllo e prevedibilità quando l'emozione renderebbe tutto incerto, e per questo la sua freddezza appare come competenza, come capacità di restare lucido. Il cinismo è una postura intellettuale scelta e difesa come forma superiore di realismo, ed è il segno che l'affetto è stato allontanato, non che sia assente. Riconosce e nomina i sentimenti, ma li tratta come dati da osservare più che come forze da assecondare. Può provare un attaccamento vero e mostrarlo poco o con ironia. Sotto pressione emotiva, per esempio in un lutto, la distanza può cedere e il sentire emerge più intenso del previsto. Segnale distintivo: la distanza si nota come sforzo o come gesto, quindi c'è un movimento di allontanamento e qualcosa da cui allontanarsi."
  },
  "GRIGIO_1_Anaffettiva": {
    "titolo": "Natura Anaffettiva",
    "testo": "L'anaffettivo vive il piacere fuori dalla sfera passionale: il suo motore è la componente razionale e intellettuale, priva di passione. Non tiene a distanza l'affetto, perché l'affetto non è ciò che lo mette in movimento; rispetto agli altri temperamenti si colloca nel polo opposto della passione. Il suo è il piacere del matematico, del fisico, dello scienziato: capire, ordinare, dimostrare, far tornare un sistema. È un piacere pieno e sufficiente, non un ripiego. La componente anaffettiva sostituisce quasi del tutto l'asse emotivo come motore del comportamento, così scelte, impegni e preferenze seguono la coerenza logica e l'interesse per il problema, non il richiamo di un desiderio o di un legame. Il piacere nasce dalla struttura, dalla precisione e dalla scoperta, non dal calore o dall'intensità. Nelle relazioni può essere leale, generoso e affidabile, ma su basi di coerenza, giustizia e stima, non di coinvolgimento emotivo. Gli altri percepiscono spesso un'assenza di risonanza: risponde con esattezza a ciò che gli viene detto, meno a ciò che gli viene lasciato sentire. Segnale distintivo: non si nota sforzo, perché non c'è nulla da cui allontanarsi e l'attenzione va naturalmente altrove."
  },
  "VERDE_1_CalmaContemplativa": {
    "titolo": "Natura Calma Contemplativa",
    "testo": "È una calma che guarda allo spirito. Quella di chi osserva il mondo dall’alto, con un distacco sereno, senza bisogno di intervenire subito. Vive volentieri il silenzio, la meditazione, la natura e le attività che chiedono attenzione paziente. Ha uno sguardo ampio e non si lascia catturare dall'urgenza del momento. Ascolta con profondità, comprende senza giudicare e sa dare agli eventi il giusto peso. La sua pace interiore è maieutica, rassicura gli altri per osmosi e li aiuta a ritrovare la misura. Il rischio è la distanza: può osservare troppo e partecipare poco, rimandare le scelte e lasciare che la contemplazione prenda il posto dell'azione. Chi le sta accanto può scambiare la sua serenità per chiusura, assenza o disinteresse."
  },
  "VERDE_2_CalmaFisica": {
    "titolo": "Natura Calma Fisico-temporale",
    "testo": "È una calma che abita il corpo, il tempo concreto. La persona ha ritmi biologici e quotidiani regolari, un'energia costante e misurata, e un rapporto concreto con la materia: il cibo, il riposo, il movimento lento, il lavoro fatto con cura e continuità. Ha una notevole resistenza e sa aspettare: non forza i tempi, lascia che le cose maturino e porta a termine ciò che inizia, senza fretta e senza abbandoni. Il tempo che passa non porta angosce, trova il suo passo in un mondo che corre. Il limite è la pesantezza: può indulgere alla comodità fino a impigrirsi, a faticare a mettersi in moto, a subire cambiamenti di ritmo e tendere alla sedentarietà o all'inerzia quando la routine diventa ricerca di abitudini passive."
  },
  "GIALLO_1_Gioia_Entusiasmo": {
    "titolo": "Natura Gioiosa, Solare",
    "testo": "È l'entusiasmo che si manifesta come gioia di vivere. Un entusiasmo che si dona come calore e luce. La persona irradia leggerezza, e la sua presenza rasserena l'ambiente. Ha un'indole espansiva e ottimista, sa cogliere il lato bello delle cose e trova motivi di festa anche nelle piccole occasioni quotidiane. È spontanea, affettuosa e generosa nei gesti e nelle parole, e ama la compagnia, la musica, il gioco, il movimento e tutto ciò che mette in comunicazione con gli altri. Il suo sorriso mette a proprio agio e apre le porte, e ha una particolare capacità di consolare e rilanciare chi è affaticato. Il limite sta nella superficialità: per amore della leggerezza può evitare i temi gravi, minimizzare i problemi o cercare distrazione invece di affrontare ciò che pesa. Dipende molto dal calore degli altri, e nella solitudine o nella critica può perdere luce e fiducia."
  },
  "GIALLO_2_Volitivo_Passionale": {
    "titolo": "Natura Sanguigna, Operosa",
    "testo": "È l'entusiasmo che diventa azione. Questa persona ha un'energia che non sta ferma. La persona si accende davanti a un'idea e la trasforma subito in progetto e movimento. È vitale, passionale e intraprendente, ama iniziare, organizzare, mettersi in gioco e trascinare gli altri con il proprio slancio. Ha un forte temperamento fisico, una volontà pronta e una notevole capacità di mobilitare risorse e persone. Nelle imprese collettive è spesso il motore che fa partire le cose. Il lato fragile è la sovraesposizione: la stessa tensione che spinge in avanti può diventare impazienza, irruenza o irritabilità, con scatti di collera e passaggi bruschi dall'ardore alla stanchezza. Può disperdersi in troppi propositi, faticare a portarli a termine e consumarsi per eccesso di impegno, senza concedersi pause."
  },
  "ROSSO_1_Assertivita": {
    "titolo": "Natura Volitiva",
    "testo": "Il marziale volitivo esprime la sua assertività attraverso l’esercizio della volontà. Un'energia che tende a controllare e che organizza e dirige verso una meta apprezzabile, obiettivo preciso e non è detto che debba essere solo materiale. Agisce con metodo, costanza e lucidità, e la sua forza la si misura nella tenacia nel tempo più che nell'impeto momentaneo. Decide con fermezza e porta a termine ciò che inizia, anche quando il cammino è lungo. Si sente realizzato quando può prendersi o gli si affidano responsabilità. Più ne ha più prova piacere. È portato a comandare con autorevolezza e ispira fiducia perché resta saldo nelle difficoltà. Il rischio è l'ostinazione, cioè la fermezza che diventa rigidità e chiusura al confronto."
  },
  "ROSSO_2_Dubbio_Collera": {
    "titolo": "Natura Collerica",
    "testo": "Nel marziale collerico l'assertività la esprime attraverso un agire spesso impulsivo. Manifesta un'energia viva, immediata, che si accende subito nello sguardo. Accende questa energia una parola detta male, un gesto mal fatto, una scelta considerata sbagliata. Reagisce con prontezza e non tollera l'ingiustizia, la lentezza né le mezze misure. La sua schiettezza è totale come la sua generosità sincera, e la rabbia, quando esplode, si spegne presto senza lasciare rancore. Il rischio della persona collerica è l'impetuosità, il che lo porta, quando si trova sotto stress, ad agire prima di riflettere e spesso a ferire con parole o gesti troppo bruschi le persone con cui intrattiene relazioni."
  }
}

const NOME_TO_COLOR = { Blu: 'blu', Rosso: 'rosso', Verde: 'verde', Giallo: 'giallo', Grigio: 'grigio' }

/** Accetta colorKey ('blu') o nome breve di famiglia del report ('Blu'). */
export function getTestoFamiglia(famiglia) {
  const key = NOME_TO_COLOR[famiglia] || String(famiglia || '').toLowerCase()
  return TESTI_FAMIGLIA[key] || null
}

export function getTestoNatura(rawKey) {
  return TESTI_NATURA[rawKey] || null
}

/** Prima frase del testo di famiglia (per sintesi brevi). */
export function getSintesiFamiglia(famiglia) {
  const t = getTestoFamiglia(famiglia)?.testo?.[0] || ''
  const m = t.match(/^.*?[.!?](?=\s|$)/)
  return (m ? m[0] : t).trim()
}
