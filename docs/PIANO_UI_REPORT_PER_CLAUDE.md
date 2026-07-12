# Piano UI del report TST - brief operativo per Claude Code

## Mandato

Ridisegnare l'interfaccia del report TST rendendola coerente, leggibile e visivamente autorevole, senza modificare alcun contenuto testuale, dato, punteggio, etichetta semantica o logica applicativa.

Reference primaria: `/Users/alessandrobiavaschi/Desktop/Screenshot 2026-07-12 alle 16.25.34.pdf` (20 schermate desktop, 1512 x 982).

## Vincoli non negoziabili

- Non riscrivere, abbreviare, riordinare o eliminare i testi.
- Non modificare scoring, Firestore, mapping delle correnti o costruzione dei dati.
- Non cambiare la sequenza concettuale delle sezioni.
- Non intervenire sulla modalita Galassia salvo raccordo della barra di navigazione.
- Mantenere accessibilita, focus visibile, `prefers-reduced-motion` e navigazione da tastiera.
- Usare virgolette ASCII nei sorgenti.

## Diagnosi del PDF

### 1. Il chrome occupa troppo spazio e non ha una gerarchia chiara

Nelle schermate convivono:

1. header globale dell'app;
2. navbar flottante del report;
3. indice laterale del report;
4. intestazioni/accordion interne.

La navbar del report sembra "sotto" l'header globale per una ragione concreta: `.app-header` ha `z-index: 90`, mentre `NavbarTST.jsx` applica inline `zIndex: 50`. Non e quindi solo una percezione visiva.

La doppia barra superiore riduce lo spazio utile e fa sembrare il report una finestra inserita dentro un'altra applicazione.

### 2. Il report usa linguaggi visivi diversi

Nel PDF si alternano almeno tre sistemi:

- hero immersiva rossa, fotografica e centrata;
- pannelli editoriali quasi neri con titoli serif;
- dashboard blu con grafici, chip, box tecnici e accenti rossi.

Cambiano continuamente radius, bordi, densita, colore delle superfici, larghezza dei contenuti e scala dei titoli. Le sezioni sembrano provenire da prodotti diversi.

### 3. La struttura CSS conferma il problema

`src/styles/report-tst.css` contiene piu definizioni successive degli stessi selettori, tra cui `.navbar-tst__bar`, `.report-section-group`, `.report-section-group__trigger` e `.report-section-group__title`. Le regole piu tarde sovrascrivono il sistema iniziale e rendono difficile prevedere la resa.

Esiste inoltre un secondo set di token e superfici in `src/styles/report-experience.css` (`.report-xp`), mentre il markup corrente di `ReportShell.jsx` usa prevalentemente `.report-tst`. La compresenza di sistemi parzialmente sovrapposti aumenta la deriva visiva.

### 4. La colonna centrale e troppo stretta rispetto al viewport

Su desktop il layout e limitato a 1120 px, il contenuto principale a 880 px e il rail a circa 210-240 px. Con il browser largo rimangono ampie aree nere inutilizzate; al contrario, alcune visualizzazioni interne sono compresse e diventano minute.

La misura testuale deve restare controllata, ma grafici, confronti e griglie necessitano di una corsia piu ampia della prosa.

### 5. Gerarchia e ritmo verticale sono instabili

- Alcune schermate hanno enormi vuoti sopra il contenuto.
- Titoli di pari livello hanno dimensioni e numerazioni diverse.
- Gli accordion sembrano talvolta sezioni principali, talvolta semplici card.
- I divisori e gli spazi non comunicano chiaramente quando termina un capitolo.
- Il titolo "Risultati del test" appare tardi e scollegato dalla hero.

### 6. Contrasto e cromia non sono governati

Nero, blu notte, grigio caldo, rosso e viola vengono usati contemporaneamente come colori strutturali. Il colore della famiglia emotiva e usato anche dove servirebbe un accento neutro e stabile.

Alcuni testi secondari, label e voci del rail hanno contrasto troppo basso. I chip rossi su fondo blu risultano rumorosi e poco leggibili.

### 7. Eccesso di contenitori

Molte sezioni applicano card dentro card, bordi dentro pannelli e pannelli dentro accordion. Questo indebolisce la gerarchia e fa percepire il report come una dashboard amministrativa, non come una restituzione personale editoriale.

## Direzione visiva proposta

Concetto: **atlante editoriale notturno**.

Il report deve sembrare un unico documento digitale premium: profondo e atmosferico, ma sobrio. La componente emotiva arriva dal colore della famiglia e dalle visualizzazioni, non da continui cambi di sfondo.

### Principi

