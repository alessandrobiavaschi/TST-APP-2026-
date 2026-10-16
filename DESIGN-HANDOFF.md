# DESIGN HANDOFF · TST 2026 (Test Temperamentale)

> **Documento di Passaggio di Consegne per Claude Code**  
> Questo file è autosufficiente: descrive esattamente le modifiche apportate alla UI, i file toccati, le decisioni architetturali, i vincoli scientifici preservati e i prossimi passi operativi in ordine di priorità.

---

## 1. Regola di Ingresso per l'Agente
Prima di modificare qualsiasi componente o stile in questo repository:
1. Leggi **`DESIGN.md`** nella root: è il contratto visivo approvato.
2. Rispetta rigorosamente i token semantici (`--tst-*` in CSS e `colors` / `radarFamiglie` / `typography` / `spacing` in `src/design-tokens.ts`).
3. Non inserire codici HEX o font-size arbitrari inline o nei fogli di stile.
4. Non modificare la logica del test o il calcolo dei punteggi (`src/testLogic.js`, `src/config/tstSistema.js`, `src/utils/cesteTst.js`, `src/utils/testRecordProcessing.js`).

---

## 2. File Modificati e Dettaglio degli Interventi

| File | Tipo di Intervento | Dettaglio Tecnico |
| :--- | :--- | :--- |
| **`DESIGN.md`** | Creato | Contratto completo di design system: Visual Theme & Atmosphere, Palette semantica e 5 famiglie emotive, Regole tipografiche (Newsreader + Manrope + JetBrains Mono), Componenti e stati interattivi, Griglie e Spaziature, Profondità ed elevazione, Do's & Don'ts, Responsive e Guida per Agenti. |
| **`CLAUDE.md`** | Modificato | Aggiunta istruzione vincolante: `"Prima di modificare la UI, segui DESIGN.md e leggi DESIGN-HANDOFF.md."`. |
| **`AGENTS.md`** | Modificato | Allineato per workflow condiviso Antigravity ↔ Claude Code (rimosso qualsiasi riferimento ad altri agenti). |
| **`src/styles/design-tokens.css`** | Creato | Tavola centrale dei token CSS `:root`: `--tst-color-bg-*`, `--tst-color-border-*`, `--tst-color-text-*`, `--tst-color-accent-system`, `--tst-family-*`, scale tipografiche, spaziali, raggi e ombre. Include classi pronte all'uso: `.tst-card`, `.tst-button-primary`, `.tst-button-secondary`, `.tst-button-ghost`, `.tst-input`, `.tst-badge`. |
| **`src/design-tokens.ts`** | Rifattorizzato | Export tipizzato di costanti JS/TS sincronizzato con `DESIGN.md`. Fornisce `colors` (inclusa la mappa `colors.famiglie`), `radarFamiglie` (array canonico per grafici e radar), `typography`, `spacing`, `radius`, `shadows`, `blurs`, mantenendo alias legacy per retrocompatibilità. |
| **`src/index.css`** | Rifattorizzato | Importa `./styles/design-tokens.css`. Rimappa le variabili legacy (`--color-bg`, `--font-family-sans`, `--color-accent`) sui token canonici. Rimosso il vecchio gradiente fisso viola/menta da `body` a favore del canvas scuro coerente con i video atmosferici. |
| **`index.html`** | Ottimizzato | Potato il caricamento Google Fonts da 6 famiglie a sole 3 famiglie canoniche (`Newsreader`, `Manrope`, `JetBrains Mono`), eliminando `Nunito`, `Cormorant Garamond` e `Public Sans` e riducendo il peso delle richieste web. |
| **`src/App.css`** | Rifattorizzato | **Bottoni:** aggiornati `.nav-button.primary`, `.secondary`, `.ghost`, stati hover, focus-visible accessibile e disabled. **Header:** aggiornati `.app-header`, `.app-logo-mark`, `.app-logo-title`, `.app-header-link`, `.header-*-button`. **Superfici & Cards:** aggiornate `.page-card`, `.info-card`, `.results-main-card`, `.auth-box`, `.my-area-card`, `.my-area-account`, `.my-area-hero`, `.info-hero-card` eliminando gli sfondi bianchi opachi a favore dell'Acoustic Glass. |
| **`src/styles/nuovo-test-flow.css`** | Rifattorizzato | **Tessere risposta test:** `.answer-button` a 72 passi aggiornate con Acoustic Glass satinato, contrasto testo elevato, hover e selezione luminescente azzurro cielo (`--tst-color-accent-system`). **Hero & Profilazione:** rimosso lo sfondo bianco opaco in `.serenis-layout` e `#profilazione-utente.page-card`, integrando i campi input con bordi e focus conformi ai token. Tipografia display allineata a `Newsreader`. |
| **`src/components/primitives/Calendar.css`** | Rifattorizzato | Variabili `--cal-*` agganciate ai token `--tst-*`. Trigger e popover di selezione data di nascita aggiornati con Acoustic Glass, eliminando stili e testi grigio-scuri a basso contrasto. |
| **`src/components/primitives/BaseCard.jsx`** | Modificato | Aggiunto `backdropFilter: 'blur(16px)'` e allineato ai token di `src/design-tokens.ts`. |
| **`src/components/report/ReportLegend.jsx`** | Rifattorizzato | Risolto bug di contrasto (sostituito `text-slate-700` con `var(--tst-color-text-secondary)`). Agganciati i 5 colori delle famiglie a `radarFamiglie` da `src/design-tokens.ts`. |
| **`src/components/report/FioreMood.jsx`** | Rifattorizzato | Sostituito array colori hardcoded locale con `radarFamiglie` canonico. |
| **`src/components/report/GlassyEmotionalDiagram.jsx`** | Rifattorizzato | Sostituito array colori hardcoded locale con `radarFamiglie` canonico. |
| **`src/components/report/CompassEmotionalDiagram.jsx`** | Rifattorizzato | Sostituito mapping colori hardcoded con `colors.famiglie` da `src/design-tokens.ts`. |
| **`src/components/report/FioreCorrenti.jsx`** | Rifattorizzato | Petali predefiniti collegati a `colors.famiglie.*.hex`. |
| **`src/components/VennTemperamentale.jsx`** | Rifattorizzato | Colori cerchi Euler/Venn collegati a `colors.famiglie.*.hex`. |
| **`src/pages/ResultsPage.jsx`** | Rifattorizzato | Sostituito `RADAR_FAMIGLIE` hardcoded con import da `src/design-tokens.ts`. |
| **`src/components/ResultsArchiveMobile.jsx`** | Rifattorizzato | Sostituito `RADAR_FAMIGLIE` hardcoded con import da `src/design-tokens.ts`. |
| **`src/components/report/SintesiCorrenti.jsx`** | Rifattorizzato | `FAMILY_REF` e pannello di dettaglio collegati a `colors.famiglie.*.hex`. |
| **`src/components/report/QuattroRapporti.jsx`** | Rifattorizzato | Etichette radar SVG allineate a `Manrope`. |
| **`src/components/report/ReportRadarChart.jsx`** | Rifattorizzato | Etichette radar SVG allineate a `Manrope`. |
| **`src/styles/landing-nebula.css`** | Rifattorizzato | CTA e testi della landing allineati a `var(--tst-font-sans, 'Manrope', sans-serif)`. |
| **`src/styles/landing-intro-rackfocus.css`** | Rifattorizzato | Subtitle landing allineato a `var(--tst-font-sans)`. |
| **`src/styles/mobile-charts-viewer.css`** | Rifattorizzato | Sfondo e font del visore grafici mobile allineati ai token. |
| **`src/styles/report-tst.css`** | Rifattorizzato | Token tipografici del report agganciati a `--tst-font-display`, `--tst-font-sans`, `--tst-font-mono`. |

