/**
 * Report per musicisti — contenuti delle stanze 2–7.
 *
 * Solo fonti di contesto del progetto, riformulate in tono aperto e senza nomi
 * d'autore. Le nature si citano solo dove le fonti concordano; dove non
 * concordano (Volitiva, Calma Fisica, settima minore, ottava) non si mostra
 * nessuna natura finché la corrispondenza non è confermata.
 * `file`: numero del file audio del test.
 */

/* ── Stanza 2 · Le distanze (dal basso all'alto) ── */
export const DISTANZE = Object.freeze([
  { file: 29, nome: 'Unisono', semitoni: 0, clima: 'La casa: il suono da cui si parte e a cui si torna.' },
  { file: 31, nome: 'Seconda minore', semitoni: 1, clima: 'Può far sentire il distacco, l’inquietudine, una certa paura di essersi allontanati.', natura: 'Lunare Depressiva', famiglia: 'Blu' },
  { file: 30, nome: 'Seconda maggiore', semitoni: 2, clima: 'Può portare con sé pessimismo e sfiducia.' },
  { file: 33, nome: 'Terza minore', semitoni: 3, clima: 'Una luce riflessa: si riflette su di sé, con un sottile dolore.', natura: 'Lunare Introspettiva', famiglia: 'Blu' },
  { file: 32, nome: 'Terza maggiore', semitoni: 4, clima: 'Può far nascere fiducia e speranza.', natura: 'Solare', famiglia: 'Blu' },
  { file: 34, nome: 'Quarta giusta', semitoni: 5, clima: 'Ci si può sentire sospesi tra il dentro e il fuori.' },
  { file: 35, nome: 'Quarta eccedente', semitoni: 6, clima: 'Il punto centrale della scala: ambiguità, dubbio.', natura: 'Collerica', famiglia: 'Rosso' },
  { file: 36, nome: 'Quinta giusta', semitoni: 7, clima: 'Un equilibrio che invita alla contemplazione.', natura: 'Calma Contemplativa', famiglia: 'Verde' },
  { file: 38, nome: 'Sesta minore', semitoni: 8, clima: '' },
  { file: 37, nome: 'Sesta maggiore', semitoni: 9, clima: 'Può portare gioia ed entusiasmo.', natura: 'Gioiosa Solare', famiglia: 'Giallo' },
  { file: 39, nome: 'Settima minore', semitoni: 10, clima: 'Ci si avvicina alla nostalgia.' },
  { file: 40, nome: 'Settima maggiore', semitoni: 11, clima: 'Una nostalgia luminosa, vicina alla saudade.', natura: 'Nostalgica', famiglia: 'Blu' },
  { file: 41, nome: 'Ottava', semitoni: 12, clima: 'La stessa nota, più alta: il punto d’arrivo.' },
])

/* ── Stanza 3 · I timbri ── */
export const GRUPPI_TIMBRI = Object.freeze([
  { titolo: 'Fiati', file: [5, 6, 7, 8, 9, 10, 11, 12] },
  { titolo: 'Percussioni', file: [13, 14, 15, 16, 17, 18, 19, 20] },
  { titolo: 'Corde', file: [21, 22, 23, 24, 25, 26, 27, 28] },
])

/** Strumenti del test che le fonti avvicinano a ciascuna famiglia. */
export const TIMBRI_FAMIGLIA = Object.freeze({
  Verde: { zona: 'Timbri scuri e quieti, medio-bassi.', file: [6, 7, 12, 25] },
  Blu: { zona: 'Timbri medi che pesano verso il basso, scuri e puliti.', file: [8, 10, 21, 23, 24, 25, 27] },
  Rosso: { zona: 'Timbri decisi e ruvidi, centrali ma anche negli estremi.', file: [9, 11, 20, 26] },
  Giallo: { zona: 'Timbri chiari e brillanti, medio-alti e alti.', file: [11, 13, 14, 16, 17, 19, 28] },
  Grigio: { zona: 'I timbri non naturali tendono a essere ascoltati come informazioni.', file: [] },
})

/* ── Stanza 4 · Il tempo e il ritmo ── */
export const FASCE_TEMPO = Object.freeze([
  { famiglia: 'Verde', da: 50, a: 70, nota: 'Adagio o Andante, fino a circa 70 bpm' },
  { famiglia: 'Blu', da: 60, a: 100, nota: 'Andante, intorno ai 60–100 bpm' },
  { famiglia: 'Rosso', da: 90, a: 130, nota: 'Tempi forti e costanti, 90–130 bpm' },
  { famiglia: 'Giallo', da: 110, a: 160, nota: 'Allegro, intorno ai 110–160 bpm' },
])
export const GROOVE = Object.freeze([
  { file: 42, bpm: 57 }, { file: 43, bpm: 77 }, { file: 44, bpm: 105 }, { file: 45, bpm: 150 },
])
export const RITMI = Object.freeze([47, 48, 49, 50])