- Una sola base scura continua per tutto il report.
- Una sola superficie elevata, usata con parsimonia.
- Il colore della famiglia e un accento informativo, non il colore dell'intera UI.
- Titoli editoriali serif; interfaccia, label e corpo in sans.
- Prosa con misura massima 68ch; grafici e griglie possono usare tutta la corsia.
- Meno box, piu spazio, allineamenti e separatori.
- Un solo livello sticky sotto l'header globale.

## Reference di sistema

### Palette semantica

```css
--report-bg: #08090d;
--report-bg-elevated: #0f1118;
--report-surface: rgba(255, 255, 255, 0.035);
--report-surface-hover: rgba(255, 255, 255, 0.06);
--report-border: rgba(255, 255, 255, 0.09);
--report-border-strong: rgba(255, 255, 255, 0.16);
--report-text: #f3f1ed;
--report-text-muted: rgba(243, 241, 237, 0.68);
--report-text-soft: rgba(243, 241, 237, 0.48);
--report-structural-accent: #a78bfa;
--report-family-accent: var(--corrente-primaria);
```

Non introdurre blu di pannello come colore strutturale indipendente. Le varianti cromatiche devono derivare dai token sopra.

### Tipografia

- Display: `Newsreader`, peso 500-600.
- Corpo/UI: `Public Sans`, peso 400-600.
- Mono: solo micro-label, dati brevi o codici visuali.
- H1 hero: `clamp(3.5rem, 7vw, 6.5rem)`.
- H2 capitolo: `clamp(2rem, 3.5vw, 3rem)`.
- H3 sezione: `clamp(1.4rem, 2.2vw, 2rem)`.
- Corpo: 16-18 px, line-height 1.65-1.75.
- Label: non scendere sotto 12 px sul desktop.

### Spaziatura e geometria

- Scala: 4, 8, 12, 16, 24, 32, 48, 64, 96 px.
- Radius card: 16 px.
- Radius controlli: 999 px solo per pill/button realmente pill.
- Bordo standard: 1 px `--report-border`.
- Ombre: una sola ombra molto morbida per elementi sticky o modali.

### Layout desktop

```text
Header globale, 64-72 px
------------------------------------------------------------
Barra report sticky unica, allineata al container
------------------------------------------------------------
Container max 1280 px
| rail 220 px | gap 48 px | contenuto minmax(0, 1fr) |
                              prosa max 68ch
                              grafici width 100%
```

Il rail non deve avere una grande card autonoma. Deve essere un indice leggero, separato dal contenuto tramite spazio o una linea verticale discreta.

### Comportamento responsive

- `>= 1200 px`: rail sticky + contenuto ampio.
- `768-1199 px`: rail sostituito da select/pill bar sticky orizzontale.
- `< 768 px`: una sola barra compatta; accordion e grafici a colonna singola; nessun contenuto nascosto dietro elementi fixed.

## Decisione sul menu

Mantenere l'header globale come livello superiore. Trasformare la navbar del report in una **sub-bar sticky integrata**, non flottante dentro una capsula.

- `position: sticky` nel flusso del report, non `fixed` sull'intero viewport.
- Offset: `top: var(--app-header-offset)`.
- Z-index documentato: header globale 90, sub-bar report 70, rail 20, contenuto 1, modal 200.
- Altezza desktop 64 px, mobile 52-56 px.
- Eliminare margini verticali e grande bordo arrotondato della `.navbar-tst__bar`.
- Conservare Report/Galassia, identita, Scarica e Aiuto.
- Su mobile collassare i metadati della famiglia prima delle azioni essenziali.

## Architettura UI desiderata

1. Hero identitaria.
2. Sub-bar Report/Galassia.
3. Introduzione/guida di lettura compatta.
4. Capitolo 1 sempre aperto: risultati.
5. Capitoli successivi come accordion coerenti.
6. Azioni finali.

Ogni capitolo usa lo stesso `SectionFrame` concettuale:

- eyebrow/numerazione;
- titolo;
- introduzione esistente;
- corpo;
- eventuale visualizzazione full-width;
- separatore finale.

## Piano di implementazione

### Fase 0 - baseline e protezione contenuti

- Salvare screenshot desktop 1440 x 900, tablet 1024 x 768 e mobile 390 x 844.
- Inventariare tutte le stringhe renderizzate e assicurarsi che il refactor non le modifichi.
- Annotare sezioni aperte/chiuse e comportamento di scroll/hash.

### Fase 1 - consolidamento CSS

File principali:

- `src/styles/report-tst.css`
- `src/styles/report-experience.css`
- `src/components/report/ReportShell.jsx`
- `src/components/report/NavbarTST.jsx`

Azioni:

