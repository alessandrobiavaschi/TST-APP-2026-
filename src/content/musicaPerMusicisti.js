/**
 * Contenuti musicali per l'esperienza «TST · For Musicians».
 *
 * Centralizza:
 * 1. Le 13 distanze musicali (unisono fino all'ottava, dal buio alla luce)
 * 2. I 72 ascolti del test con titoli tecnici e spiegazione per musicisti
 * 3. Il tuo suono per famiglia (timbri, ritmo e bpm, armonie e modi, pratica)
 * 4. Ascolti e artisti: le 5 coppie di brani con l'analisi di Franco Mussida
 */

export const DISTANZE_MUSICALI_13 = [
  {
    semitoni: 0,
    nome: 'Unisono (Prima)',
    sigla: '1ª',
    intervalloKey: 'unisono',
    note: 'Do – Do',
    rapportoFrequenza: '1:1',
    evocativa: 'Impulso di presenza, coincidenza e coesione, energia pura dell\'Io e punto di ancoraggio dell\'azione.',
    naturaId: 'rosso_marziale_volitiva',
    naturaNome: 'Volitiva',
    famigliaKey: 'Rosso',
    famigliaNome: 'Marziale',
    coloreFamiglia: '#dc2626',
    stato: 'in verifica',
    motivoStato: 'Nel modello è legato alla natura Volitiva; nella teoria generale è anche il polo di partenza per tutte le 13 distanze.',
    descrizioneMussida: 'La vibrazione identica di due suoni sulla stessa frequenza: la radice da cui si dipartono tutte le tensioni e i viaggi emotivi.'
  },
  {
    semitoni: 1,
    nome: 'Seconda minore',
    sigla: '2ª min',
    intervalloKey: 'seconda minore',
    note: 'Do – Re♭',
    rapportoFrequenza: '16:15',
    evocativa: 'Buio profondo, chiusura, angoscia, timore dell\'inconosciuto e dolore cupo che scava nell\'interiorità.',
    naturaId: 'blu_malinconica_lunare_depressiva',
    naturaNome: 'Lunare Depressiva',
    famigliaKey: 'Blu',
    famigliaNome: 'Malinconica',
    coloreFamiglia: '#2563eb',
    stato: 'consolidato',
    motivoStato: 'Corrispondenza confermata con la natura Lunare Depressiva (Blu Notte).',
    descrizioneMussida: 'La massima contrazione della distanza sonora: attrito pungente che evoca la zona più d\'ombra dell\'animo umano.'
  },
  {
    semitoni: 2,
    nome: 'Seconda maggiore',
    sigla: '2ª Magg',
    intervalloKey: 'seconda maggiore',
    note: 'Do – Re',
    rapportoFrequenza: '9:8',
    evocativa: 'Attrito fertile, spinta al passo successivo, risveglio dall\'inerzia e moto in avanti.',
    naturaId: 'blu_malinconica_lunare_depressiva',
    naturaNome: 'Malinconica (passaggio)',
    famigliaKey: 'Blu',
    famigliaNome: 'Malinconica',
    coloreFamiglia: '#2563eb',
    stato: 'consolidato',
    motivoStato: 'Gradino fondamentale di moto melodico nel continuum verso la luce.',
    descrizioneMussida: 'Un intervallo di tono intero che inizia a sciogliere la stretta della seconda minore, introducendo direzione e respiro.'
  },
  {
    semitoni: 3,
    nome: 'Terza minore',
    sigla: '3ª min',
    intervalloKey: 'terza minore',
    note: 'Do – Mi♭',
    rapportoFrequenza: '6:5',
    evocativa: 'Introspezione raccolta, luce riflessa della luna, tristezza dolce, intimità e nostalgia confidenziale.',
    naturaId: 'blu_malinconica_lunare_introspettiva',
    naturaNome: 'Lunare Introspettiva',
    famigliaKey: 'Blu',
    famigliaNome: 'Malinconica',
    coloreFamiglia: '#2563eb',
    stato: 'consolidato',
    motivoStato: 'Fondamento del modo minore e del sentire lunare introspettivo.',
    descrizioneMussida: 'La porta d\'accesso all\'introspezione: un clima intimo in cui il mondo esterno tace e ci si osserva da dentro.'
  },
  {
    semitoni: 4,
    nome: 'Terza maggiore',
    sigla: '3ª Magg',
    intervalloKey: 'terza maggiore',
    note: 'Do – Mi',
    rapportoFrequenza: '5:4',
    evocativa: 'Solarità emergente, fiducia, apertura dell\'animo, speranza che rischiara il passato.',
    naturaId: 'blu_malinconica_solare',
    naturaNome: 'Solare',
    famigliaKey: 'Blu',
    famigliaNome: 'Malinconica',
    coloreFamiglia: '#2563eb',
    stato: 'consolidato',
    motivoStato: 'Cardine della malinconia solare: apertura di una breccia luminosa verso il mondo.',
    descrizioneMussida: 'L\'intervallo che definisce il modo maggiore: porta la luce del sole dentro la sensibilità malinconica.'
  },
  {
    semitoni: 5,
    nome: 'Quarta giusta',
    sigla: '4ª',
    intervalloKey: 'quarta giusta',
    note: 'Do – Fa',
    rapportoFrequenza: '4:3',
    evocativa: 'Fermezza, tensione cadenzale, vigore, reattività e confine tra spinta e resistenza.',
    naturaId: 'rosso_marziale_collerica',
    naturaNome: 'Collerica (polo di tensione)',
    famigliaKey: 'Rosso',
    famigliaNome: 'Marziale',
    coloreFamiglia: '#dc2626',
    stato: 'consolidato',
    motivoStato: 'Associata alla tensione reattiva della famiglia Marziale.',
    descrizioneMussida: 'Un intervallo di sospensione decisa che non si adagia: chiama movimento, slancio o contrasto reattivo.'
  },
  {
    semitoni: 6,
    nome: 'Quarta eccedente / Tritono',
    sigla: '4ª ecc / 5ª dim',
    intervalloKey: 'tritono',
    note: 'Do – Fa#',
    rapportoFrequenza: '45:32',
    evocativa: 'Massima tensione ambigua, dubbio intellettuale, sospensione metafisica e instabilità percettiva.',
    naturaId: 'grigio_razionale_anaffettiva',
    naturaNome: 'Anaffettiva / Dubbio',
    famigliaKey: 'Grigio',
    famigliaNome: 'Razionale',
    coloreFamiglia: '#64748b',
    stato: 'consolidato',
    motivoStato: 'Intervallo simbolo della sospensione critica e della dubbiosità razionale.',
    descrizioneMussida: 'La spaccatura simmetrica dell\'ottava a metà esatta: non trova riposo né in alto né in basso, sospendendo il giudizio.'
  },
  {
    semitoni: 7,
    nome: 'Quinta giusta',
    sigla: '5ª',
    intervalloKey: 'quinta giusta',
    note: 'Do – Sol',
    rapportoFrequenza: '3:2',
    evocativa: 'Calma profonda, bonaccia silenziosa, stabilità cosmica, respiro lento e contemplazione pura.',
    naturaId: 'verde_flemmatica_calma_contemplativa',
    naturaNome: 'Calma Contemplativa',
    famigliaKey: 'Verde',
    famigliaNome: 'Flemmatica',
    coloreFamiglia: '#16a34a',
    stato: 'consolidato',
    motivoStato: 'Cardine della famiglia Flemmatica: l\'occhio del ciclone e la bonaccia.',
    descrizioneMussida: 'L\'intervallo consonante per eccellenza dopo l\'ottava: genera uno spazio di sicurezza e distensione totale.'
  },
  {
    semitoni: 8,
    nome: 'Sesta minore (o Quinta eccedente)',
    sigla: '6ª min',
    intervalloKey: 'sesta minore',
    note: 'Do – La♭',
    rapportoFrequenza: '8:5',
    evocativa: 'Riposo fisico, rilassatezza muscolare, dilatazione del tempo e oblio consolatorio.',
    naturaId: 'verde_flemmatica_calma_fisica',
    naturaNome: 'Calma Fisica',
    famigliaKey: 'Verde',
    famigliaNome: 'Flemmatica',
    coloreFamiglia: '#16a34a',
    stato: 'in verifica',
    motivoStato: 'Nell\'indice del PDF indicata come Quinta eccedente / Calma Fisico temporale; da confermare formalmente con Franco Mussida.',
    descrizioneMussida: 'La distensione corporea in cui ogni urgenza decade, favorendo il recupero energetico del corpo.'
  },
  {
    semitoni: 9,
    nome: 'Sesta maggiore',
    sigla: '6ª Magg',
    intervalloKey: 'sesta maggiore',
    note: 'Do – La',
    rapportoFrequenza: '5:3',
    evocativa: 'Gioia piena, solarità espansiva, calore affettivo, desiderio di condivisione e bellezza aperta.',
    naturaId: 'giallo_entusiasta_gioiosa_solare',
    naturaNome: 'Gioiosa Solare',
    famigliaKey: 'Giallo',
    famigliaNome: 'Entusiasta',
    coloreFamiglia: '#eab308',
    stato: 'consolidato',
    motivoStato: 'Perno della famiglia Entusiasta nella natura Gioiosa Solare.',
    descrizioneMussida: 'La dolcezza luminosa che apre il sorriso: porta verso l\'esterno il calore e la voglia di festeggiare la vita.'
  },
  {
    semitoni: 10,
    nome: 'Settima minore',
    sigla: '7ª min',
    intervalloKey: 'settima minore',
    note: 'Do – Si♭',
    rapportoFrequenza: '16:9',
    evocativa: 'Slancio operoso, pulsazione vitale blues/modale, passione veemente e spinta all\'esplorazione.',
    naturaId: 'giallo_entusiasta_sanguigna_operosa',
    naturaNome: 'Sanguigna Operosa',
    famigliaKey: 'Giallo',
    famigliaNome: 'Entusiasta',
    coloreFamiglia: '#eab308',
    stato: 'consolidato',
    motivoStato: 'Corrispondenza con la spinta operosa e passionale del temperamento sanguigno.',
    descrizioneMussida: 'Tensione dinamica che rifiuta la staticità: sollecita l\'attività, il ritmo e l\'adesione all\'esperienza.'
  },
  {
    semitoni: 11,
    nome: 'Settima maggiore',
    sigla: '7ª Magg',
    intervalloKey: 'settima maggiore',
    note: 'Do – Si',
    rapportoFrequenza: '15:8',
    evocativa: 'Languore dolce-amaro, nostalgia accesa di luce, gratitudine per il bene vissuto, saudade.',
    naturaId: 'blu_malinconica_nostalgica',
    naturaNome: 'Nostalgica',
    famigliaKey: 'Blu',
    famigliaNome: 'Malinconica',
    coloreFamiglia: '#2563eb',
    stato: 'consolidato',
    motivoStato: 'L\'intervallo più vicino all\'ottava ma distaccato da essa: nostalgia luminosa.',
    descrizioneMussida: 'Il primo dei suoni che abbandona la compiutezza dell\'ottava, lasciando quel velo di dolore dolce che chiamiamo ricordo riconoscente.'
  },
  {
    semitoni: 12,
    nome: 'Ottava giusta',
    sigla: '8ª',
    intervalloKey: 'ottava',
    note: 'Do – Do (acuto)',
    rapportoFrequenza: '2:1',
    evocativa: 'Compiutezza, unità amorevole, risoluzione totale, ciclo completato e riconciliazione universale.',
    naturaId: 'rosso_marziale_collerica',
    naturaNome: 'Collerica (polo positivo / Amorevole)',
    famigliaKey: 'Rosso',
    famigliaNome: 'Marziale',
    coloreFamiglia: '#dc2626',
    stato: 'in verifica',
    motivoStato: 'Assegnata come polo positivo della Collerica nel modello; nella dottrina è la madre di tutte le risoluzioni.',
    descrizioneMussida: 'Il raddoppio esatto della vibrazione fondamentale: la stessa nota ad altezza superiore, simbolo di unione e ritorno a casa.'
  }
]