/* ── Stanza 5 · Melodia e armonia (coppie A/B) ── */
export const COPPIE_MELODIA = Object.freeze([
  { titolo: 'Salire: maggiore o minore', a: 53, b: 54 },
  { titolo: 'Scendere: maggiore o minore', a: 55, b: 56 },
  { titolo: 'Girare o saltare', a: 52, b: 57 },
])
export const COPPIE_ARMONIA = Object.freeze([
  { titolo: 'Do e La minore', a: 59, b: 60 },
  { titolo: 'Do e Fa', a: 61, b: 62 },
  { titolo: 'Do e Mi minore', a: 64, b: 63 },
  { titolo: 'La minore e Re minore', a: 65, b: 66 },
  { titolo: 'Do e Si diminuito', a: 69, b: 67 },
  { titolo: 'Do/Mi e Mi♭ diminuito settima', a: 70, b: 68 },
  { titolo: 'Do e Sol', a: 71, b: 72 },
])
export const MODI_FAMIGLIA = Object.freeze([
  { famiglia: 'Verde', testo: 'Un’armonia sospesa, con pochi movimenti di accordi e molte quinte.' },
  { famiglia: 'Blu', testo: 'I modi minori, gli accordi larghi, i cambi di tonalità.' },
  { famiglia: 'Rosso', testo: 'Gli unisoni pieni, le scale con intervalli duri come la seconda.' },
  { famiglia: 'Giallo', testo: 'Armonie semplici e luminose, nei modi maggiori.' },
])

/* ── Stanza 6 · Ascolto guidato ── */
export const ELEMENTI_ASCOLTO = Object.freeze([
  {
    nome: 'Terra', codice: 'Il timbro',
    domande: ['Questa musica ti dà un senso di peso o di leggerezza?', 'Ti porta dentro di te, o fuori?'],
    brani: [
      { autore: 'Nicola Piovani', titolo: 'Nel pancione della tv', direzione: 'Verso la leggerezza' },
      { autore: 'Paco de Lucía', titolo: 'María de La O', direzione: 'Verso la profondità' },
    ],
  },
  {
    nome: 'Acqua', codice: 'Il tempo e il ritmo',
    domande: ['A che movimento accosti questo flusso: un ruscello, un fiume, un lago?', 'Lo senti lento o veloce?'],
    brani: [
      { autore: 'Mark Knopfler', titolo: 'Wild Theme', direzione: 'Verso la lentezza' },
      { autore: 'J. S. Bach, Glenn Gould', titolo: 'Variazione Goldberg n. 6', direzione: 'Verso la velocità' },
    ],
  },
  {
    nome: 'Aria', codice: 'La melodia',
    domande: ['Che clima intimo ti evoca?', 'Ti fa sentire fermo e coraggioso, o esaltato?'],
    brani: [
      { autore: 'Bill Conti', titolo: 'Gonna Fly Now', direzione: 'Verso la fermezza gioiosa' },
      { autore: 'Kenny G', titolo: 'You Raise Me Up', direzione: 'Verso la fermezza nostalgica' },
    ],
  },
  {
    nome: 'Luce', codice: 'L’intervallo e l’armonia',
    domande: ['Senti spazi aperti o chiusi?', 'Una luce diretta, o più scura e riflessa?'],
    brani: [
      { autore: 'Max Steiner', titolo: 'Theme From a Summer Place', direzione: 'Verso la solarità' },
      { autore: 'Chet Baker', titolo: 'Almost Blue', direzione: 'Verso la lunarità' },
    ],
  },
  {
    nome: 'Calore', codice: 'L’intenzione',
    domande: ['Dove ti porta questa musica?', 'Senti un calore più personale o più condiviso?'],
    brani: [
      { autore: 'J. S. Bach, Swingle Singers', titolo: 'Aria sulla quarta corda', direzione: 'Verso il noi interiore' },
      { autore: 'Maurice Ravel', titolo: 'Bolero', direzione: 'Verso il noi sociale' },
    ],
  },
])

/* ── Stanza 7 · Glossario ── */
export const GLOSSARIO = Object.freeze([
  { termine: 'Accordo', definizione: 'Tre o più note che risuonano insieme: la forma più semplice dell’armonia.', stanza: 'melodia' },
  { termine: 'bpm', definizione: 'Battiti al minuto: la velocità del tempo.', stanza: 'tempo' },
  { termine: 'Intervallo', definizione: 'Due note che vibrano insieme. La più bassa resta ferma, l’altra si allontana verso l’acuto.', stanza: 'distanze' },
  { termine: 'Monofonia', definizione: 'Un suono per volta, come in una melodia.', stanza: 'melodia' },
  { termine: 'Nota fondamentale', definizione: 'La nota più bassa di un intervallo: il punto da cui si parte e a cui si torna.', stanza: 'distanze' },
  { termine: 'Ottava', definizione: 'La stessa nota, percepita uguale ma più acuta. Dalla fondamentale all’ottava ci sono 12 semitoni.', stanza: 'distanze' },
  { termine: 'Polifonia', definizione: 'Più suoni che vibrano insieme: già con tre note si entra nella polifonia.', stanza: 'melodia' },
  { termine: 'Scala', definizione: 'Una sequenza di note dalla più bassa alla più alta, suonate una dopo l’altra.', stanza: 'melodia' },
  { termine: 'Semitono', definizione: 'Il passo più piccolo tra due note: un gradino.', stanza: 'distanze' },
  { termine: 'Timbro', definizione: 'Il colore di un suono, ciò che rende riconoscibile uno strumento.', stanza: 'timbri' },
  { termine: 'Tono', definizione: 'Una distanza di due semitoni: due gradini.', stanza: 'distanze' },
  { termine: 'Tritono', definizione: 'La quarta eccedente: sei semitoni, il punto centrale della scala.', stanza: 'distanze' },
  { termine: 'Unisono', definizione: 'La stessa nota suonata insieme.', stanza: 'distanze' },
])
