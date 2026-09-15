# Matrice tracciabilità — report TST 2026

Riferimento interno per la riscrittura testi. Ogni famiglia mappa alle fonti in `docs/fonti-scientifiche/`.

## Fonte unica del lessico (dal 2026-09-15)

**Tutto il lessico del TST — test, vocabolario del report, galassia — deriva da un'unica
fonte: `src/content/paroleTst.js`**, trascrizione fedele del PDF **"PAROLE PER TST"
(Franco Mussida, 29 agosto 2026)**. Nessun altro file deve contenere liste di aggettivi o
sostantivi hardcoded: chi mostra parole (galassia, vocabolario, etichette del Dizionario 2
del test) importa da quel modulo.

Consumer di `paroleTst.js`:

| File | Cosa deriva |
|---|---|
| `src/config/galaxyTheoryContent.ts` | `currents[].states` (aggettivi per sotto-corrente, usati dalla Galassia e dal profilo) |
| `src/config/galaxyDocBridge.ts` | `RAW_DOC_VISUAL[...].lexiconChips` (chip della Galassia) |
| `src/reportProfiloPdf.js` | `PROFILE_PDF_BLOCKS[...].lessico` (sostantivi per famiglia, via `getSostantiviForFamiglia`) |
| `src/content/statiAnimoLessico.js` | `vocabolarioForme` + `vocabolarioAggettivi` (vocabolario del report) — nessuna logica propria, segue le due fonti sopra |
| `src/testLogic.js` (`DIZIONARIO_2`) | le 14 etichette del test (Gruppo C) usano solo aggettivi canonici di una singola Natura, per garantire che le "parole emerse dal test" (`extractParoleDalTest`) coincidano sempre con il vocabolario/galassia |

