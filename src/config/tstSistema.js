/**
 * SISTEMA TST — FONTE UNICA DI VERITÀ
 * ===================================
 * Regola da leggere sempre: famiglie, nature, intervalli, passi del test e
 * regole di punteggio si leggono SOLO da questo file. Nessun altro modulo deve
 * riscrivere a mano nomi, colori, chiavi o assegnazioni.
 *
 * Fonte teorica: "PAROLE PER TST" — Franco Mussida, 29 agosto 2026.
 * Il lessico (aggettivi, sostantivi, parole chiave, sintesi, parole ponte) vive
 * in src/content/paroleTst.js ed è agganciato alle nature tramite `campoDb`.
 *
 * MODELLO A CESTE
 * ---------------
 * Il suono è solo lo stimolo. È la RISPOSTA a decidere dove vanno i punti.
 * Ogni risposta mette `punti` in una cesta:
 *
 *     cesta = natura (→ famiglia) × portato (simpatia | antipatia | indifferenza)
 *
 * Il risultato di un test è la tabella 12 nature × 3 portati. Tutto il resto
 * (totali per natura, per famiglia, per portato, per sezione, prevalenze) si
 * ricava sommando le ceste. Vedi src/utils/cesteTst.js.
 *
 * NOMI
 * ----
 * Ogni natura si chiama "Colore · Famiglia · Natura" (campo `etichetta`) e ha
 * id tecnico `colore_famiglia_natura`. Il campo `campoDb` è il nome storico del
 * contatore su Firestore: resta invariato per leggere i test già salvati.
 */

export const FONTE_TEORICA = 'PAROLE PER TST — Franco Mussida, 29 agosto 2026'

/* ── Versione del modello ──────────────────────────────────────────────── */

/**
 * Versione del modello di punteggio (12 nature, ceste). Ogni nuovo test la
 * salva nel campo `versione_modello`. Va incrementata quando cambiano nature,
 * pesi o regole, così i test già salvati restano leggibili col loro modello.
 */
export const VERSIONE_MODELLO = '2026_v3'

/** Versione assunta per i test salvati prima che esistesse `versione_modello` (modello a 11 correnti). */
export const VERSIONE_MODELLO_LEGACY = '2025_v1'

/* ── Portato esperienziale ─────────────────────────────────────────────── */

export const PORTATI = Object.freeze([
  { id: 'simpatia', nome: 'Simpatia', campoDb: 'PE_Simpatia' },
  { id: 'antipatia', nome: 'Antipatia', campoDb: 'PE_Antipatia' },
  { id: 'indifferenza', nome: 'Indifferenza', campoDb: 'PE_Indifferenza' },
])

/* ── Famiglie (ordine = ordine storico di parità) ──────────────────────── */

export const FAMIGLIE = Object.freeze([
  { id: 'blu_malinconica', colorKey: 'blu', colore: 'Blu', nome: 'Malinconica', etichetta: 'Blu · Malinconica' },
  { id: 'rosso_marziale', colorKey: 'rosso', colore: 'Rosso', nome: 'Marziale', etichetta: 'Rosso · Marziale' },
  { id: 'verde_flemmatica', colorKey: 'verde', colore: 'Verde', nome: 'Flemmatica', etichetta: 'Verde · Flemmatica' },
  { id: 'giallo_entusiasta', colorKey: 'giallo', colore: 'Giallo', nome: 'Entusiasta', etichetta: 'Giallo · Entusiasta' },
  { id: 'grigio_razionale', colorKey: 'grigio', colore: 'Grigio', nome: 'Razionale', etichetta: 'Grigio · Razionale' },
])

/* ── Nature (12, dal PDF) ──────────────────────────────────────────────── */

function natura(famigliaId, slug, nome, campoDb, intervallo, extra = {}) {
  const famiglia = FAMIGLIE.find((f) => f.id === famigliaId)
  return Object.freeze({
    id: `${famigliaId}_${slug}`,
    famigliaId,
    colorKey: famiglia.colorKey,
    nome,
    etichetta: `${famiglia.colore} · ${famiglia.nome} · ${nome}`,
    campoDb,
    intervallo,
    ...extra,
  })
}