- Definire una sola sorgente di token sotto `.report-tst`.
- Rimuovere o accorpare i blocchi duplicati degli stessi selettori.
- Evitare stili strutturali inline in `NavbarTST.jsx`; spostarli nel CSS.
- Tenere `.report-xp` solo se realmente usato; altrimenti migrare le poche parti necessarie nei token `.report-tst`.
- Creare una scala z-index esplicita tramite custom properties.

### Fase 2 - chrome e navigazione

- Convertire `NavbarTST` nella sub-bar sticky descritta sopra.
- Semplificare `ReportSectionController` in rail editoriale.
- Correggere `scroll-margin-top` usando la somma reale di header e sub-bar.
- Verificare che nessun titolo venga coperto durante la navigazione.

### Fase 3 - shell e ritmo

- Portare il container a massimo 1280 px.
- Separare `.report-reading-column` e `.report-visual-column` o classi equivalenti.
- Uniformare spazi prima/dopo titoli, sezioni e divider.
- Rimuovere wrapper visuali ridondanti senza cambiare il DOM semantico dove non necessario.

### Fase 4 - primitive condivise

Uniformare attraverso classi condivise:

- section header;
- card/surface;
- data card;
- chip/tag;
- accordion trigger/panel;
- chart frame;
- callout informativo.

Non riscrivere subito tutti i componenti: applicare prima primitive e token, poi correggere le eccezioni reali.

### Fase 5 - sezioni ad alta incoerenza

Ordine consigliato:

1. `SintesiCorrenti` e grafici iniziali;
2. `ProfiloEmotivo`;
3. `QuattroRapporti`;
4. `ParoleStatiAnimo`;
5. `SezioneMusica`;
6. `ApprofondimentoSezioni` e sezioni operatore.

Per ogni sezione:

- stessa superficie di base;
- stesso header;
- stessi padding;
- visualizzazioni leggibili a larghezza piena;
- nessun nuovo colore strutturale.

### Fase 6 - responsive e accessibilita

- Testare 1440, 1280, 1024, 768, 430 e 390 px.
- Focus ring sempre visibile.
- Target interattivi almeno 44 x 44 px.
- Contrasto WCAG AA per corpo e controlli.
- Nessun overflow orizzontale.
- Accordion fruibili da tastiera e con stato ARIA corretto.
- `prefers-reduced-motion` rispettato.

### Fase 7 - verifica

- `npm run lint`
- `npm run build`
- Confronto screenshot prima/dopo alle viewport definite.
- Controllo manuale di Report/Galassia, download, aiuto, rail e anchor navigation.

## Criteri di accettazione

- Header globale e barra report non si sovrappongono e hanno una gerarchia evidente.
- Nessuna intestazione viene nascosta dopo uno scroll o un click nel rail.
- Tutte le sezioni condividono palette, tipografia, radius, bordi e spacing.
- I contenuti testuali risultano byte-for-byte invariati dove conservati nei file sorgente.
- Il colore della famiglia resta riconoscibile senza colorare interi pannelli.
- La prosa non supera 68ch; grafici e griglie sfruttano la larghezza disponibile.
- Non esistono card annidate prive di una funzione gerarchica.
- Desktop, tablet e mobile non presentano overflow o controlli coperti.
- Lint e build completano con successo.

## Prompt operativo da consegnare a Claude Code

```text
Lavora nel repository TST seguendo AGENTS.md e il documento
docs/PIANO_UI_REPORT_PER_CLAUDE.md.

Obiettivo: rifattorizzare esclusivamente la UI del report per ottenere un unico
linguaggio visivo editoriale notturno, coerente e responsive.

Vincolo assoluto: non modificare contenuti testuali, scoring, dati, mapping,
Firestore o ordine concettuale delle sezioni.

Procedi per fasi. Inizia da:
1. baseline visiva;
2. consolidamento dei token e rimozione degli override CSS duplicati;
3. correzione della gerarchia tra header globale, NavbarTST e rail;
4. unificazione di shell, section header, card, accordion e chart frame;
5. responsive e verifica.

Non fare un redesign isolato componente per componente prima di avere definito
token, griglia e scala z-index. Riusa i componenti esistenti. Mantieni Report e
Galassia funzionanti.

Prima di modificare, indica i selettori duplicati che intendi consolidare e i
file coinvolti. Dopo ogni fase esegui una verifica visiva. Alla fine esegui
npm run lint e npm run build e riporta eventuali limiti residui.
```

## Fuori scope per questa iterazione

- Modifica dei contenuti narrativi.
- Modifica delle formule o dei grafici dal punto di vista dei dati.
- Redesign completo della Galassia.
- Nuove animazioni decorative.
- Nuove feature del report.