export const ASCOLTI_72_TEST = [
  // ── SEZIONE A: TIMBRO (Passi 1–28) ──
  {
    passo: 1,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Quattro strumenti acuti (Ottavino, Oboe, Tromba, Violino)',
    spiegazione: 'Confronto diretto di registro acuto tra legni a bocca aperta, ancia doppia, ottone e corda ad arco per rilevare la prima affinità timbrica.'
  },
  {
    passo: 2,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Quattro strumenti medio-acuti (Flauto, Clarinetto, Corno, Viola)',
    spiegazione: 'Esplorazione del registro medio-acuto orchestrale: purezza d\'aria, morbidezza cilindrica, corpo dell\'ottone e calore dell\'arco.'
  },
  {
    passo: 3,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Quattro strumenti medio-gravi (Flauto basso, Fagotto, Trombone, Violoncello)',
    spiegazione: 'Confronto sulle basse frequenze calde e profonde: soffi gravi, ance spesse, ottoni a cursore e corde risonanti del violoncello.'
  },
  {
    passo: 4,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Quattro risonanze metalliche (Triangolo, Campana tibetana, Celesta, Vibrafono)',
    spiegazione: 'Ascolto del decadimento e dell\'inviluppo dei corpi metallici intonati: dalla scintilla secca alla vibrazione circolare ipnotica.'
  },
  {
    passo: 5,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Basso tuba (ottone basso)',
    spiegazione: 'Impatto di colonna d\'aria voluminosa a bassissima frequenza: solidità viscerale e sostegno primario.'
  },
  {
    passo: 6,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Controfagotto (ancia doppia ultragrave)',
    spiegazione: 'Timbro ligneo e ruvido dell\'estremo grave: risonanza terrosa e materica dell\'ancia doppia orchestrale.'
  },
  {
    passo: 7,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Corno francese (ottone nobile conico)',
    spiegazione: 'Campana rotonda che miscela aria e metallo caldo: ponte ideale tra legni e ottoni nel registro centrale.'
  },
  {
    passo: 8,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Clarinetto basso (legno cameristico scuro)',
    spiegazione: 'Legno vellutato e profondo, capace di passare da un sussurro caldo a una corposità scura e penetrante.'
  },
  {
    passo: 9,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Sax tenore (ancia e corpo in ottone)',
    spiegazione: 'Strumento ibrido a ricca escursione dinamica: calore vocale umano, flessibilità microtonale e respiro caldo.'
  },
  {
    passo: 10,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Oboe (doppia ancia espressiva)',
    spiegazione: 'Suono penetrante e compatto dalle frequenze medie evidenti: naturale veicolo di liricità e nostalgia intensa.'
  },
  {
    passo: 11,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Tromba (ottone brillante)',
    spiegazione: 'Attacco frontale e squillante con ricchezza di armonici superiori: segnale di presenza, allerta e affermazione.'
  },
  {
    passo: 12,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Flauto traverso (aria pura in canna)',
    spiegazione: 'Onda quasi sinusoidale con minimo attrito di armonici: ariosità, limpidezza e assenza di spigoli.'
  },
  {
    passo: 13,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Gran cassa orchestrale',
    spiegazione: 'Sub-frequenza tellurica a grande diametro: impatto fisico che risuona prima nel corpo che nell\'orecchio.'
  },
  {
    passo: 14,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Djembe africano',
    spiegazione: 'Pelle tirata a mano su legno massello: combinazione di bassi caldi e slap acuti per una pulsazione tribale.'
  },
  {
    passo: 15,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Campana tibetana armonica',
    spiegazione: 'Lega metallica a battimento circolare costante: clima meditativo che sospende il tempo lineare.'
  },
  {
    passo: 16,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Tabla indiane (Bayan e Dayan)',
    spiegazione: 'Doppia percussione intonata con pasta nera modulabile: dialogo melodico-ritmico finissimo e flessibile.'
  },
  {
    passo: 17,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Darbuka mediorientale',
    spiegazione: 'Strumento a calice con attacco rapido e chiaro: ritmica brillante e danzante tipica del bacino mediterraneo.'
  },
  {
    passo: 18,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Bar Chimes metallici',
    spiegazione: 'Cascata aleatoria di cilindri metallici in risonanza libera: pulviscolo fatato e apertura verso l\'immaginario.'
  },
  {
    passo: 19,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Triangolo orchestrale',
    spiegazione: 'Punto di luce cristallino che buca ogni massa sonora: attacco nitido e richiamo all\'attenzione.'
  },
  {
    passo: 20,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Rullante militare con cordiera',
    spiegazione: 'Timbro metallico graffiante e secco: precisione marziale, scansione rigorosa e spinta all\'ordine.'
  },
  {
    passo: 21,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Contrabbasso ad arco',
    spiegazione: 'Frequenze gravissime della cassa armonica monumentale: radice armonica dell\'orchestra e senso di stabilità.'
  },
  {
    passo: 22,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Basso elettrico solid-body',
    spiegazione: 'Attacco magnetico fermo e compatto: il cardine del groove moderno tra precisione ritmica e supporto tonale.'
  },
  {
    passo: 23,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Chitarra elettrica distorta (overdrive)',
    spiegazione: 'Saturazione ricca di armoniche pari e dispari: impatto emotivo tagliente, energia compressa e ruggito rock.'
  },
  {
    passo: 24,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Violoncello solista',
    spiegazione: 'Registro canoro baritonale vicinissimo alla voce umana: profondità lirica, morbidezza e toccante intimità.'
  },
  {
    passo: 25,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Arpa da concerto',
    spiegazione: 'Risonanza libera di corde pizzicate su tavola allargata: fluidità liquida, sogno e dilatazione dello spazio.'
  },
  {
    passo: 26,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Viola orchestrale',
    spiegazione: 'Timbro mediano dal caratteristico chiaroscuro nasale e caldo: la voce dell\'introspezione discreta.'
  },
  {
    passo: 27,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Chitarra acustica steel-string',
    spiegazione: 'Attacco percussivo e brillante delle corde metalliche: chiarezza ritmica, intimità folk e autenticità immediata.'
  },
  {
    passo: 28,
    sezione: 'A_TIMBRO',
    sezioneNome: 'Timbro',
    titoloTecnico: 'Violino solista',
    spiegazione: 'Massima mobilità dinamica ed espressiva nel registro sovrano: canto luminoso, virtuosismo e apertura vitale.'
  },

  // ── SEZIONE B: INTERVALLI (Passi 29–41) ──
  {
    passo: 29,
    sezione: 'B_INTERVALLI',
    sezioneNome: 'Intervalli',
    titoloTecnico: 'Intervallo di Unisono (Do3 – Do3)',
    spiegazione: 'Due fonti sonore perfettamente allineate in frequenza: totale coincidenza acustica, assenza di tensione intervallare.'
  },
  {
    passo: 30,
    sezione: 'B_INTERVALLI',
    sezioneNome: 'Intervalli',
    titoloTecnico: 'Intervallo di Seconda maggiore (Do3 – Re3)',
    spiegazione: 'Distanza di un tono intero (2 semitoni): movimento melodico naturale che innesca la progressione della scala.'
  },
  {
    passo: 31,
    sezione: 'B_INTERVALLI',
    sezioneNome: 'Intervalli',
    titoloTecnico: 'Intervallo di Seconda minore (Do3 – Re♭3)',
    spiegazione: 'Attrito armonico di un solo semitono: massima tensione dissonante, contrazione drammatica e senso di minaccia/buio.'
  },
  {
    passo: 32,
    sezione: 'B_INTERVALLI',
    sezioneNome: 'Intervalli',
    titoloTecnico: 'Intervallo di Terza maggiore (Do3 – Mi3)',
    spiegazione: 'Intervallo generatore del modo maggiore (4 semitoni): accordo di stabilità solare, distensione e calore affettivo.'
  },
  {
    passo: 33,
    sezione: 'B_INTERVALLI',
    sezioneNome: 'Intervalli',
    titoloTecnico: 'Intervallo di Terza minore (Do3 – Mi♭3)',
    spiegazione: 'Intervallo generatore del modo minore (3 semitoni): coloritura introspettiva, raccolta, intima e riflessiva.'
  },
  {
    passo: 34,
    sezione: 'B_INTERVALLI',
    sezioneNome: 'Intervalli',
    titoloTecnico: 'Intervallo di Quarta giusta (Do3 – Fa3)',
    spiegazione: 'Consonanza perfetta aperta (5 semitoni): sospensione cadenzale verso la tonica o preludio all\'inno trionfale.'
  },
  {
    passo: 35,
    sezione: 'B_INTERVALLI',
    sezioneNome: 'Intervalli',
    titoloTecnico: 'Intervallo di Quarta eccedente / Tritono (Do3 – Fa#3)',
    spiegazione: 'Tre toni interi esatti (6 semitoni): simmetria destabilizzante che non risolve spontaneamente, evocando dubbio e mistero.'
  },
  {
    passo: 36,
    sezione: 'B_INTERVALLI',
    sezioneNome: 'Intervalli',
    titoloTecnico: 'Intervallo di Quinta giusta (Do3 – Sol3)',
    spiegazione: 'Rapporto acustico 3:2 (7 semitoni): consonanza archetipica di pace, stabilità imperturbabile e calma bonaccia.'
  },
  {
    passo: 37,
    sezione: 'B_INTERVALLI',
    sezioneNome: 'Intervalli',
    titoloTecnico: 'Intervallo di Sesta maggiore (Do3 – La3)',
    spiegazione: 'Distanza di 9 semitoni: dolcezza distesa che apre all\'aria aperta e anticipa la pienezza della gioia condivisa.'
  },
  {
    passo: 38,
    sezione: 'B_INTERVALLI',
    sezioneNome: 'Intervalli',
    titoloTecnico: 'Intervallo di Sesta minore (Do3 – La♭3)',
    spiegazione: 'Distanza di 8 semitoni: tensione discendente carica di gravità nostalgica, rilascio corporeo e calore calmo.'
  },
  {
    passo: 39,
    sezione: 'B_INTERVALLI',
    sezioneNome: 'Intervalli',
    titoloTecnico: 'Intervallo di Settima minore (Do3 – Si♭3)',
    spiegazione: 'Distanza di 10 semitoni: accordo di dominante naturale, colore blues e propulsione all\'avventura ritmica.'
  },
  {
    passo: 40,
    sezione: 'B_INTERVALLI',
    sezioneNome: 'Intervalli',
    titoloTecnico: 'Intervallo di Settima maggiore (Do3 – Si3)',
    spiegazione: 'Distanza di 11 semitoni: attrazione struggente verso l\'ottava, nostalgia luminosa, dolcezza amara e poetica.'
  },
  {
    passo: 41,
    sezione: 'B_INTERVALLI',
    sezioneNome: 'Intervalli',
    titoloTecnico: 'Intervallo di Ottava giusta (Do3 – Do4)',
    spiegazione: 'Raddoppio esatto della fondamentale (12 semitoni): risoluzione cosmica, compimento unitario e chiusura del cerchio.'
  },

  // ── SEZIONE C: RITMO (Passi 42–51) ──
  {
    passo: 42,
    sezione: 'C_RITMO',
    sezioneNome: 'Ritmo',
    titoloTecnico: 'Groove lento 57 bpm (Adagio / Grave)',
    spiegazione: 'Pulsazione distesa a cadenza dilatata: spazio ampio tra i battiti che induce respiro profondo e meditazione.'
  },
  {
    passo: 43,
    sezione: 'C_RITMO',
    sezioneNome: 'Ritmo',
    titoloTecnico: 'Groove moderato-lento 77 bpm (Andante calmo)',
    spiegazione: 'Passo umano tranquillo: tempo rilassato ma continuo, adatto alla contemplazione e all\'assenza di frenesia.'
  },
  {
    passo: 44,
    sezione: 'C_RITMO',
    sezioneNome: 'Ritmo',
    titoloTecnico: 'Groove medio-veloce 105 bpm (Moderato energico)',
    spiegazione: 'Passo deciso e cadenzato con solida spinta sul battere: risveglia l\'agire, la volontà e la concentrazione attiva.'
  },
  {
    passo: 45,
    sezione: 'C_RITMO',
    sezioneNome: 'Ritmo',
    titoloTecnico: 'Groove veloce 150 bpm (Allegro vivace)',
    spiegazione: 'Ritmo sostenuto e incalzante: forte spinta cinetica verso l\'esterno, coinvolgimento corporeo e danza.'
  },
  {
    passo: 46,
    sezione: 'C_RITMO',
    sezioneNome: 'Ritmo',
    titoloTecnico: 'Riconferma e sintesi tra i 4 Groove (57 / 77 / 105 / 150 bpm)',
    spiegazione: 'Confronto comparato per individuare quale pulsazione motoria rappresenta il ritmo naturale della persona.'
  },
  {
    passo: 47,
    sezione: 'C_RITMO',
    sezioneNome: 'Ritmo',
    titoloTecnico: 'Ritmo ondulato (senza accenti rigidi)',
    spiegazione: 'Pulsazione morbida a onde flessibili: il tempo scorre senza colpi bruschi, come un corso d\'acqua quieto.'
  },
  {
    passo: 48,
    sezione: 'C_RITMO',
    sezioneNome: 'Ritmo',
    titoloTecnico: 'Ritmo binario (2/4 - 4/4 marziale)',
    spiegazione: 'Metrica a coppie di battiti con chiara polarità battere/levare: struttura ferma, prevedibile ed efficace.'
  },
  {
    passo: 49,
    sezione: 'C_RITMO',
    sezioneNome: 'Ritmo',
    titoloTecnico: 'Ritmo ternario (3/4 - 6/8 rotatorio)',
    spiegazione: 'Andamento circolare in tre tempi: cadenza di valzer o barcarola che favorisce il dondolio e la fluidità emotiva.'
  },
  {
    passo: 50,
    sezione: 'C_RITMO',
    sezioneNome: 'Ritmo',
    titoloTecnico: 'Ritmo sincopato (accentazione in levare)',
    spiegazione: 'Spostamento dell\'accento forte sul tempo debole: dinamismo jazzistico, sorpresa motoria e vitalità scattante.'
  },
  {
    passo: 51,
    sezione: 'C_RITMO',
    sezioneNome: 'Ritmo',
    titoloTecnico: 'Riconferma tra le 4 strutture ritmiche (Ondulato, Binario, Ternario, Sincopato)',
    spiegazione: 'Scelta di risonanza strutturale sulla morfologia del ritmo preferito.'
  },

  // ── SEZIONE D: MELODIA (Passi 52–58) ──
  {
    passo: 52,
    sezione: 'D_MELODIA',
    sezioneNome: 'Melodia',
    titoloTecnico: 'Arpa · Canone circolare perpetuo',
    spiegazione: 'Disegno melodico che si avvolge su sé stesso in ciclo continuo: accoglie l\'ascoltatore in un flusso senza fine.'
  },
  {
    passo: 53,
    sezione: 'D_MELODIA',
    sezioneNome: 'Melodia',
    titoloTecnico: 'Arpa · Salita ascendente maggiore',
    spiegazione: 'Linea melodica che sale gradualmente verso l\'acuto in modo maggiore: apertura solare ed elevazione dello spirito.'
  },
  {
    passo: 54,
    sezione: 'D_MELODIA',
    sezioneNome: 'Melodia',
    titoloTecnico: 'Arpa · Salita ascendente minore',
    spiegazione: 'Ascesa melodica in modo minore: domanda interiore appassionata, slancio che conserva una traccia di malinconia.'
  },
  {
    passo: 55,
    sezione: 'D_MELODIA',
    sezioneNome: 'Melodia',
    titoloTecnico: 'Arpa · Discesa discendente maggiore',
    spiegazione: 'Ritorno disteso verso il registro grave in tonalità aperta: senso di appagamento, serenità e radicamento.'
  },
  {
    passo: 56,
    sezione: 'D_MELODIA',
    sezioneNome: 'Melodia',
    titoloTecnico: 'Arpa · Discesa discendente minore',
    spiegazione: 'Linea che scende nell\'ombra del modo minore: abbandono emotivo intimo, ricordo dolce e ripiegamento meditativo.'
  },
  {
    passo: 57,
    sezione: 'D_MELODIA',
    sezioneNome: 'Melodia',
    titoloTecnico: 'Arpa · Melodia a picchi e salti intervallari',
    spiegazione: 'Fraseggio frastagliato con balzi dinamici: vivacità espressiva, contrasti repentini e rifiuto della monotonia.'
  },
  {
    passo: 58,
    sezione: 'D_MELODIA',
    sezioneNome: 'Melodia',
    titoloTecnico: 'Riconferma melodica delle 4 direzioni (Asc. Magg, Asc. Min, Disc. Magg, Disc. Min)',
    spiegazione: 'Identificazione della traiettoria melodica primaria con cui l\'anima dell\'ascoltatore ama viaggiare nel tempo.'
  },

  // ── SEZIONE E: ARMONIA E ACCORDI (Passi 59–72) ──
  {
    passo: 59,
    sezione: 'E_ARMONIA',
    sezioneNome: 'Accordi',
    titoloTecnico: 'Do Magg → La min (I → vi)',
    spiegazione: 'Dalla stabilità solare maggiore alla relativa minore: passaggio dalla luce chiara alla meditazione ombrosa.'
  },
  {
    passo: 60,
    sezione: 'E_ARMONIA',
    sezioneNome: 'Accordi',
    titoloTecnico: 'La min → Do Magg (vi → I)',
    spiegazione: 'Dalla relativa minore alla tonica maggiore: risveglio dall\'introspezione verso la chiarezza rassicurante.'
  },
  {
    passo: 61,
    sezione: 'E_ARMONIA',
    sezioneNome: 'Accordi',
    titoloTecnico: 'Do Magg → Fa Magg (I → IV)',
    spiegazione: 'Movimento verso la sottodominante: allargamento dello spazio sonoro, respiro pastorale e apertura comunitaria.'
  },
  {
    passo: 62,
    sezione: 'E_ARMONIA',
    sezioneNome: 'Accordi',
    titoloTecnico: 'Fa Magg → Do Magg (IV → I)',
    spiegazione: 'Cadenza plagale (l\'accordo dell\'Amen): consolazione profonda, scioglimento delle tensioni e pace rituale.'
  },
  {
    passo: 63,
    sezione: 'E_ARMONIA',
    sezioneNome: 'Accordi',
    titoloTecnico: 'Mi min → Do Magg (iii → I)',
    spiegazione: 'Concatenazione di terza minore verso la tonica: superamento del dubbio o della mestizia verso la luce solida.'
  },
  {
    passo: 64,
    sezione: 'E_ARMONIA',
    sezioneNome: 'Accordi',
    titoloTecnico: 'Do Magg → Mi min (I → iii)',
    spiegazione: 'Allontanamento dalla tonica verso il terzo grado minore: improvviso velo di malinconia che accarezza la serenità.'
  },
  {
    passo: 65,
    sezione: 'E_ARMONIA',
    sezioneNome: 'Accordi',
    titoloTecnico: 'La min → Re min (i → iv)',
    spiegazione: 'Progressione nel buio del modo minore: discesa verso il quarto grado, gravità espressiva e dramma sommesso.'
  },
  {
    passo: 66,
    sezione: 'E_ARMONIA',
    sezioneNome: 'Accordi',
    titoloTecnico: 'Re min → La min (iv → i)',
    spiegazione: 'Risoluzione sulla tonica minore: chiusura del cerchio narrativo e ritorno al riparo della propria intimità.'
  },
  {
    passo: 67,
    sezione: 'E_ARMONIA',
    sezioneNome: 'Accordi',
    titoloTecnico: 'Si dim → Do Magg (vii° → I)',
    spiegazione: 'Risoluzione della sensibile diminuita sulla tonica: rilascio istantaneo di un\'ansia acuta nella sicurezza piena.'
  },
  {
    passo: 68,
    sezione: 'E_ARMONIA',
    sezioneNome: 'Accordi',
    titoloTecnico: 'Mi♭dim7 → Do/Mi (Accordo diminuito cromatico)',
    spiegazione: 'Slittamento cromatico enarmonico: scioglimento di un enigma sospeso in un primo rivolto radioso.'
  },
  {
    passo: 69,
    sezione: 'E_ARMONIA',
    sezioneNome: 'Accordi',
    titoloTecnico: 'Do Magg → Si♭ Magg (I → ♭VII modale)',
    spiegazione: 'Cadenza mixolidia a tono intero inferiore: respiro di libertà rock/pop, assenza di rigidità classica.'
  },
  {
    passo: 70,
    sezione: 'E_ARMONIA',
    sezioneNome: 'Accordi',
    titoloTecnico: 'Do/Mi → Mi♭dim7 (Transizione tensiva)',
    spiegazione: 'Slittamento dalla consonanza rassicurante all\'enigma diminuito: incrinatura misteriosa nel clima emotivo.'
  },
  {
    passo: 71,
    sezione: 'E_ARMONIA',
    sezioneNome: 'Accordi',
    titoloTecnico: 'Do Magg → Sol Magg (I → V)',
    spiegazione: 'Tensione dinamica verso la dominante: energia solare che chiama un compimento futuro e slancio vitale.'
  },
  {
    passo: 72,
    sezione: 'E_ARMONIA',
    sezioneNome: 'Accordi',
    titoloTecnico: 'Sol Magg → Do Magg (V → I)',
    spiegazione: 'Cadenza perfetta autentica: massima risoluzione tonale dell\'armonia occidentale, riposo sovrano ed equilibrio.'
  }
]