export const NATURE = Object.freeze([
  natura('blu_malinconica', 'lunare_depressiva', 'Lunare Depressiva', 'BLU_1_Depressiva', 'Seconda minore'),
  natura('blu_malinconica', 'lunare_introspettiva', 'Lunare Introspettiva', 'BLU_2_Lunare', 'Terza minore'),
  natura('blu_malinconica', 'nostalgica', 'Nostalgica', 'BLU_3_Nostalgia', 'Settima maggiore', {
    notaIntervallo: "Nell'indice del PDF: 'Settima minore e maggiore' — da confermare con Mussida.",
  }),
  natura('blu_malinconica', 'solare', 'Solare', 'BLU_4_Solare', 'Terza maggiore'),
  natura('rosso_marziale', 'volitiva', 'Volitiva', 'ROSSO_1_Assertivita', 'Prima'),
  natura('rosso_marziale', 'collerica', 'Collerica', 'ROSSO_2_Dubbio_Collera',
    'Quarta e quarta eccedente (polo negativo) · Ottava (polo positivo)'),
  natura('verde_flemmatica', 'calma_contemplativa', 'Calma Contemplativa', 'VERDE_1_CalmaContemplativa', 'Quinta'),
  natura('verde_flemmatica', 'calma_fisica', 'Calma Fisica', 'VERDE_2_CalmaFisica', 'Quinta eccedente', {
    notaIntervallo: "Nell'indice del PDF: 'Quinta' e nome 'Calma Fisico temporale' — da confermare con Mussida.",
  }),
  natura('giallo_entusiasta', 'gioiosa_solare', 'Gioiosa Solare', 'GIALLO_1_Gioia_Entusiasmo', 'Sesta'),
  natura('giallo_entusiasta', 'sanguigna_operosa', 'Sanguigna Operosa', 'GIALLO_2_Volitivo_Passionale', 'Settima minore'),
  natura('grigio_razionale', 'anaffettiva', 'Anaffettiva', 'GRIGIO_1_Anaffettiva',
    'Timbri non naturali (tradotti come informazioni)'),
  natura('grigio_razionale', 'distaccata', 'Distaccata', 'GRIGIO_2_Distaccata', '', {
    notaIntervallo: 'Il PDF non indica un intervallo per la natura Distaccata — da confermare con Mussida.',
  }),
])

const N = Object.fromEntries(NATURE.map((n) => [n.id, n.id]))

/* ── Regole di punteggio: ogni opzione di risposta → una cesta ─────────── */
/*
 * Ogni riga: risposta → natura (e quindi famiglia) → portato → punti.
 * Il portato è un campo della riga: si può cambiare risposta per risposta.
 * L'ordine delle righe è l'ordine dei bottoni mostrati nel test.
 */

const r = (risposta, naturaId, portato, punti = 1) => Object.freeze({ risposta, natura: naturaId, portato, punti })

