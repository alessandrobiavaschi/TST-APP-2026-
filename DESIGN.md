# DESIGN SYSTEM · TST 2026 (Test Temperamentale)

> **Contratto di Design e Identità Visiva Unificata**  
> Questo documento definisce l'architettura visiva, i token e le regole di interfaccia per l'intero ecosistema TST (Landing, Test a 72 passi, Report Emotivo, Archivio Risultati, Profilo e Console Operatore). Ogni agente AI e sviluppatore è tenuto a seguire queste regole prima di scrivere o modificare codice UI.

---

## 1. Visual Theme & Atmosphere

### 1.1 Identità del Prodotto
* **Prodotto:** TST (Test di Sensibilità Timbrica / Test Temperamentale), applicazione scientifico-musicale e psicofisiologica ideata da **Franco Mussida** che mappa la struttura emotiva e le 12 Nature temperamentali attraverso l'ascolto consapevole di 72 tracce sonore.
* **Pubblico:** Ascoltatori, appassionati, studenti, terapeuti, musicisti e ricercatori. Persone in cerca di introspezione, rigore analitico e chiarezza interiore.
* **Tono & Voce:** **"Cielo & Armonia Sonora"** — Contemplativo, accogliente, rigoroso ma profondamente poetico e organico. Nessuna freddezza medicale né sensazionalismo da software commerciale.

### 1.2 Metafora Visiva: Il Cielo e la Risoluzione Sonora
* L'esperienza è radicata nel dinamismo atmosferico del cielo (`SkyThemeContext`), che varia secondo le 5 fasce orarie (*morning, afternoon, sunset, twilight, night*) e le 4 condizioni meteo (*sereno, nuvoloso, caldissimo, neve*).
* Le superfici dell'interfaccia si comportano come **vetri satinati acustici (Acoustic Glass)**: lasciano intravedere il respiro del cielo sottostante garantendo contrasto assoluto, leggibilità riposante e assenza di abbagliamento.
* Le 5 famiglie emotive (Blu, Rosso, Verde, Giallo, Grigio) e le loro 12 Nature emergono come fari cromatici semantici, mai come decorazione casuale.

---

## 2. Color Palette & Roles

Il sistema colore è rigorosamente semantico. È vietato l'uso di codici HEX o RGBA hardcodati all'interno dei componenti: utilizzare sempre le variabili CSS del tema.

### 2.1 Fondali e Superfici (Acoustic Glass System)

| Token Semantico | Valore Dark (Default) | Valore Light | Ruolo / Utilizzo |
| :--- | :--- | :--- | :--- |
| `--tst-color-bg-canvas` | `#06080e` | `#f8fafc` | Sfondo profondo dietro ai video atmosferici |
| `--tst-color-bg-surface-subtle` | `rgba(13, 17, 26, 0.55)` | `rgba(255, 255, 255, 0.70)` | Card secondarie, container ampi, rail di navigazione |
| `--tst-color-bg-surface` | `rgba(16, 22, 34, 0.78)` | `rgba(255, 255, 255, 0.92)` | Card primarie di contenuto, pannelli interattivi |
| `--tst-color-bg-surface-elevated`| `rgba(22, 30, 48, 0.90)` | `#ffffff` | Modali, drawer, dropdown, tooltip |
| `--tst-color-bg-hover` | `rgba(255, 255, 255, 0.07)` | `rgba(15, 23, 42, 0.05)` | Stato hover su superfici cliccabili neutre |
| `--tst-color-bg-active` | `rgba(255, 255, 255, 0.12)` | `rgba(15, 23, 42, 0.09)` | Stato pressed / selected |

### 2.2 Bordi e Separatori

| Token Semantico | Valore Dark | Valore Light | Ruolo / Utilizzo |
| :--- | :--- | :--- | :--- |
| `--tst-color-border-subtle` | `rgba(255, 255, 255, 0.08)` | `rgba(15, 23, 42, 0.08)` | Delimitazione leggera card, righe di tabelle |
| `--tst-color-border-default`| `rgba(255, 255, 255, 0.15)` | `rgba(15, 23, 42, 0.16)` | Bordi card primarie, input a riposo |
| `--tst-color-border-strong` | `rgba(255, 255, 255, 0.28)` | `rgba(15, 23, 42, 0.30)` | Input in hover, controlli attivi, badge evidenziati |
| `--tst-color-border-focus` | `#38bdf8` | `#0284c7` | Ring di focus accessibile (WCAG AA) |

### 2.3 Tipografia e Testi