export const SUONO_PER_FAMIGLIA = {
  Blu: {
    famiglia: 'Malinconica',
    colore: '#2563eb',
    motto: 'La ricerca del senso, della profondità e del bel suono',
    timbri: {
      titolo: 'Timbri medi e scuri, pastosi e profondi',
      descrizione: 'Predilige strumenti ad ancia doppia, archi gravi e legni caldi: oboi, clarinetti, violoncelli, contrabbassi, arpa, pianoforte morbido e chitarre acustiche dal suono ampio e avvolgente. Tende a evitare sonorità eccessivamente metalliche o squillanti.'
    },
    ritmoBpm: {
      titolo: 'Andante (60–100 bpm), cadenze poetiche',
      descrizione: 'Ritmi non invasivi e tempi moderati (spesso tra 60 e 100 bpm) vicini alla ballad. Il tempo non viene vissuto come spinta alla corsa, ma come spazio in cui sostare per far sedimentare l\'emozione.'
    },
    armonieModi: {
      titolo: 'Modi minori, accordi larghi e cambi armonici suggestivi',
      descrizione: 'Predilige tonalità minori, accordi estesi (settima, nona) e modulazioni che risvegliano la memoria affettiva. Negli intervalli è attratto dalle terze minori e dalle settime maggiori (il colore dolce-amaro della nostalgia).'
    },
    ilMusicistaCheSei: {
      titolo: 'L\'interprete e il compositore intimo',
      descrizione: 'Ama interpretare e comporre più che eseguire meccanicamente o improvvisare sotto pressione. Cura il bel suono, sfuma le dinamiche e ricerca la sincerità espressiva: la musica deve parlare di verità emotiva.'
    }
  },

  Verde: {
    famiglia: 'Flemmatica',
    colore: '#16a34a',
    motto: 'L\'armonia che calma, il respiro dell\'insieme e la discrezione',
    timbri: {
      titolo: 'Timbri scuri, quieti, naturali e medio-bassi',
      descrizione: 'Fagotti, corni morbidi, flauti bassi, marimba, chitarra classica con corde di nylon, campane armoniche e legni naturali. Rifiuta i picchi aggressivi e predilige timbri che accarezzano l\'aria senza ferire.'
    },
    ritmoBpm: {
      titolo: 'Adagio e Andante dolce (50–75 bpm), respiro costante',
      descrizione: 'Cadenze dolci, andamenti lenti e regolari. Il ritmo asseconda il battito cardiaco rilassato e il respiro diaframmatico: allontana ogni frenesia e crea un\'oasi di protezione.'
    },
    armonieModi: {
      titolo: 'Armonie sospese, quinte aperte e melodie rarefatte',
      descrizione: 'Poche note, accordi larghi, lunghi pedali di tonica e quinta, assenza di brusche modulazioni. L\'armonia non serve a creare conflitto ma a costruire un clima di quiete sognante.'
    },
    ilMusicistaCheSei: {
      titolo: 'L\'accompagnatore meticoloso e il musicista d\'insieme',
      descrizione: 'Dà il meglio di sé nel gruppo, nella musica da camera e nell\'accompagnamento discreto. Legge con estrema precisione e cura il dettaglio d\'insieme; evita il protagonismo e l\'improvvisazione esposta.'
    }
  },

  Giallo: {
    famiglia: 'Entusiasta',
    colore: '#eab308',
    motto: 'La pulsazione vitale, il ritmo che accende e la gioia condivisa',
    timbri: {
      titolo: 'Timbri chiari, brillanti, luminosi e squillanti',
      descrizione: 'Percussioni vivaci, piatti, trombe, violini acuti, vibrafono, celesta, fiati brillanti e voce aperta. Ama la freschezza delle sonorità moderne ed elettroniche popolari, sempre alla ricerca di novità timbriche.'
    },
    ritmoBpm: {
      titolo: 'Allegro e vivace (110–160 bpm), pulsazione cinetica',
      descrizione: 'Ritmi accentuati, sincopati e trascinanti (110–160 bpm). Risponde naturalmente con il corpo, non può fare a meno di muoversi e tende a portare avanti l\'energia del tempo con slancio solare.'
    },
    armonieModi: {
      titolo: 'Modi maggiori solari, melodie chiare e canti riconoscibili',
      descrizione: 'Accordi maggiori, progressioni dirette e gioiose (I-IV-V), intervalli di sesta maggiore e settima minore. La melodia deve essere cantabile, immediata e vivace, evitando inutili complicazioni astratte.'
    },
    ilMusicistaCheSei: {
      titolo: 'Il trascinatore empatico e l\'energia di palco',
      descrizione: 'Suona con entusiasmo e fisicità, trascina il pubblico e i compagni, improvvisa con spontaneità senza timore dell\'errore. Canta con naturalezza e preferisce il palco condiviso alla stanza solitaria.'
    }
  },

  Rosso: {
    famiglia: 'Marziale',
    colore: '#dc2626',
    motto: 'L\'incisività, la direzione dell\'energia e il governo dell\'interplay',
    timbri: {
      titolo: 'Timbri centrali, decisi, solidi e poco modulanti',
      descrizione: 'Voce ferma, pianoforte acustico e tastiere solide, sassofoni, trombe e tromboni decisi, batteria (in particolare rullante e tom con cordiera tesa). Cerca suoni con una spina dorsale marcata.'
    },
    ritmoBpm: {
      titolo: 'Tempi Rock e moderati solidi (90–130 bpm), rigore sul battere',
      descrizione: 'Pulsazione costante e precisa: il marziale predilige il battere, tempi forti e metriche quadrate, ma sa apprezzare misure dispari e unisoni potenti quando creano tensione organizzata.'
    },
    armonieModi: {
      titolo: 'Unisoni potenti, accordi netti e intervalli incisivi',
      descrizione: 'Predilige melodie memorabili, unisoni orchestrali, scale chiare, riff energici e intervalli duri (prima, quarta giusta, ottava). L\'armonia deve avere una direzione evidente e non perdersi nel vago.'
    },
    ilMusicistaCheSei: {
      titolo: 'L\'esecutore rigoroso, il compositore strutturato e il leader',
      descrizione: 'Studia con metodo e disciplina, domina le regole armoniche e dirige con autorevolezza l\'interplay. Sul palco prende la scena con sicurezza; la sfida sta nel lasciarsi andare oltre la perfezione tecnica.'
    }
  },

  Grigio: {
    famiglia: 'Razionale',
    colore: '#64748b',
    motto: 'La lucidità critica, la sospensione e l\'esplorazione del dubbio',
    timbri: {
      titolo: 'Timbri sintetici, acustica asciutta e suoni neutri',
      descrizione: 'Sintesi sottrattiva, suoni processati digitalmente, onde pure, timbri freddi o privi di vibrato caldo. Ascolta il suono per la sua natura geometrica e frequenziale più che per calore viscerale.'
    },
    ritmoBpm: {
      titolo: 'Metriche complesse, poliritmie o sospensione temporale',
      descrizione: 'Il ritmo non è vissuto come spinta corporea ma come architettura numerica: cambi di tempo, scansioni asimmetriche (5/8, 7/8), poliritmie o momenti di totale sospensione a-ritmica.'
    },
    armonieModi: {
      titolo: 'Accordi aumentati, tritoni e armonie non risolte',
      descrizione: 'Scale esatonali, accordi diminuiti, accordi aperti senza terza definita e tensioni del tritono. Ama linguaggi che lasciano aperto l\'interrogativo senza rassicurare con cadenze convenzionali.'
    },
    ilMusicistaCheSei: {
      titolo: 'L\'analista del suono, il compositore concettuale e il ricercatore',
      descrizione: 'Affronta la musica come un sistema affascinante di relazioni matematiche ed estetiche. Compone con architetture raffinate, cura la spazializzazione del suono e osserva con distacco critico.'
    }
  }
}