export const REGOLE_RISPOSTE = {
  /** Le 15 sensazioni. */
  SENSAZIONI: Object.freeze([
    r('Mi dà gioia', N.giallo_entusiasta_gioiosa_solare, 'simpatia'),
    r('Mi inquieta', N.rosso_marziale_collerica, 'antipatia'),
    r('Mi spegne', N.blu_malinconica_lunare_depressiva, 'antipatia'),
    r('Mi stupisce', N.giallo_entusiasta_gioiosa_solare, 'simpatia'),
    r('Mi rilassa', N.verde_flemmatica_calma_fisica, 'simpatia'),
    r('Mi disturba / mi repelle', N.rosso_marziale_collerica, 'antipatia'),
    r('Mi è indifferente', N.grigio_razionale_distaccata, 'indifferenza'),
    r('Mi calma / mi fa sognare', N.verde_flemmatica_calma_contemplativa, 'simpatia'),
    r('Mi accende / mi motiva', N.rosso_marziale_volitiva, 'simpatia'),
    r('Mi irrita / mi infastidisce', N.rosso_marziale_collerica, 'antipatia'),
    r('Mi annoia / mi stufa', N.grigio_razionale_distaccata, 'antipatia'),
    r('Mi completa / mi incoraggia', N.rosso_marziale_volitiva, 'simpatia'),
    r('Mi fa riflettere / mi porta a ricordare', N.blu_malinconica_nostalgica, 'simpatia'),
    r('Mi arrovella / mi rattrista', N.blu_malinconica_lunare_introspettiva, 'antipatia'),
    r('Mi accompagna / mi consola', N.blu_malinconica_solare, 'simpatia'),
  ]),

  /** I 14 aggettivi (triadi). Parole da verificare sul PDF: vedi DA_DECIDERE. */
  AGGETTIVI: Object.freeze([
    r('Saldo - sicuro - volitivo', N.rosso_marziale_volitiva, 'simpatia'),
    r('Sognante - meditativo - ascetico', N.verde_flemmatica_calma_contemplativa, 'simpatia'),
    r('Angosciato - avvilito - sofferente', N.blu_malinconica_lunare_depressiva, 'antipatia'),
    r('Sereno - fiducioso - aperto', N.blu_malinconica_solare, 'simpatia'),
    r('Malinconico - triste - pensieroso', N.blu_malinconica_lunare_introspettiva, 'simpatia'),
    r('Rabbioso - diffidente - dubbioso', N.rosso_marziale_collerica, 'antipatia'),
    r('Ambiguo - incerto - equivoco', N.rosso_marziale_collerica, 'antipatia'),
    r('Calmo - prudente - lento', N.verde_flemmatica_calma_fisica, 'simpatia'),
    r('Gioioso - caloroso - festoso', N.giallo_entusiasta_gioiosa_solare, 'simpatia'),
    r('Dinamico - curioso - fluido', N.giallo_entusiasta_sanguigna_operosa, 'simpatia'),
    r('Nostalgico - rimembrante - afflitto', N.blu_malinconica_nostalgica, 'simpatia'),
    r('Desolato - rimpiangente - abbandonato', N.blu_malinconica_nostalgica, 'antipatia'),
    r('Illuminato - amorevole - passionale', N.giallo_entusiasta_sanguigna_operosa, 'simpatia'),
    r('Mi è indifferente', N.grigio_razionale_distaccata, 'indifferenza'),
  ]),

  /*
   * Affinità (passi 1–4, 46, 51, 58): i punti dipendono dal singolo suono,
   * non dalla posizione del bottone. Le tabelle sono in AFFINITA_PER_PASSO;
   * qui restano i riferimenti usati dall'interfaccia per disegnare i bottoni.
   */
}


/* ── Affinità: ogni suono → la sua natura ────────────────────────────── */
/*
 * Fonte: modello Excel 2025 (rev. 11.04.2025), che assegna ogni suono a una
 * corrente. L'ordine dei suoni dentro i file 46, 51 e 58 è stato verificato
 * confrontando i riascolti con i file originali (somiglianza ≥ 0,9).
 * Corrispondenza correnti 2025 → nature 2026 (convenzione già in uso):
 * Entusiasmo → Gioiosa Solare, Calma → Calma Fisica, Volitività → Volitiva,
 * Malinconia → Solare (passi 1–4) o Nostalgica (passi 46, 51, 58): da confermare con Mussida.
 */

const suono = (n, nome, naturaId, punti = 1) =>
  Object.freeze({ risposta: `opzione${n}`, suono: nome, natura: naturaId, portato: 'simpatia', punti })
const nessuna = (punti = 1) =>
  Object.freeze({ risposta: 'nessuna', suono: 'Nessuna delle 4', natura: N.grigio_razionale_anaffettiva, portato: 'indifferenza', punti })

const GIO = N.giallo_entusiasta_gioiosa_solare
const CAF = N.verde_flemmatica_calma_fisica
const VOL = N.rosso_marziale_volitiva
const SOL = N.blu_malinconica_solare
const NOS = N.blu_malinconica_nostalgica