| Token Semantico | Valore Dark | Valore Light | Ruolo / Utilizzo |
| :--- | :--- | :--- | :--- |
| `--tst-color-text-primary` | `#f8fafc` | `#090d16` | Titoli, valori numerici chiave, testi di massima enfasi |
| `--tst-color-text-secondary` | `rgba(248, 250, 252, 0.82)`| `#334155` | Testo corrente, descrizioni narrative, body |
| `--tst-color-text-muted` | `rgba(248, 250, 252, 0.60)`| `#64748b` | Didascalie, etichette secondarie, breadcrumb, step |
| `--tst-color-text-ghost` | `rgba(248, 250, 252, 0.35)`| `#94a3b8` | Placeholder, icone disabilitate, decorazioni |

### 2.4 Accento Neutro di Sistema
* `--tst-color-accent-system`: `#38bdf8` (Azzurro Cielo limpido)
* `--tst-color-accent-system-soft`: `rgba(56, 189, 248, 0.16)`
* **Ruolo:** CTA generiche dell'applicazione (es. "Avanti", "Inizia test", "Salva"), controlli audio neutri, barre di avanzamento del test. **Non** entra in conflitto con le 5 famiglie emotive.

### 2.5 I 5 Colori delle Famiglie Emotive (Mussida - Canoniche)
Questi colori hanno valore **esclusivamente semantico**. Non possono essere sostituiti da tonalità arbitrarie:

| Famiglia | Chiave | Colore Esadecimale | Tonalità Morbida (16%) | Significato Psicofisiologico |
| :--- | :--- | :--- | :--- | :--- |
| **Blu** | `blu` | `#60a5fa` | `rgba(96, 165, 250, 0.16)` | Malinconica (Riflessione, dialogo interiore, intimità) |
| **Rosso** | `rosso` | `#f87171` | `rgba(248, 113, 113, 0.16)`| Marziale (Volontà, presenza, decisione, azione) |
| **Verde** | `verde` | `#4ade80` | `rgba(74, 222, 128, 0.16)` | Flemmatica (Calma, riposo, contemplazione naturale) |
| **Giallo** | `giallo` | `#fde047` | `rgba(253, 224, 71, 0.16)` | Entusiasta (Gioia, vitalità, espansione relazionale) |
| **Grigio** | `grigio` | `#94a3b8` | `rgba(148, 163, 184, 0.16)`| Razionale (Distacco analitico, lucidità intellettuale) |

### 2.6 Feedback di Sistema
* **Successo:** `--tst-color-success`: `#34d399` (Verde smeraldo chiaro)
* **Avviso:** `--tst-color-warning`: `#fbbf24` (Ambra)
* **Errore / Pericolo:** `--tst-color-danger`: `#f87171` (Rosso corallo)
* **Info:** `--tst-color-info`: `#38bdf8` (Cielo)

---

## 3. Typography Rules

### 3.1 Famiglie di Font (Solo Font Liberi Google)
1. **Display / Titoli Emozionali:** `'Newsreader', Georgia, serif`  
   Usato per: Titoli di capitolo del Report, citazioni, frasi di restituzione, titoli hero narrativi.
2. **Body & UI:** `'Manrope', system-ui, sans-serif`  
   Usato per: Testo di lettura, etichette UI, bottoni, opzioni di risposta del test, navigazione.
3. **Mono & Dati Strutturati:** `'JetBrains Mono', monospace`  
   Usato per: Metriche temporali dell'audio, passi "Passo 12 di 72", intervalli musicali, percentuali, punteggi.

### 3.2 Scala e Gerarchia Tipografica

| Livello | Font Family | Size (Desktop / Mobile) | Weight | Line Height | Tracking | Utilizzo |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | Newsreader | `3.25rem (52px)` / `2.25rem` | 500 | 1.15 | `-0.02em` | Titolo principale Landing & Report Hero |
| **Heading 1** | Newsreader | `2.25rem (36px)` / `1.75rem` | 500 | 1.25 | `-0.01em` | Titoli di macro-sezioni (es. Natura, Galassia) |
| **Heading 2** | Manrope | `1.5rem (24px)` / `1.25rem` | 600 | 1.35 | `-0.01em` | Titoli di card primarie, titolo domanda nel Test |
| **Heading 3** | Manrope | `1.125rem (18px)` / `1.05rem`| 600 | 1.40 | `0` | Sotto-titoli, intestazioni di gruppo |
| **Body Large** | Manrope | `1.125rem (18px)` / `1rem` | 400 | 1.65 | `0` | Intro narrativa del report, testi guidati |
| **Body Regular**| Manrope | `1rem (16px)` / `0.9375rem` | 400 | 1.60 | `0` | Testo ordinario, spiegazioni, form label |
| **Body Small** | Manrope | `0.875rem (14px)` | 400/500| 1.50 | `+0.01em` | Microcopy, didascalie, hint sotto i bottoni |
| **Caption/Label**| Manrope | `0.75rem (12px)` | 600 | 1.40 | `+0.04em` | Badge, chip di stato, lettere maiuscole |
| **Metric / Code**| JetBrains Mono| `0.8125rem (13px)` | 500 | 1.40 | `0` | Timestamps player audio, contatore risposte |