export const COPPIE_ARTISTI_MUSSIDA = [
  {
    dimensione: 'Timbro',
    elemento: 'Terra sonora',
    domandaGuida: 'Questa musica ti porta verso la leggerezza aerea o verso il peso e la profondità della terra?',
    coppia: [
      {
        artista: 'Nicola Piovani',
        brano: 'Nel pancione della tv',
        polo: 'Verso la leggerezza',
        analisi: 'Un flusso gentile e arioso: gli strumenti d\'aria si passano la melodia con un sorriso discreto. L\'ironia lieve della prima parte si trasforma gradualmente in una dolce e disarmante tenerezza, lasciando un tocco di malinconica poesia.'
      },
      {
        artista: 'Paco de Lucía',
        brano: 'María de La O',
        polo: 'Verso la profondità e la terra',
        analisi: 'La chitarra flamenca scava nella radice della materia sonora: le corde non sono solo pizzicate ma accarezzate con rigore e rispetto profondo. Una malinconia solare in cui la gravità terrena incontra una maestria luminosa.'
      }
    ]
  },
  {
    dimensione: 'Ritmo',
    elemento: 'Acqua sonora',
    domandaGuida: 'Lo scorrere del tempo ti porta verso la contemplazione lenta di un fiume o verso l\'eccitazione veloce di un torrente?',
    coppia: [
      {
        artista: 'Mark Knopfler',
        brano: 'Wild Theme (da Local Hero)',
        polo: 'Verso la lentezza contemplativa',
        analisi: 'Un tempo calmo che scorre come un grande fiume osservato dall\'alto. Le variazioni essenziali della chitarra e gli arpeggi delicati non affrettano mai il passo: insegnano ad abitare il tempo senza doverlo consumare in fretta.'
      },
      {
        artista: 'Johann Sebastian Bach',
        brano: 'Variazione Goldberg n° 6 (Glenn Gould)',
        polo: 'Verso la velocità gioiosa',
        analisi: 'Due voci cristalline e brillanti corrono in parallelo rincorrendosi con perfetta sincronia. Come l\'acqua viva di un ruscello di montagna che salta gli ostacoli con esaltante limpidezza: una velocità che dona gioia ed energia pura.'
      }
    ]
  },
  {
    dimensione: 'Melodia',
    elemento: 'Aria sonora',
    domandaGuida: 'La traiettoria della linea melodica ti guida verso una fierezza gioiosa o verso una commovente fermezza nostalgica?',
    coppia: [
      {
        artista: 'Bill Conti',
        brano: 'Gonna Fly Now (Theme from Rocky)',
        polo: 'Verso la fermezza gioiosa',
        analisi: 'Una melodia solare che guarda dritto avanti a sé: l\'epicità della speranza, il coraggio che risponde alla fatica del corpo e si trasforma in vittoria condivisa, sollevando lo sguardo e il cuore con fierezza.'
      },
      {
        artista: 'Kenny G',
        brano: 'You Raise Me Up',
        polo: 'Verso la fermezza nostalgica',
        analisi: 'La stessa fermezza melodica, ma rivolta verso l\'interno e verso l\'alto. Un\'epicità intima che tocca le corde del ricordo, onorando chi ci ha sostenuto: la nostalgia che si scioglie in gratitudine commossa.'
      }
    ]
  },
  {
    dimensione: 'Intervallo',
    elemento: 'Luce sonora',
    domandaGuida: 'L\'intervallo armonico accende una luce diretta e solare oppure una luce riflessa e lunare?',
    coppia: [
      {
        artista: 'Max Steiner',
        brano: 'Theme From a Summer Place (Scandalo al sole)',
        polo: 'Verso la solarità luminosa',
        analisi: 'La melodia è librata in alto da un unisono d\'archi che non tocca terra: la sensazione del sole d\'estate sul mare, una luce diretta e consolatoria che rischiara ogni pensiero e scioglie le ombre nell\'orizzonte aperto.'
      },
      {
        artista: 'Chet Baker',
        brano: 'Almost Blue',
        polo: 'Verso la lunarità ombrosa',
        analisi: 'La tromba sussurra nel registro più basso e raccolto: un procedere lento nella penombra, luce riflessa e intimità malinconica. Uno spazio interiore protetto dove sostare senza paura del proprio chiaroscuro.'
      }
    ]
  },
  {
    dimensione: 'Armonia',
    elemento: 'Calore sonoro',
    domandaGuida: 'Gli accordi e l\'insieme delle voci orientano il calore verso il Noi interiore o verso il Noi sociale?',
    coppia: [
      {
        artista: 'Johann Sebastian Bach',
        brano: 'Aria sulla quarta corda (Swingle Singers)',
        polo: 'Verso il Noi interiore ed etico',
        analisi: 'Un calore intimo e purissimo: la gentilezza consolatrice dell\'armonia che agisce come lievito madre del sentimento umano. Compassione, dedizione e devozione vissute nel profondo dell\'anima individuale.'
      },
      {
        artista: 'Maurice Ravel',
        brano: 'Bolero',
        polo: 'Verso il Noi sociale e comunitario',
        analisi: 'Un crescendo orchestrale ipnotico che passa di strumento in strumento, accumulando calore e presenza fino all\'apoteosi: l\'immagine potente di una comunità che cammina unita e costruisce insieme il proprio futuro.'
      }
    ]
  }
]

