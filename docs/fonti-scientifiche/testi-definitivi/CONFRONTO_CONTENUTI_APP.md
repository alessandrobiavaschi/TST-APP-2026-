# Confronto fra testi definitivi e contenuti dell'app

Data del confronto: 2026-08-22.

Questo documento registra ciò che è già presente nell'app e ciò che richiede una
decisione editoriale. In questa fase non è stato modificato alcun testo utente.

## Esito sintetico

| Fonte definitiva | Stato nell'app | Esito |
|---|---|---|
| Il Pianeta della Musica - FM | Fonte principale già integrata | La copia consegnata coincide con il PDF già archiviato. Nessuna azione necessaria. |
| For Musicians - Marziale | `src/content/musicaDisposizione.js`, scheda `Rosso` | Copertura molto alta. Struttura, intervallo di Prima, stati d'animo, pratica musicale e parole chiave sono presenti; il testo è stato regolarizzato e in parte sintetizzato. |
| Relazioni tra famiglie | `src/content/relational/` | Tutte le 12 coppie presenti nel PDF esistono nell'app, ma con riscritture di entità variabile e contenuti aggiuntivi. Serve riallineamento controllato. |
| Malinconia lunare | Più moduli del profilo Blu | I concetti principali sono presenti, ma non come trascrizione completa della nuova fonte. Serve decidere dove collocare Nostalgia, Malinconia solare e Natura lunare. |

## Relazioni tra famiglie

Il PDF definitivo contiene queste 12 direzioni, tutte già rappresentate nella
scheda `dinamica` del relativo corpus:

- Malinconico verso Flemmatico, Assertivo, Anaffettivo ed Entusiasta;
- Flemmatico verso Malinconico, Assertivo, Anaffettivo ed Entusiasta;
- Entusiasta verso Malinconico, Flemmatico, Assertivo e Anaffettivo.

Un confronto lessicale euristico fra ciascun blocco sorgente e la sola scheda
`dinamica` dell'app mostra una copertura dei termini sorgente compresa fra il 40%
e l'89%. La misura non valuta la correttezza semantica, ma conferma che i testi non
sono copie uniformi: alcuni sono molto vicini, altri sono riscritture sostanziali.

| Relazione | Copertura lessicale indicativa |
|---|---:|
| Malinconico - Flemmatico | 74% |
| Malinconico - Assertivo | 63% |
| Malinconico - Anaffettivo | 40% |
| Malinconico - Entusiasta | 42% |
| Flemmatico - Malinconico | 83% |
| Flemmatico - Assertivo | 71% |
| Flemmatico - Anaffettivo | 70% |
| Flemmatico - Entusiasta | 66% |
| Entusiasta - Malinconico | 89% |
| Entusiasta - Flemmatico | 47% |
| Entusiasta - Assertivo | 70% |
| Entusiasta - Anaffettivo | 46% |

Rischi editoriali rilevati:

- l'app aggiunge schede `frizioni`, `risorse` e consigli pratici che non sono
  presenti come sezioni autonome nel PDF definitivo;
- i consigli pratici sono interpretazioni applicative e non devono essere
  attribuiti direttamente alla fonte;
- le otto direzioni con Assertivo o Anaffettivo come soggetto non sono coperte dal
  nuovo PDF e devono restare esplicitamente marcate come derivate o da validare;
- le note sorgente attuali indicano spesso soltanto `Il Pianeta della Musica - FM`:
  per le 12 direzioni coperte andrà aggiunto il riferimento al PDF definitivo.

## For Musicians - Marziale

La scheda `MUSICISTI_SCHEDE.Rosso` riprende quasi tutto il lessico sostanziale del
PDF definitivo. La copertura lessicale indicativa è del 94%.

Sono già presenti:

- modo di incontrare la Musica e piacere del fare;
- timbri medi, voce, pianoforte, fiati, viole e percussioni;
- ritmo forte e costante intorno a 100-130 bpm;
- melodia, intervalli e intervallo di Prima;
- tutti i 22 stati d'animo associati;
- eseguire, interpretare, comporre e improvvisare;
- le otto parole chiave finali.

Le differenze principali sono regolarizzazioni grammaticali, correzioni di refusi
e lievi sintesi. Prima di sostituire il testo corrente bisogna scegliere se il PDF
sia vincolante anche nella forma letterale o soltanto nei contenuti.

## Malinconia lunare

La nuova fonte approfondisce tre nuclei:

1. Malinconia nostalgica: rimembrare, rimpiangere, mancanza e riconoscenza.
2. Malinconia solare: apertura alla luce, ottimismo e speranza.
3. Natura lunare: distinzione fra malinconia e tristezza, rapporto con calma,
   solitudine e depressione.

Questi concetti compaiono già, in forma sintetica o proveniente dalle precedenti
fonti, soprattutto in:

- `src/content/famigliaApprofondimento.js`;
- `src/content_report.json`;
- `src/reportProfiloPdf.js`;
- `src/content/musicaDisposizione.js`;
- `src/config/galaxyTheoryContent.ts`.

Non esiste però una trascrizione completa e univoca del nuovo documento. Inoltre,
la duplicazione letterale del blocco `LA MALINCONIA SOLARE` nella fonte deve essere
risolta dall'autore prima di un'integrazione fedele.

## Sequenza consigliata per l'integrazione

1. Confermare se i testi definitivi prevalgono solo sul significato o anche sulla
   formulazione letterale.
2. Confermare che il secondo blocco `LA MALINCONIA SOLARE` sia un duplicato da
   eliminare.
3. Riallineare per prime le 12 schede `dinamica` coperte dal PDF delle relazioni.
4. Etichettare chiaramente contenuti derivati, consigli e direzioni non coperte.
5. Integrare la fonte Malinconia nei moduli Blu senza duplicare lo stesso testo in
   più sezioni del report.
6. Mantenere la scheda Marziale attuale e applicare soltanto le differenze
   editoriali espressamente approvate.
7. Aggiungere test di tracciabilità per titoli, coppie, intervallo, stati d'animo e
   parole chiave prima di modificare la UI.