Le fonti PDF precedenti («Il Pianeta della Musica», «STATI D'ANIMO IN 4 FAMIGLIE», «parole
- STATI D'ANIMO», «TEST DI RILEVAZIONE», «RESTITUZIONE VISIVA RISULTATI DEL TEST») restano
fonte per la **prosa narrativa non coperta dal nuovo PDF**: `coreDescription`,
`selfRelation`, `musicNotes`, periodo evolutivo, venti/rosa dei venti, metafore
(occhio del ciclone, luce lunare, ecc.) in `galaxyTheoryContent.ts` e nei testi estesi di
`reportProfiloPdf.js` (`natura_paragrafi`, `descrizione_estesa`, `risorse`, `ombre`). Il
nuovo PDF non tocca questi campi, solo il lessico.

## Struttura a 11 correnti (dal 2026-09-15)

Il PDF "PAROLE PER TST" assegna alle famiglie un numero di Nature diverso da quello che il
motore di scoring (`src/testLogic.js`, `CORRENTE_KEYS`) aveva storicamente per Flemmatica e
Razionale. La struttura è stata allineata al PDF:

| Famiglia | Nature (PDF) | `rawKey` prima | `rawKey` ora |
|---|---|---|---|
| Marziale | Volitiva, Collerica | `ROSSO_1_Assertivita`, `ROSSO_2_Dubbio_Collera` | invariati |
| Malinconica | Lunare-Depressiva, Lunare-Introspettiva, Solare, Nostalgica | `BLU_1..4` | invariati |
| Flemmatica | Calma Contemplativa, Calma Fisica | `VERDE_1_Calma` (1 sola corrente) | `VERDE_1_CalmaContemplativa` + `VERDE_2_CalmaFisica` (split) |
| Entusiasta | Gioiosa-Solare, Sanguigna-Operosa | `GIALLO_1..2` | invariati |
| Razionale | Anaffettiva (una sola) | `GRIGIO_1_Distaccato_Nichilista` + `GRIGIO_2_Intellettuale_Saggio` (2 correnti) | `GRIGIO_1_Anaffettiva` (merge) |

Il totale resta 11 correnti. Impatto: `dbSchema.js` (Blocco D), `dispositions.ts`
(`rawKeys` di `flemmatica`/`agnostica_anaffettiva`), `testLogic.js` (riassegnazione
`correnteKey` di `DIZIONARIO_1`/`DIZIONARIO_2`/`AFFINITA_*_OPZIONI` per le risposte legate a
Verde/Grigio), e ogni consumer con un `rawKey` esplicito (`semanticConcepts.ts`,
`buildReportData.js`, `reportRecordUtils.js`, `testRecordProcessing.js`, `galassiaData.js`,
pagine `ReportPage.jsx`/`ResultsPage.jsx`/`NewTestPage.jsx`).

**Dati storici**: i documenti `test_results` già salvati usano ancora i vecchi nomi di
campo. Non sono stati migrati in questo intervento — restano leggibili per `File_01..72`
(risposte grezze, invariate) ma i vecchi campi `VERDE_1_Calma`/`GRIGIO_1_..`/`GRIGIO_2_..`
non corrispondono più allo schema corrente. Una migrazione (ricalcolo deterministico dai
`File_01..72` con la nuova logica di `testLogic.js`) è un intervento separato, da eseguire
con dry-run esplicito prima di qualsiasi scrittura reale.

## Fonti scientifiche (autoritative)

Il Pianeta della Musica - FM.pdf · STATI D'ANIMO IN 4 FAMIGLIE (Salvataggio automatico) · STATI_D_ANIMO_IN_4_FAMIGLIE_salvataggio_automatico (duplicato binario) · parole - STATI D'ANIMO · TEST DI RILEVAZIONE · RESTITUZIONE VISIVA RISULTATI DEL TEST.pptx.pdf · **PAROLE PER TST (Franco Mussida, 29/08/2026) — fonte unica del lessico, vedi sopra**

**Non fonte:** `lala.pdf` — vecchio report web usato solo come riferimento di stile/struttura (sintesi a 2 blocchi, capitoli trimmati, ordine sezioni). I fatti scientifici provengono da `docs/fonti-scientifiche/`; il lessico canonico proviene esclusivamente da `src/content/paroleTst.js`.

## Decisioni conflitti sorgente (2026-06-09)

| # | Tema | Decisione | Implementazione |
|---|---|---|---|
| 1 | lala.pdf | Solo guideline UX/struttura, non fonte fatti | Architettura report invariata |
| 2 | Rosso «Inquieto» | Sì, in lessico Rosso (sotto-corrente Amaranto / Dubbio-Collera) | Confermato nel nuovo PDF (Natura Collerica, polo negativo) |
| 3 | Vocabolario canonico | Sostituita dalla fonte unica 2026-09-15 | Vedi sezione sopra |
| 4 | Verde etichetta natura | RESTITUZIONE_VISIVA forma singola | `restituzione_natura`: **NATURA FLEMMATICA** · `restituzione_caratteri`: **CONTEMPLATIVA** |
| 5 | Blu etichetta natura | Campi separati (slide forma singola) | `restituzione_natura`: **NATURA LUNARE** · `restituzione_caratteri`: **MALINCONICO NOSTALGICA** (non stringa combinata) |

## Etichette restituzione visiva (forma singola)

| Famiglia | `restituzione_natura` | `restituzione_caratteri` |
|---|---|---|
| Blu | NATURA LUNARE | MALINCONICO NOSTALGICA |
| Rosso | NATURA MARZIALE | VOLITIVO COLLERICA |
| Verde | NATURA FLEMMATICA | CONTEMPLATIVA |
| Giallo | NATURA SOLARE | SANGUINICO ENTUSIASTA |
| Grigio | NATURA ANAFFETTIVA | AGNOSTICO ANAFFETTIVA |

Fonte slide: RESTITUZIONE VISIVA RISULTATI DEL TEST (pagine forma singola). Le slide «comune struttura emotiva» usano etichette fuse (es. NATURA CALMA FLEMMATICA, NATURA LUNARE MALINCONICO NOSTALGICA) — non adottate in UI report.

## Profilo emotivo — capitoli trimmati (2026-06-09)

| Capitolo | Limite | Fonte estratto |
|---|---|---|
| Natura | 4 paragrafi | `STATI D'ANIMO IN 4 FAMIGLIE` — venti, continente, rapporto con sé |
| Racconto | 4 paragrafi | stessa fonte — periodo evolutivo, sotto-correnti, preferenze d'ascolto |
| Risorse / Ombre | 2 paragrafi + max 5 bullet | stessa fonte — polo positivo / irrigidimento |
| Connettori | `PANEL_READING` in `reportRestitution.js` | testo ponte tra capitoli (non corpo) |

Implementazione: `trimProfiloChapterText` in `profiloDisplayCopy.js`; testi sorgente in `reportProfiloPdf.js`.