> **Regola vincolante:** Dimensione minima per qualsiasi testo informativo ≥ `12px` (`0.75rem`). Testo di lettura principale mai inferiore a `16px`.

---

## 4. Component Stylings & Interaction States

### 4.1 Bottoni (Pulsanti d'Azione)
Ogni schermata ammette **una sola CTA Primaria**. Tutti gli altri controlli sono Secondari o Ghost.

* **Primary (`.tst-button-primary`):**
  * *Base:* Background `--tst-color-accent-system`, testo `#06080e`, font-weight `600`, border-radius `--tst-radius-md` (o `--tst-radius-pill`), padding `0.75rem 1.5rem`.
  * *Hover:* Aumento di luminosità, ombra d'accento `0 0 16px rgba(56, 189, 248, 0.45)`.
  * *Active:* Leggera compressione `scale(0.98)`.
  * *Focus-visible:* Outline `2px solid #ffffff`, offset `2px`.
  * *Disabled:* Opacità `0.4`, cursore `not-allowed`, nessun hover.
* **Secondary (`.tst-button-secondary`):**
  * *Base:* Background `--tst-color-bg-surface`, bordo `1px solid --tst-color-border-default`, testo `--tst-color-text-primary`.
  * *Hover:* Background `--tst-color-bg-hover`, bordo `--tst-color-border-strong`.
  * *Focus-visible:* Ring `--tst-color-accent-system`.
* **Ghost (`.tst-button-ghost`):**
  * *Base:* Background trasparente, nessun bordo, testo `--tst-color-text-secondary`.
  * *Hover:* Background `--tst-color-bg-hover`, testo `--tst-color-text-primary`.

### 4.2 Tessere di Risposta (Audio Test - 72 Step)
* Target minimo cliccabile: `48px` di altezza, distanziamento `8px`.
* *A riposo:* Bordo `--tst-color-border-subtle`, background `rgba(16, 22, 34, 0.60)`.
* *Hover:* Bordo `--tst-color-border-strong`, background `rgba(255, 255, 255, 0.05)`.
* *Selected:* Bordo `1.5px solid --tst-color-accent-system`, background `rgba(56, 189, 248, 0.12)`, icona check luminosa a destra, testo con font-weight `600`.

### 4.3 Card e Pannelli Glassmorphic
* Tutte le card estendono la classe `.tst-card`:
  * `background: var(--tst-color-bg-surface)`
  * `backdrop-filter: blur(16px)`
  * `-webkit-backdrop-filter: blur(16px)`
  * `border: 1px solid var(--tst-color-border-subtle)`
  * `border-radius: var(--tst-radius-lg)`
  * `box-shadow: var(--tst-shadow-md)`

### 4.4 Controlli Form e Input
* Altezza minima `44px`, padding orizzontale `1rem`.
* Bordo `1px solid var(--tst-color-border-default)`, background `rgba(13, 17, 26, 0.75)`.
* *Focus:* Bordo e shadow ad anello su `--tst-color-accent-system`. Nessun outline del browser di default.
* Label sempre fisse ed esplicite (mai affidarsi unicamente al placeholder).

---

## 5. Layout Principles & Spacing Scale

### 5.1 Scala Spaziature Armonica (Base 4/8px)

| Token | Dimensione (rem / px) | Utilizzo Tipico |
| :--- | :--- | :--- |
| `--tst-space-3xs` | `0.125rem (2px)` | Micro correzioni di allineamento icone |
| `--tst-space-2xs` | `0.25rem (4px)` | Gap tra badge compatti, padding micro |
| `--tst-space-xs` | `0.5rem (8px)` | Spazio tra opzioni di risposta, gap bottoni compatti |
| `--tst-space-sm` | `0.75rem (12px)`| Padding interno bottoni, gap chip |
| `--tst-space-md` | `1rem (16px)` | Padding standard card mobile, spaziatura form |
| `--tst-space-lg` | `1.5rem (24px)` | Padding standard card desktop, gutter griglia |
| `--tst-space-xl` | `2rem (32px)` | Spazio tra blocchi logici nella stessa sezione |
| `--tst-space-2xl` | `3rem (48px)` | Margine verticale tra macro-sezioni |
| `--tst-space-3xl` | `4.5rem (72px)` | Padding verticale delle schermate hero |