export const AFFINITA_PER_PASSO = Object.freeze({
  1: Object.freeze([suono(1, 'Ottavino', GIO), suono(2, 'Oboe', CAF), suono(3, 'Tromba', VOL), suono(4, 'Violino', SOL), nessuna()]),
  2: Object.freeze([suono(1, 'Flauto', GIO), suono(2, 'Clarinetto', VOL), suono(3, 'Corno', CAF), suono(4, 'Viola', SOL), nessuna()]),
  3: Object.freeze([suono(1, 'Flauto basso', GIO), suono(2, 'Fagotto', VOL), suono(3, 'Trombone', CAF), suono(4, 'Violoncello', SOL), nessuna()]),
  4: Object.freeze([suono(1, 'Triangolo', GIO), suono(2, 'Campana tibetana', CAF), suono(3, 'Celesta', VOL), suono(4, 'Vibrafono', SOL), nessuna()]),
  46: Object.freeze([suono(1, 'Groove 57 bpm', NOS, 2), suono(2, 'Groove 77 bpm', CAF, 2), suono(3, 'Groove 105 bpm', VOL, 2), suono(4, 'Groove 150 bpm', GIO, 2), nessuna(2)]),
  51: Object.freeze([suono(1, 'Ritmo ondulato', NOS), suono(2, 'Ritmo binario', VOL), suono(3, 'Ritmo ternario', CAF), suono(4, 'Ritmo sincopato', GIO), nessuna()]),
  58: Object.freeze([suono(1, 'Arpa ascendente maggiore', GIO), suono(2, 'Arpa ascendente minore', NOS), suono(3, 'Arpa discendente maggiore', VOL), suono(4, 'Arpa discendente minore', CAF), nessuna()]),
})

// Riferimenti per l'interfaccia (servono solo gli id dei bottoni: opzione1…4, nessuna).
REGOLE_RISPOSTE.AFFINITA_BASE = AFFINITA_PER_PASSO[1]
REGOLE_RISPOSTE.AFFINITA_ECCEZIONE = AFFINITA_PER_PASSO[46]
REGOLE_RISPOSTE.AFFINITA_STANDARD = AFFINITA_PER_PASSO[51]
Object.freeze(REGOLE_RISPOSTE)

/** Tipi di domanda che leggono un dizionario di parole (il peso del passo li moltiplica). */
export const TIPI_A_DIZIONARIO = Object.freeze(['SENSAZIONI', 'AGGETTIVI'])

/* ── Sezioni musicali del test (= lettera nel nome del file audio) ─────── */

export const SEZIONI = Object.freeze([
  { id: 'A_TIMBRO', lettera: 'A', nome: 'Timbro', da: 1, a: 28 },
  { id: 'B_INTERVALLI', lettera: 'B', nome: 'Intervalli', da: 29, a: 41 },
  { id: 'C_RITMO', lettera: 'C', nome: 'Ritmo', da: 42, a: 51 },
  { id: 'D_MELODIA', lettera: 'D', nome: 'Melodia', da: 52, a: 58 },
  { id: 'E_ARMONIA', lettera: 'E', nome: 'Armonia', da: 59, a: 72 },
])

/** I quattro rapporti: quali sezioni sommano. */
export const RAPPORTI = Object.freeze({
  natura: ['A_TIMBRO', 'B_INTERVALLI', 'E_ARMONIA'],
  se: ['B_INTERVALLI', 'D_MELODIA'],
  altro: ['A_TIMBRO', 'D_MELODIA'],
  agire: ['C_RITMO', 'D_MELODIA'],
})

/* ── I 72 passi del test ───────────────────────────────────────────────── */
/*
 * tipoDomanda: quale tabella di REGOLE_RISPOSTE usare.
 * peso: moltiplica i punti delle risposte a dizionario (sensazioni, aggettivi).
 * riconferma: +1 extra alla stessa cesta.
 * audio: numero del file mp3 effettivamente riprodotto.
 */

function tipoDomandaPerPasso(n) {
  if (n <= 4) return 'AFFINITA_BASE'
  if (n <= 28) return 'SENSAZIONI'
  if (n <= 42) return 'AGGETTIVI'
  if (n === 46) return 'AFFINITA_ECCEZIONE'
  if (n === 51 || n === 58) return 'AFFINITA_STANDARD'
  return 'SENSAZIONI'
}

const RICONFERME = Object.freeze({ 41: 29, 42: 40 })

export const PASSI = Object.freeze(
  Array.from({ length: 72 }, (_, i) => {
    const numero = i + 1
    const sezione = SEZIONI.find((s) => numero >= s.da && numero <= s.a)
    return Object.freeze({
      numero,
      campoDb: `File_${String(numero).padStart(2, '0')}`,
      sezione: sezione.id,
      tipoDomanda: tipoDomandaPerPasso(numero),
      peso: numero >= 42 && numero <= 46 ? 2 : 1,
      riconferma: numero in RICONFERME,
      audio: RICONFERME[numero] || numero,
    })
  }),
)