---

## 3. Cosa NON è Stato Toccato (Invarianza Funzionale e Scientifica)
* **Nessuna modifica alla logica di calcolo:** `src/testLogic.js`, `src/config/tstSistema.js`, `src/utils/cesteTst.js`, `src/utils/testRecordProcessing.js` sono intatti al 100%. Tutti i 56 test di scoring regression, modello storico, punti golden e intervalli unici passano con zero errori.
* **Nessuna modifica ai contratti dati di Firestore:** lo schema a ~103 campi (`Blocco A..E`) e le regole di persistenza non sono state toccate.
* **Nessuna modifica ai file audio o al motore di riproduzione:** i file MP3 e gli script audio funzionano esattamente come prima.

---

## 4. Decisioni Prese e Rationale

1. **Perché Acoustic Glass e Dark Mode nativa:**  
   L'identità di TST poggia sul cielo dinamico (`SkyThemeProvider`) e sulla concentrazione meditativa dell'ascolto. I vecchi blocchi bianchi opachi (`background: rgba(255, 255, 255, 0.95)`) creavano un violento stacco visivo e abbagliavano l'utente. Con le superfici in vetro acustico satinato (`rgba(16, 22, 34, 0.78)` con `blur(16px)` e bordo sottile), il cielo si intravede in modo armonico e il testo bianco/avorio garantisce contrasto WCAG AA senza sforzo visivo.
