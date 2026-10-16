# DESIGN HANDOFF · TST 2026 (Test Temperamentale)

> **Documento di Passaggio di Consegne per l'Agente AI Successivo (Codex / Claude Code)**  
> Questo file è autosufficiente: descrive esattamente le modifiche apportate alla UI, i file toccati, le decisioni architetturali, i vincoli scientifici preservati e i prossimi passi operativi in ordine di priorità.

---

## 1. Regola di Ingresso per l'Agente
Prima di modificare qualsiasi componente o stile in questo repository:
1. Leggi **`DESIGN.md`** nella root: è il contratto visivo approvato.
2. Rispetta rigorosamente i token semantici (`--tst-*` in CSS e `colors` / `typography` / `spacing` in `src/design-tokens.ts`).
3. Non inserire codici HEX o font-size arbitrari inline o nei fogli di stile.
4. Non modificare la logica del test o il calcolo dei punteggi (`src/testLogic.js`, `src/config/tstSistema.js`, `src/utils/cesteTst.js`).

---

## 2. File Modificati e Dettaglio degli Interventi

| File | Tipo di Intervento | Dettaglio Tecnico |
| :--- | :--- | :--- |
| **`DESIGN.md`** | Creato | Contratto completo di design: Visual Theme & Atmosphere, Palette semantica e 5 famiglie emotive, Regole tipografiche (Newsreader + Manrope + JetBrains Mono), Componenti e stati interattivi, Griglie e Spaziature, Profondità ed elevazione, Do's & Don'ts, Responsive e Guida per Agenti. |
| **`CLAUDE.md`** | Modificato | Aggiunta istruzione vincolante: `"Prima di modificare la UI, segui DESIGN.md e leggi DESIGN-HANDOFF.md."`. |
| **`AGENTS.md`** | Modificato | Aggiunta istruzione vincolante analoga per garantire coerenza tra Codex e Claude Code. |
| **`src/styles/design-tokens.css`** | Creato | Tavola centrale dei token CSS `:root` e dark/light mode: `--tst-color-bg-*`, `--tst-color-border-*`, `--tst-color-text-*`, `--tst-color-accent-system`, `--tst-family-*`, scale tipografiche, spaziali, raggi e ombre. Include classi pronte all'uso: `.tst-card`, `.tst-button-primary`, `.tst-button-secondary`, `.tst-button-ghost`, `.tst-input`, `.tst-badge`. |
| **`src/design-tokens.ts`** | Rifattorizzato | Export tipizzato di costanti JS/TS sincronizzato con `DESIGN.md`. Fornisce `colors` (inclusa la mappa `colors.famiglie`), `typography`, `spacing`, `radius`, `shadows`, `blurs`, mantenendo alias legacy per non rompere il codice preesistente. |
| **`src/index.css`** | Rifattorizzato | Importa `./styles/design-tokens.css`. Rimappa le variabili legacy (`--color-bg`, `--font-family-sans`, `--color-accent`) sui token canonici. Rimosso il vecchio gradiente fisso viola/menta da `body` per adottare lo sfondo canvas coerente con i video atmosferici. |
| **`src/App.css`** | Rifattorizzato | **Bottoni:** aggiornati `.nav-button.primary`, `.secondary`, `.ghost`, stati hover, focus-visible accessibile e disabled. **Header:** aggiornati `.app-header`, `.app-logo-mark`, `.app-logo-title`, `.app-header-link`, `.header-*-button`. **Superfici:** aggiornate `.page-card`, `.info-card`, `.results-main-card`, `.auth-box` eliminando gli sfondi bianchi opachi a favore del sistema Acoustic Glass. |
| **`src/styles/nuovo-test-flow.css`** | Rifattorizzato | **Tessere risposta test:** `.answer-button` a 72 passi aggiornate con Acoustic Glass satinato, contrasto testo elevato, hover e selezione luminescente azzurro cielo (`--tst-color-accent-system`). **Hero & Profilazione:** rimosso lo sfondo bianco opaco in `.serenis-layout` e `#profilazione-utente.page-card`, integrando i campi input con bordi e focus conformi ai token. |
| **`src/components/primitives/Calendar.css`** | Rifattorizzato | Variabili `--cal-*` agganciate ai token `--tst-*`. Trigger e popover di selezione data di nascita aggiornati con Acoustic Glass, eliminando stili e testi grigio-scuri a basso contrasto. |
| **`src/components/primitives/BaseCard.jsx`** | Modificato | Aggiunto `backdropFilter: 'blur(16px)'` e allineato ai token di `src/design-tokens.ts`. |
| **`src/components/report/ReportLegend.jsx`** | Rifattorizzato | Risolto bug di contrasto (sostituito `text-slate-700` con `var(--tst-color-text-secondary)`). Agganciati i 5 colori delle famiglie a `colors.famiglie.*.hex`. |

---

## 3. Cosa NON è Stato Toccato (Invarianza Funzionale e Scientifica)
* **Nessuna modifica alla logica di calcolo:** `src/testLogic.js`, `src/config/tstSistema.js`, `src/utils/cesteTst.js`, `src/utils/testRecordProcessing.js` sono rimasti intatti al 100%.
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

---

## 5. Dubbi Aperti e Attenzioni Particolari

* **Fogli di stile locali complessi (`report-tst.css`, `galassia-view.css`):**  
  Questi file contengono migliaia di righe con animazioni per costellazioni 3D, nodi SVG e diagrammi polari. **Non effettuare sostituzioni di massa con regex**: procedere selettivamente per evitare di alterare matrici di trasformazione SVG o coordinate dei nodi.
* **Stato dei test:**  
  La suite `npm test` ha alcuni test falliti preesistenti sul branch `feat/lessico-parole` legati al lavoro in corso sul lessico e sulla telecamera dell'atlante (non correlati alle modifiche di design). `npm run build` compila invece in produzione senza errori in ~4.4s.

---

## 6. Prossimi Passi in Ordine di Priorità per l'Agente Successivo

1. **Priorità 1 · Grafici e Diagrammi del Report:**  
   Aggiornare componenti grafici come `CompassEmotionalDiagram.jsx`, `FamiglieDonut.jsx`, `FioreMood.jsx` per leggere i 5 colori ufficiali direttamente da `colors.famiglie` in `src/design-tokens.ts` (eliminando gli oggetti colore duplicati locali).
2. **Priorità 2 · Rifattorizzazione Bottoni Pagine Secondarie:**  
   Nelle pagine `LandingPage.jsx`, `HomePage.jsx`, `ResultsPage.jsx` e `ProfilePage.jsx`, sostituire le classi bottoni sparse con le classi standard `.tst-button-primary`, `.tst-button-secondary`, `.tst-button-ghost`.
3. **Priorità 3 · Pulizia Font in `index.html`:**  
   Rimuovere dal tag `<link>` di Google Fonts i caratteri inutilizzati (`Nunito`, `Cormorant Garamond`, `Public Sans`) per ottimizzare ulteriormente il caricamento iniziale.
4. **Priorità 4 · Sincronizzazione Branch:**  
   I 5 commit realizzati vivono attualmente su `feat/lessico-parole`. È possibile portarli su `ai/codex` o fonderli nel branch prescelto con `git cherry-pick` o `git merge`.
