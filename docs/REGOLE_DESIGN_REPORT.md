# Regole design del report TST

Regole vincolanti per qualsiasi intervento su UI e layout del report. Spostate da CLAUDE.md il 10 ottobre 2026, testo invariato.

## Regole design vincolanti

**Testo paragrafi:** `max-width: 65ch`, `line-height: 1.65`, `text-align: left` — mai `justify` senza `hyphens: auto` e `lang="it"` sull'elemento.

**Font:** serif solo per `h1`–`h3`; sans-serif per corpo testo e UI; monospace esclusivamente per micro-etichette tipo "QUOTA" o "PREVALENZA" — mai per titoli, chip, legende o testi di grafici.

**Colore accento:** ogni report usa il colore della propria natura emotiva, letto da una variabile CSS (`--accent`). Usarlo solo per: numeri di capitolo, callout identitari, chip della natura prevalente, voce attiva del percorso di lettura. Mai per dati negativi (Antipatia usa sempre un neutro freddo, indipendentemente dalla natura). Non hardcodare mai un colore specifico nei componenti: usare sempre `var(--accent)`.

**Numerazione sezioni:** un solo sistema — cerchietto numerato; sottocapitoli in formato `1.1` nello stesso stile.

**Scroll anchor:** ogni ancora di sezione ha `scroll-margin-top: 140px` per non finire sotto l'header sticky.

**Accordion:** i titoli mantengono lo stesso font (serif) sia chiusi che aperti.

**Scala di spaziatura:** 4 soli valori, in variabili CSS — `--space-xs: 8px`, `--space-sm: 16px`, `--space-md: 32px`, `--space-lg: 64px`. Nessun altro valore di margin/padding fuori scala. Uso: spazio tra paragrafi = `--space-xs`/`--space-sm` (piccolo); spazio tra blocco e blocco = `--space-md` (medio); spazio tra capitoli = `--space-lg` (grande). Mai margini inline hardcodati (es. `style={{ marginTop: 32 }}`) per sostituire la scala.

**Massimo due livelli di contenitore visibile:** il capitolo (accordion) è il primo livello; dentro, il contenuto scorre libero sul fondo pagina, senza card. Solo un elemento che è davvero un'unità a sé (callout tipo "Come leggere il grafico" o "Consiglio pratico", grafico, box di dettaglio) può avere un secondo livello visibile (bordo/sfondo proprio). Niente card intermedie che wrappano solo testo scorrevole tra il titolo del capitolo e il primo elemento reale. Un callout dentro una card perde bordo e sfondo (tiene solo la barra laterale colorata) — il bordo/sfondo si applica una sola volta per ramo. Padding interno dei contenitori rimasti: un solo valore, dalla scala di spaziatura sopra.


## Convenzioni UI (dettagli in `GUIDA_UI_UX.md`)
Riusare le classi CSS esistenti — non crearne varianti ad-hoc: `page`, `page-header`, `page-card`, `nav-button primary/secondary/ghost`, `answers-grid`, `feedback-field`, `report-section`. Ogni pagina ha una sola CTA primaria. Flussi lunghi (es. test 72 step) mostrano sempre "Passo N di 72" + progress bar + nome sezione corrente.