2. **Perché l'Azzurro Cielo (`#38bdf8`) come accento di sistema:**  
   In precedenza veniva usato il verde (`#4ade80`) per qualsiasi pulsante o indicatore generico. Nel modello di Franco Mussida, il Verde rappresenta la *Famiglia Flemmatica (Calma)*: usarlo per controlli generici generava confusione semantica. L'azzurro cielo è un colore neutro, luminoso e coerente con la volta celeste.
3. **Perché la triade tipografica (Newsreader + Manrope + JetBrains Mono):**  
   Il progetto caricava fino a 10 font differenti creando incoerenza e pesantezza di rete. La nuova gerarchia attribuisce a ciascun font un ruolo univoco:
   - *Newsreader:* titoli hero e narrativi (poetico, profondo, editoriale).
   - *Manrope:* corpo del testo, pulsanti, domande del test (moderno, caldo, geometrico).
   - *JetBrains Mono:* codici, timestamp audio, passi del test, numeri (analitico e preciso).
4. **Perché `radarFamiglie` e `colors.famiglie` come Fonte Unica:**  
   In precedenza 6 componenti diversi ridefinivano ciascuno il proprio array di 5 colori/etichette. Ora importano tutti `radarFamiglie` o `colors.famiglie` da `src/design-tokens.ts`. Qualsiasi variazione cromatica futura richiederà la modifica di una sola riga di codice.

---

## 5. Stato del Build e dei Test

* **Build di produzione:** `npm run build` compila con successo in ~4.8s senza warning o errori di rollup/parsing.
* **Scoring e Algoritmi:** Tutti i test matematici del test temperamentale (`scoringRegression.test.js`, `testStorici.test.js`, `versioneModello.test.js`, `puntiGolden.test.js`, `intervalliFonteUnica.test.js`, `reportTaxonomy.test.js`, etc.) sono verificati e passano al 100%.

---

## 6. Prossimi Passi Consigliati per Claude Code

1. **Galassia View (Opzionale):**  
   Verificare se i nodi costellazione 3D in `GalassiaView.jsx` beneficiano di una mappatura esplicita su `colors.famiglie` invece dei colori RGB shader interni.
2. **Mobile Nav & Drawer (Opzionale):**  
   Ispezionare il drawer di navigazione mobile su schermi compatti (<380px) per verificare l'effetto visivo del backdrop blur.
3. **Fusione Branch:**  
   I commit sono stati organizzati in modo atomico e pulito sul branch `feat/lessico-parole`:
   - `3afc8c5` feat(design): introduce semantic css design tokens and theme variables
   - `ddbd051` feat(design): refactor buttons, answer tiles and form inputs to use design tokens
   - `92bddd7` feat(design): refactor cards and containers to use Acoustic Glass tokens
   - `039a3a0` feat(design): refactor header navigation, layout shell and legend contrast
   - `ed40b35` docs(design): establish DESIGN-HANDOFF.md for peer agent collaboration
   - `3d1141a` docs: remove Codex references and align workflow with Claude Code handoff
   - `73a974a` feat(design): align report charts and emotional diagrams with design tokens
   - `dc37c9e` feat(design): prune Google Fonts down to approved trio and consolidate typography tokens
   - `0883021` feat(design): refactor personal area cards, account panel and hero elements to Acoustic Glass tokens
   - `e5fad8e` feat(landing): optimize landing video with faststart H.264 and instant poster fallback
   - `a86530f` feat(report): enhance stanza 05 words display with chips and optimize atlas canvas GPU memory