/* ── Punti aperti, da decidere con Mussida ─────────────────────────────── */

export const DA_DECIDERE = Object.freeze([
  'Passi 41 e 42: sono riconferme che riascoltano i file 29 (Unisono) e 40 (7a maggiore). I file audio 41 (8a giusta) e 42 (Groove 57 bpm) non vengono mai fatti ascoltare, ma i passi 41–42 sono contati nelle sezioni Intervalli e Ritmo.',
  "Aggettivi: 'Illuminato' non è nel PDF; 'Amorevole' nel PDF è Blu · Malinconica · Solare ma porta punti a Giallo · Entusiasta · Sanguigna Operosa; 'Dinamico' è nella lista della Gioiosa Solare ma porta punti alla Sanguigna Operosa.",
  'Intervalli: Nostalgica (settima maggiore o anche minore?) e Calma Fisica (quinta o quinta eccedente?).',
  'Ceste mai raggiungibili: Collerica in simpatia (polo positivo, ottava), Sanguigna Operosa nelle 15 sensazioni, Anaffettiva solo da “nessuna” nelle affinità.',
])

/* ── Indici e helper ───────────────────────────────────────────────────── */

export const FAMIGLIA_BY_ID = Object.freeze(Object.fromEntries(FAMIGLIE.map((f) => [f.id, f])))
export const FAMIGLIA_BY_COLOR = Object.freeze(Object.fromEntries(FAMIGLIE.map((f) => [f.colorKey, f])))
export const NATURA_BY_ID = Object.freeze(Object.fromEntries(NATURE.map((n) => [n.id, n])))
export const NATURA_BY_CAMPO = Object.freeze(Object.fromEntries(NATURE.map((n) => [n.campoDb, n])))
export const PORTATO_BY_ID = Object.freeze(Object.fromEntries(PORTATI.map((p) => [p.id, p])))
export const PORTATO_BY_CAMPO = Object.freeze(Object.fromEntries(PORTATI.map((p) => [p.campoDb, p])))

/** Campi Firestore delle nature, nell'ordine storico. */
export const CAMPI_NATURE = Object.freeze(NATURE.map((n) => n.campoDb))

/** colorKey → campi Firestore delle sue nature. */
export const CAMPI_PER_COLORE = Object.freeze(
  Object.fromEntries(FAMIGLIE.map((f) => [f.colorKey, NATURE.filter((n) => n.colorKey === f.colorKey).map((n) => n.campoDb)])),
)

export function getPasso(numero) {
  return PASSI[Number(numero) - 1] || null
}

export function getRegolePerPasso(numero) {
  const passo = getPasso(numero)
  if (!passo) return []
  return AFFINITA_PER_PASSO[passo.numero] || REGOLE_RISPOSTE[passo.tipoDomanda] || []
}

export function getNaturaByCampo(campoDb) {
  return NATURA_BY_CAMPO[campoDb] || null
}

/** Nome breve della natura (es. "Lunare Depressiva") da campo Firestore o id. */
export function nomeNatura(campoOId) {
  return (NATURA_BY_CAMPO[campoOId] || NATURA_BY_ID[campoOId])?.nome || ''
}

/** Nome della famiglia dal colorKey (es. 'rosso' → 'Marziale'). */
export function nomeFamiglia(colorKey) {
  return FAMIGLIA_BY_COLOR[colorKey]?.nome || ''
}

/**
 * Riconosce una famiglia da un'etichetta salvata, nuova o storica
 * ('Marziale', 'Volitività', 'Rosso', 'rosso_marziale' …). Restituisce il colorKey.
 */
export function colorKeyDaEtichetta(valore) {
  const v = String(valore || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  if (!v) return ''
  const alias = {
    blu: ['blu', 'malinconi'],
    rosso: ['rosso', 'marzial', 'volitiv', 'collerico'],
    verde: ['verde', 'flemmatic', 'calma'],
    giallo: ['giallo', 'entusias'],
    grigio: ['grigio', 'razional', 'anaffettiv', 'agnostic'],
  }
  for (const [colorKey, prefissi] of Object.entries(alias)) {
    if (prefissi.some((p) => v.includes(p))) return colorKey
  }
  return ''
}
