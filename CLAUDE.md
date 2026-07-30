# CLAUDE.md — Onboarding TST 2026

Guida di onboarding per Claude Code su questo repository. Struttura in tre livelli: stack tecnico, scopo dei componenti, regole di lavoro.

---

## 1. Tech Stack & Struttura

**Stack:** React 19 + Vite 7, JavaScript/JSX (alcuni file in TypeScript: `.ts`), Tailwind CSS 4, Firebase (Auth + Firestore), React Router 7, Framer Motion, Recharts.

**Comandi principali:**
```bash
npm run dev              # dev server (Vite, localhost:5173)
npm run build             # build produzione → dist/
npm run preview           # preview di dist/ in locale
npm run lint               # ESLint (flat config in eslint.config.js)
npm run optimize:media     # ottimizzazione asset media (scripts/optimize-media.mjs)
npm run media:landing-hq   # re-encode video landing in HQ
```

⚠️ **Non esiste una test suite** in questo repo (nessun runner configurato). Non chiedere/aspettarti `npm test`.

**Struttura cartelle principali:**
```
src/
  pages/          → una pagina per ogni route (LandingPage, NewTestPage, ReportPage, ...)
  components/      → componenti condivisi; components/report/ = componenti del report TST
  components/primitives/  → building block UI riusabili
  config/          → mapping e configurazioni dati (dispositions, galaxy, tema famiglie)
  content/          → testi narrativi (content_report.json, reportRestitution.js)
  utils/            → logica di calcolo/derivazione dati per il report
  firestore/        → accesso a Firestore (query, salvataggio risultati)
  hooks/, styles/, theme/, plugins/
```

**Config di progetto:** `vite.config.js` (env Firebase build-time), `tailwind.config.js`, `eslint.config.js`, `.env` / `.env.example` (credenziali Firebase, `VITE_AUDIO_BASE_URL`).

---

## 2. Scopo dei componenti principali

### Provider tree (`src/main.jsx`)
```
BrowserRouter
  SkyThemeProvider     ← stato sfondo animato (meteo, ora del giorno)
    UiSoundProvider    ← toggle suoni UI
      App              ← header, nav mobile, routing, banner GDPR, ErrorBoundary
```

### Routing (`src/pages/`)
| Route | Pagina | Scopo |
|---|---|---|
| `/` | LandingPage | marketing, video background, entry point auth |
| `/home` | HomePage | area personale post-login |
| `/nuovo-test` | NewTestPage | test audio a 72 step |
| `/tutorial` | TutorialPage | slide tutorial d'ascolto |
| `/risultati` | ResultsPage | archivio test svolti |
| `/risultati/report` | ReportPage | report del singolo test |
| `/tst` | TstPage | descrizione del test |
| `/profilo` | ProfilePage | profilo utente |
| `/info` | InfoPage | contatti / privacy |

`/dashboard-operatore` reindirizza a `/home` (ruolo operatore unificato sullo stesso account).

### Motore di scoring (`src/testLogic.js`)
Elabora le risposte ai 72 file audio. `getLogicTypeForFile(n)` classifica ogni file in un tipo di domanda (AFFINITA_BASE, DIZIONARIO_1/2, AFFINITA_ECCEZIONE, AFFINITA_STANDARD). `computeScoreDeltaForAnswer(...)` converte ogni risposta in punteggio su 11 **correnti emotive** + 3 **portato esperienziale**. Le correnti si aggregano in 5 famiglie colore (BLU→Malinconia, ROSSO→Volitività, VERDE→Calma, GIALLO→Entusiasmo, GRIGIO→Anaffettività) che determinano `Disposizione_Prevalente`.

### Schema dati (`src/dbSchema.js`, `src/firestorePaths.js`)
Collection Firestore `test_results`, ~103 campi per documento: profiling utente, risposte grezze `File_01`…`File_72`, punteggi portato/correnti, esiti finali. Ogni documento è di proprietà del campo `userId` (regole Firestore in `firestore.rules`). Salvataggio via `saveTestResultForUser()` in `src/firestore/testResults.js`.

### Sfondo animato (`src/SkyThemeContext.jsx`)
Video di sfondo dinamico su tutte le pagine tranne `/`, basato su combinazione `timeOfDay × weather`. Config in `skyVideosConfig.js`, persistita in `localStorage` (`tst_sky_config_v1`).

### Componenti del report — file chiave (`src/components/report/`)
Flusso: `ReportPage` → `ReportShell` (config in `reportSectionsConfig.js`):
1. **HeroScreen.jsx** — hero di apertura (legenda Natura/Disposizione)
2. **SintesiCorrenti.jsx** — dati chiave + grafici di presenza
3. **NavbarTST.jsx** — navigazione interna al report (toggle vista Galassia)
4. `ProfiloEmotivo` → capitoli Natura, Racconto, Risorse, Ombre
5. `QuattroRapporti`, `SezionePortatoEsperienziale`, `DialogoCorrenti`
6. `ParoleStatiAnimo`, `ApprofondimentoSezioni`, `OperatorSection`
7. `GalassiaView` — vista alternativa via toggle navbar