export const NATURE_DETTAGLIO_12 = [
  {
    id: 'blu_malinconica_lunare_depressiva',
    famigliaId: 'blu_malinconica',
    famigliaNome: 'Malinconica',
    colorKey: 'blu',
    coloreFamiglia: '#2563eb',
    nome: 'Lunare Depressiva',
    campoDb: 'BLU_1_Depressiva',
    intervallo: 'Seconda minore',
    rapportoFrequenza: '16:15',
    evocativa: 'Buio profondo, chiusura, angoscia fertile, introspezione che scava nella parte più d\'ombra dell\'anima.',
    codiceSonoro: 'Attrito pungente di semitono: richiede risoluzione ma trattiene nell\'intimità silenziosa.',
    timbriEvocati: 'Violoncello grave, fagotto solo, registro basso del pianoforte con pedale d\'attesa.',
    attitudineMusicale: 'Ascolto meditativo, ricerca di risonanze scure, rifiuto della superficialità ritmica.'
  },
  {
    id: 'blu_malinconica_lunare_introspettiva',
    famigliaId: 'blu_malinconica',
    famigliaNome: 'Malinconica',
    colorKey: 'blu',
    coloreFamiglia: '#2563eb',
    nome: 'Lunare Introspettiva',
    campoDb: 'BLU_2_Lunare',
    intervallo: 'Terza minore',
    rapportoFrequenza: '6:5',
    evocativa: 'Luce riflessa della luna, intimità confidenziale, ballad modale, nostalgia dolce e non distruttiva.',
    codiceSonoro: 'Fondamento del modo minore: il passo morbido che apre la confidenza interiore.',
    timbriEvocati: 'Corno inglese, clarinetto in La, chitarra acustica a dita, arpa delicata.',
    attitudineMusicale: 'Composizione cantautoriale e intima, ricerca di modulazioni poetiche ed espressività del tocco.'
  },
  {
    id: 'blu_malinconica_nostalgica',
    famigliaId: 'blu_malinconica',
    famigliaNome: 'Malinconica',
    colorKey: 'blu',
    coloreFamiglia: '#2563eb',
    nome: 'Nostalgica',
    campoDb: 'BLU_3_Nostalgia',
    intervallo: 'Settima maggiore',
    rapportoFrequenza: '15:8',
    evocativa: 'Tensione dolce-amara, memoria affettiva, sguardo verso ciò che è stato e desiderio di ricongiungimento.',
    codiceSonoro: 'Intervallo sospeso prima della risoluzione: colore struggente della bossa nova e del jazz intimo.',
    timbriEvocati: 'Pianoforte a coda, flicorno, archi in sordina, armonica cromatica.',
    attitudineMusicale: 'Armonie aperte, accordi di settima e nona, frasi che lasciano sospeso il finale.'
  },
  {
    id: 'blu_malinconica_solare',
    famigliaId: 'blu_malinconica',
    famigliaNome: 'Malinconica',
    colorKey: 'blu',
    coloreFamiglia: '#2563eb',
    nome: 'Solare',
    campoDb: 'BLU_4_Solare',
    intervallo: 'Terza maggiore',
    rapportoFrequenza: '5:4',
    evocativa: 'Risveglio della speranza, luce che rischiara la malinconia, apertura lirica e consolatoria.',
    codiceSonoro: 'Pilastro del modo maggiore: porta la serenità e il sorriso dentro il sentire profondo.',
    timbriEvocati: 'Oboe solista, violino cantabile, chitarra classica brillante, flauto dolce soprano.',
    attitudineMusicale: 'Melodie cantabili e liriche, cadenze dolci, equilibrio tra riflessione e apertura al mondo.'
  },
  {
    id: 'rosso_marziale_volitiva',
    famigliaId: 'rosso_marziale',
    famigliaNome: 'Marziale',
    colorKey: 'rosso',
    coloreFamiglia: '#dc2626',
    nome: 'Volitiva',
    campoDb: 'ROSSO_1_Assertivita',
    intervallo: 'Prima (Unisono)',
    rapportoFrequenza: '1:1',
    evocativa: 'Determinazione, presenza assoluta, coincidenza dell\'Io, spinta netta all\'azione e attacco preciso.',
    codiceSonoro: 'Punto di ancoraggio: l\'unisono energico che unisce le forze e dà il via al movimento.',
    timbriEvocati: 'Batteria con rullante teso, pianoforte martellato, ottoni potenti, chitarra elettrica ritmica.',
    attitudineMusicale: 'Rigore sul tempo, leadership esecutiva, riff precisi e controllo assoluto della dinamica.'
  },
  {
    id: 'rosso_marziale_collerica',
    famigliaId: 'rosso_marziale',
    famigliaNome: 'Marziale',
    colorKey: 'rosso',
    coloreFamiglia: '#dc2626',
    nome: 'Collerica',
    campoDb: 'ROSSO_2_Dubbio_Collera',
    intervallo: 'Quarta eccedente (Tritono) / Ottava',
    rapportoFrequenza: '45:32 (Tritono) / 2:1 (Ottava)',
    evocativa: 'Tensione estrema, urgenza di rottura, fuoco trasformativo, rifiuto della stasi e liberazione dinamica.',
    codiceSonoro: 'Massima dissonanza dinamica (tritono) che spinge alla conquista della compiutezza sonora (ottava).',
    timbriEvocati: 'Chitarra distorta, timpani orchestrali, piatti crash, sax tenore graffiante.',
    attitudineMusicale: 'Improvvisazione viscerale, impatto scenico ad alto voltaggio, cambi improvvisi di dinamica.'
  },
  {
    id: 'verde_flemmatica_calma_contemplativa',
    famigliaId: 'verde_flemmatica',
    famigliaNome: 'Flemmatica',
    colorKey: 'verde',
    coloreFamiglia: '#16a34a',
    nome: 'Calma Contemplativa',
    campoDb: 'VERDE_1_CalmaContemplativa',
    intervallo: 'Quinta giusta',
    rapportoFrequenza: '3:2',
    evocativa: 'Pace dell\'anima, respiro cosmico, orizzonte aperto, stabilità rassicurante e assenza di conflitto.',
    codiceSonoro: 'La consonanza naturale più perfetta: intervallo su cui poggiano tutte le armonie del mondo.',
    timbriEvocati: 'Flauto traverso basso, campane tibetane, chitarra acustica accordata in Open D, bordoni d\'organo.',
    attitudineMusicale: 'Musica d\'ambiente, accompagnamento discreto, cura meticolosa dell\'insieme e del silenzio.'
  },
  {
    id: 'verde_flemmatica_calma_fisica',
    famigliaId: 'verde_flemmatica',
    famigliaNome: 'Flemmatica',
    colorKey: 'verde',
    coloreFamiglia: '#16a34a',
    nome: 'Calma Fisica',
    campoDb: 'VERDE_2_CalmaFisica',
    intervallo: 'Quinta eccedente',
    rapportoFrequenza: '25:16',
    evocativa: 'Rilassamento muscolare profondo, rigenerazione corporea, abbandono delle difese, tempo lento.',
    codiceSonoro: 'Espansione lieve della quinta che suggerisce galleggiamento e sospensione senza gravità.',
    timbriEvocati: 'Marimba calda, arpa celtica, violoncello sostenuto, onde sinusoidali soffuse.',
    attitudineMusicale: 'Suonare per il benessere psicofisico proprio e altrui, senza ambizione di esibizione frenetica.'
  },
  {
    id: 'giallo_entusiasta_gioiosa_solare',
    famigliaId: 'giallo_entusiasta',
    famigliaNome: 'Entusiasta',
    colorKey: 'giallo',
    coloreFamiglia: '#eab308',
    nome: 'Gioiosa Solare',
    campoDb: 'GIALLO_1_Gioia_Entusiasmo',
    intervallo: 'Sesta maggiore',
    rapportoFrequenza: '5:3',
    evocativa: 'Festa interiore, ottimismo vitale, luminosità radiosa, sorriso che accoglie e condivisione spontanea.',
    codiceSonoro: 'Intervallo melodico della tenerezza e della gioia aperta: tipico dei grandi temi solari.',
    timbriEvocati: 'Tromba brillante, mandolino, celesta, violino solista nel registro acuto, voce corale.',
    attitudineMusicale: 'Capacità di coinvolgere e divertire, spontaneità nel cantare, facilità melodica immediata.'
  },
  {
    id: 'giallo_entusiasta_sanguigna_operosa',
    famigliaId: 'giallo_entusiasta',
    famigliaNome: 'Entusiasta',
    colorKey: 'giallo',
    coloreFamiglia: '#eab308',
    nome: 'Sanguigna Operosa',
    campoDb: 'GIALLO_2_Volitivo_Passionale',
    intervallo: 'Settima minore',
    rapportoFrequenza: '16:9',
    evocativa: 'Pulsione cinetica, ritmo inarrestabile, passione calorosa, slancio verso il fare e groove corporeo.',
    codiceSonoro: 'Colonna vertebrale del Blues, del Funk e del Rock\'n\'Roll: crea l\'irresistibile urgenza di muoversi.',
    timbriEvocati: 'Basso elettrico slap, organo Hammond, fiati funky, tamburi e percussioni afrocubane.',
    attitudineMusicale: 'Groove trascinante, interplay caloroso, generosità esecutiva e comunicazione visiva.'
  },
  {
    id: 'grigio_razionale_anaffettiva',
    famigliaId: 'grigio_razionale',
    famigliaNome: 'Razionale',
    colorKey: 'grigio',
    coloreFamiglia: '#64748b',
    nome: 'Anaffettiva',
    campoDb: 'GRIGIO_1_Anaffettiva',
    intervallo: 'Timbri non naturali (Pura Informazione)',
    rapportoFrequenza: 'Spettro sintetico',
    evocativa: 'Lucidità chirurgica, sospensione del giudizio emotivo, decodifica geometrica e distanza asettica.',
    codiceSonoro: 'Timbri sintetici e processati che non imitano strumenti organici ma trasmettono pura architettura.',
    timbriEvocati: 'Sintetizzatori FM, onde quadre filtrate, riverberi digitali a zero calore, glitch percussivi.',
    attitudineMusicale: 'Composizione algoritmica, sound design, analisi meticolosa delle frequenze e mastering di precisione.'
  },
  {
    id: 'grigio_razionale_distaccata',
    famigliaId: 'grigio_razionale',
    famigliaNome: 'Razionale',
    colorKey: 'grigio',
    coloreFamiglia: '#64748b',
    nome: 'Distaccata',
    campoDb: 'GRIGIO_2_Distaccata',
    intervallo: 'Timbri computazionali (Astrazione)',
    rapportoFrequenza: 'Poliritmia / Cluster',
    evocativa: 'Osservazione dall\'alto, contemplazione delle strutture astratte, mente libera da passioni travolgenti.',
    codiceSonoro: 'Accordi aperti, polimetrie asimmetriche (5/4, 7/8), cluster e paesaggi sonori rarefatti.',
    timbriEvocati: 'Pianoforte preparato, synth granulare, suoni microtonali, campionamenti concreti.',
    attitudineMusicale: 'Ricerca sperimentale, studio delle relazioni matematiche tra i suoni, avanguardia contemporanea.'
  }
]