### 5.2 Griglie e Contenitori
* **Max Content Width:**
  * Lettura focalizzata / Test: `720px` (massimo comfort cognitivo durante l'ascolto).
  * Report e Dashboard: `1120px` (permette affiancamento grafici e schede analitiche).
  * Landing Page / Galassia: `1320px` (respiro immersivo).
* **Centratura:** `margin-inline: auto`, padding laterale minimo `1rem` su mobile, `2rem` su desktop.

---

## 6. Depth & Elevation

| Livello | Token Shadow | Backdrop Blur | Utilizzo |
| :--- | :--- | :--- | :--- |
| **Flat / Ground** | `none` | `none` | Fondali a filo canvas |
| **Level 1 (Card)** | `0 4px 20px rgba(0, 0, 0, 0.25)` | `blur(12px)` | Card informative, tessere risposta |
| **Level 2 (Pop)** | `0 12px 36px rgba(0, 0, 0, 0.38)`| `blur(20px)` | Card hover, sticky header, drawer laterali |
| **Level 3 (Modal)**| `0 24px 64px rgba(0, 0, 0, 0.55)`| `blur(28px)` | Finestre modali, overlay d'aiuto, tutorial |
| **Aura Glow** | `0 0 24px var(--glow-color)` | - | Elemento selezionato (fiore, famiglia attiva) |

---

## 7. Do's and Don'ts

### ✅ DO
* **Usa sempre i token semantici:** Scrivi `var(--tst-color-text-primary)` invece di `#ffffff` o `#f8fafc`.
* **Mantieni la purezza del player:** Durante i 72 passi del test, riduci al minimo il carico cognitivo visivo; mostra solo audio player, domanda, opzioni e progress bar.
* **Rispetta la semantica di Franco Mussida:** Usa i colori Blu, Rosso, Verde, Giallo e Grigio solo ed esclusivamente per le corrispondenti 5 famiglie emotive o per il loro portato.
* **Assicura target touch ampi:** Qualsiasi elemento cliccabile su mobile deve avere un'area interattiva di almeno `44x44px`.
* **Preserva i contrasti sul video di sfondo:** Ogni testo deve avere sotto una superficie satinata (`.tst-card`) o un'adeguata ombra protettiva (`--tst-text-shadow`).

### ❌ DON'T
* **Non creare bottoni o card con stili inventati:** Non introdurre classi CSS ad-hoc con proprietà una-tantum (`font-size: 0.73rem`, `padding: 13px`).
* **Non usare il verde (`#4ade80`) come colore generico di default:** Il verde appartiene alla Famiglia Flemmatica. Per la UI generica usa `--tst-color-accent-system` (`#38bdf8`).
* **Non forzare sfondi bianchi opachi:** Mai introdurre schermate bianche accecanti nel mezzo di un flusso scuro e rilassante.
* **Non inserire più di una CTA primaria per schermata:** L'utente deve capire all'istante l'azione successiva da compiere.
* **Non usare font decorativi per il testo corrente:** `Newsreader` è riservato esclusivamente ai titoli; tutto il body deve restare in `Manrope`.

---

## 8. Responsive Behavior

* **Mobile First Fluidity:**
  * **Breakpoint sm (< 640px):** Griglie di risposta a 1 colonna, header compatto, drawer modali a scorrimento dal basso (*bottom-sheet*), font-size body `15px`.
  * **Breakpoint md (640px – 1024px):** Griglie di risposta a 2 colonne se con testi brevi, barre di navigazione con label e icone visibili.
  * **Breakpoint lg (> 1024px):** Layout affiancato (player a sinistra o in evidenza, griglia strutturata, grafici radar e ciambelle in layout a due colonne).
* **Supporto Safe Area:** Tutti i controlli sticky rispettano `env(safe-area-inset-bottom)` e `env(safe-area-inset-top)`.

---

## 9. Agent Prompt Guide

Quando un agente AI (Codex, Claude, Antigravity) lavora su questo repository per modificare la UI, deve rispettare questo prompt interno:

> "Stai modificando l'interfaccia di TST 2026. Prima di scrivere codice:
> 1. Leggi attentamente `DESIGN.md` e rispetta rigorosamente i token semantici (`--tst-*`).
> 2. Non aggiungere stili inline con valori HEX o font-size arbitrari.
> 3. Utilizza i componenti e le classi standard (`.tst-button-primary`, `.tst-button-secondary`, `.tst-card`, `.tst-input`).
> 4. Non modificare la logica di calcolo del test (`src/testLogic.js`, `src/config/tstSistema.js`).
> 5. Verifica che il contrasto rispetti WCAG AA sia su desktop che su mobile.
> 6. Se introduci nuove necessità visive, proponi l'aggiornamento dei token in `DESIGN.md` e documenta le modifiche in `DESIGN-HANDOFF.md`."