**File di supporto al report:**
- `src/config/reportFamilyTheme.js` — tema visivo per famiglia colore
- `src/content_report.json` — testi narrativi del report
- `src/reportProfiloPdf.js` — generazione PDF del profilo
- `src/utils/buildReportData.js` — assembla i dati del report dal record Firestore
- `src/utils/profiloDisplayCopy.js` — etichette e copy di visualizzazione
- `src/utils/reportRecordUtils.js` — utility sui punteggi/record

**File secondari (dati/etichette):** `src/testLogic.js`, `src/pages/ResultsPage.jsx`, `src/pages/NewTestPage.jsx`, `src/utils/galassiaData.js`, `src/config/galaxyTheoryContent.ts`, `src/config/dispositions.ts`, `src/config/galaxyDocBridge.ts`, `src/config/semanticConcepts.ts`.

### Terminologia da rispettare in copy/label
- "Malinconica / Nostalgica" = nome della **famiglia** (gruppo BLU) — mai chiamarla "temperamento" isolato.
- "Lunare" / "Solare" = **qualità** (sotto-tipi) dentro la famiglia BLU, non temperamenti autonomi.
- "Temperamento" resta corretto solo a livello di famiglia.

### Regole design vincolanti

**Testo paragrafi:** `max-width: 65ch`, `line-height: 1.65`, `text-align: left` — mai `justify` senza `hyphens: auto` e `lang="it"` sull'elemento.

**Font:** serif solo per `h1`–`h3`; sans-serif per corpo testo e UI; monospace esclusivamente per micro-etichette tipo "QUOTA" o "PREVALENZA" — mai per titoli, chip, legende o testi di grafici.

**Colore rosso:** riservato al tema Marziale/Volitività (numeri di sezione, callout, chip identitari). Mai usare per stati attivi di navigazione, mai per dati negativi. Stati attivi = bianco + underline. Antipatia = colore neutro freddo.

**Numerazione sezioni:** un solo sistema — cerchietto numerato; sottocapitoli in formato `1.1` nello stesso stile.

**Scroll anchor:** ogni ancora di sezione ha `scroll-margin-top: 140px` per non finire sotto l'header sticky.

**Accordion:** i titoli mantengono lo stesso font (serif) sia chiusi che aperti.

### Regole testo vincolanti

- Mai alterare il significato dei contenuti esistenti.
- Evitare elenchi di 3–4 sostantivi in serie ("X, Y, Z e W") se ne esiste già uno nello stesso blocco: spezzare in due frasi.
- Evitare il costrutto "Non è X, ma Y": riformulare in positivo.
- Virgolette caporali «» solo per citazioni vere, mai per enfatizzare singole parole.
- Non mostrare all'utente nomi di file (`.pdf`) o codici interni (es. `INT-MA`).
- Alternare frasi lunghe e corte; unire paragrafi monofrase consecutivi.

### Convenzioni UI (dettagli in `GUIDA_UI_UX.md`)
Riusare le classi CSS esistenti — non crearne varianti ad-hoc: `page`, `page-header`, `page-card`, `nav-button primary/secondary/ghost`, `answers-grid`, `feedback-field`, `report-section`. Ogni pagina ha una sola CTA primaria. Flussi lunghi (es. test 72 step) mostrano sempre "Passo N di 72" + progress bar + nome sezione corrente.

---

## 3. Regole di ingaggio e workflow

**Root fissa del progetto:** `/Users/alessandrobiavaschi/Downloads/TST 2026 cursor` — posizionarsi sempre qui prima di qualsiasi comando. Ignorare sempre percorsi fuori da questa root (es. `Downloads/App v2`, `Downloads/App v5`, `TST_demo`, `~/package.json`).

**Modalità di lavoro: chirurgica, non esplorativa.**
- Parti sempre dai file chiave già mappati sopra (sezione 2), non rileggere tutto il progetto ogni volta.
- Cerca solo le stringhe necessarie al prompt corrente con grep mirato:
  ```
  grep -rn "testo" src --include="*.jsx" --include="*.tsx" --include="*.js" --include="*.ts" --include="*.json"
  ```
- Modifica solo le righe effettivamente coinvolte — interventi mirati, non refactor.
- Non toccare layout, scoring, ordine sezioni o logiche interpretative se non esplicitamente richiesto.
- Se una scelta è ambigua: segnala il dubbio e proponi la soluzione più conservativa — non inventare.

**Stile e UI**
- Usare Tailwind e le classi CSS condivise già esistenti (vedi sezione 2) — non introdurre varianti ad-hoc senza motivo.
- **Non aggiungere mai** micro-titoli, kicker, eyebrow label o soprattitoli nei componenti UI a meno che non siano esplicitamente richiesti: è una scelta stilistica che spetta solo all'utente.

**Verifica prima di chiudere un task**
- Non esiste una test suite: la verifica passa da `npm run lint` e, quando pertinente, da `npm run build`.
- Dopo ogni modifica fai un grep di controllo per confermare che il cambiamento sia coerente nel resto del codebase.

**Report finale di ogni intervento**
Alla fine di ogni modifica, riportare sempre in modo sintetico:
- file modificati
- cosa è cambiato
- cosa non è stato toccato
- eventuali dubbi
- eventuali errori di build/lint

**Known caveats**
- `src/plugins/BANANA/` è un plugin sperimentale (fiori animati), non parte del flusso principale.
