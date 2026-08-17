# MOBILE_REPORT_AUDIT — Report TST su mobile

**Tipo documento:** audit only, nessun codice modificato.
**Autore:** Claude Code (ruolo: architettura/logica/contenuti — vedi `AI_TASK.md`).
**Scope:** `src/pages/ReportPage.jsx` e l'albero `src/components/report/*` con i relativi CSS.
**Metodo:** lettura diretta di codice e CSS con numeri di riga; nessuna assunzione non verificata nel codice sorgente. Dove la causa è probabile ma non certa (dipende da contenuto dati, non da CSS) è segnalato esplicitamente come tale.

Non è uno "shrink" del desktop: alcuni componenti (`SintesiCorrenti`, `GalassiaView`, `ProfiloEmotivo` tab) hanno **già** un ramo mobile dedicato (via `matchMedia`/breakpoint + classi `*-mobile-*`). Il problema non è l'assenza totale di adattamento, ma **incoerenze tra i livelli di override** (breakpoint sovrapposti, regole `!important` sparse su più file, un componente di navigazione con un bug di layout concreto) che vanificano parzialmente il lavoro mobile già fatto.

---

## 1. Componenti React coinvolti

| Componente | Ruolo nel report | Stato mobile |
|---|---|---|
| `src/pages/ReportPage.jsx` | orchestratore pagina, importa `report-tst.css` | n/a (routing/data only) |
| `src/components/report/ReportShell.jsx` | layout shell: hero, navbar, `ReportSectionController`, sezioni | contiene il bug di duplicazione nav (§8) |
| `src/components/report/NavbarTST.jsx` | sub-bar sticky Report/Galassia/For Musicians + azioni | ha override mobile ma con conflitto di breakpoint (§3) |
| `src/components/report/ReportSectionController.jsx` | indice sezioni: renderizza **sempre entrambe** le varianti `--mobile` e `--rail` nello stesso DOM | causa la nav duplicata (§8) — bug concreto, non ipotesi |
| `src/components/report/HeroScreen.jsx` | hero apertura, legenda natura/disposizione, "journey steps" | griglia a 5 colonne solo parzialmente adattata (§9) |
| `src/components/report/SintesiCorrenti.jsx` | dati chiave + radar + word-bars | **ha già** un ramo mobile JS-driven (`isMobileViewport`, `matchMedia(max-width:768px)`, righe 408-411, 584) — priorità bassa, solo rifiniture |
| `src/components/report/ReportRadarChart.jsx` | wrapper Recharts riusato da Sintesi/QuattroRapporti | margini e font-size fissi in px, non scalano (§5) |
| `src/components/report/EmotionalShape.jsx` | "fiore" SVG a 5 petali (viewBox scalabile) | testo hint hardcoded non touch-aware (§7) |
| `src/components/report/ProfiloEmotivo.jsx` | capitoli Natura/Racconto/Risorse/Ombre a tab | contiene il chapter "Natura" oggetto di §6 |
| `src/components/report/QuattroRapporti.jsx` + `quattro-rapporti.css` | tab + radar comparativo 2 colonne | mobile già gestito correttamente (unico riscontro pulito, vedi §9) |
| `src/components/report/DialogoCorrenti.jsx`, `SezionePortatoEsperienziale.jsx`, `ParoleStatiAnimo.jsx`, `ApprofondimentoSezioni.jsx`, `OperatorSection.jsx` | sezioni successive del report | non hanno mostrato pattern problematici distintivi nella lettura CSS; da verificare via screenshot reale (Codex/Antigravity), non hanno causato red flag nel codice |
| `src/components/report/GalassiaView.jsx` + `galassia-view.css` | vista alternativa "Galassia" | **ha già** un'alternativa mobile completa (`.galassia-mobile-alternative`, card-index, tst-mobile.css righe 877-1186) — priorità bassa |
| `src/components/report/CompassEmotionalDiagram.jsx`, `GlassyEmotionalDiagram.jsx` | componenti grafici | **non importati da nessun file** (dead code, verificato via grep) — fuori scope, non serve intervento |

Tailwind: verificato — i componenti del report **non usano classi utility Tailwind**, solo CSS custom (BEM-like) nei file elencati in §2. Non cercare classi `md:`/`sm:` qui: non esistono in quest'area.

---

## 2. File CSS coinvolti

| File | Righe | Ruolo |
|---|---|---|
| `src/styles/report-tst.css` | 5314 | foglio principale del report, ~20 breakpoint diversi |
| `src/styles/tst-mobile.css` | 1187 | overlay mobile **globale** (`@media max-width:768px`, quasi tutto `!important`), importato in `App.jsx` — copre header app, drawer, alcune sezioni del report (profilo-chapter-nav, report-tst-actions, galassia alternativa) ma **non** copre `.navbar-tst`, `.sintesi-correnti`, `.report-section-controller` |
| `src/components/report/SintesiCorrenti.css` | 1879 | proprio della sezione Sintesi, include il ramo mobile dedicato (righe 1358-1602) |
| `src/styles/quattro-rapporti.css` | 302 | proprio di QuattroRapporti, mobile pulito |
| `src/styles/galassia-view.css` | ~5700 | vista Galassia, molti breakpoint (768/900/1180 tra gli altri) |
| `src/styles/dialogo-correnti.css`, `src/styles/sezione-musica.css` | piccoli | breakpoint singoli (480px, 720px), nessun pattern a rischio rilevato |
| `src/components/report/CalculationDisclosure.css` | 130 | nessun breakpoint mobile-specifico oltre `prefers-reduced-motion` |

**Punto critico:** esistono **due sistemi di override mobile sovrapposti** — `tst-mobile.css` (globale, `!important`, breakpoint unico 768px) e i breakpoint locali dentro `report-tst.css`/`SintesiCorrenti.css` (senza `!important`, breakpoint vari: 420/620/640/680/720/760/768/900/960/1080/1099/1100/1180/1200). Quando un selettore esiste in entrambi i sistemi (es. `.profilo-chapter-nav`), vince `tst-mobile.css` per via di `!important`, indipendentemente dall'ordine di caricamento. Quando un selettore esiste **solo** in uno dei due (es. `.navbar-tst`, `.report-section-controller`), non c'è conflitto ma la copertura è incompleta o ha bug locali (vedi §3, §8).

---

## 3. Larghezze fisse, min-width/height, positioning problematici

1. **`report-tst.css:388-397` vs `report-tst.css:550-556` — conflitto reale su `.navbar-tst__bar`.**
   A `≤768px` la regola imposta `height: 48px` (altezza fissa, non `min-height`) su una barra che resta `display:grid; grid-template-columns: minmax(0,1fr) auto minmax(0,1fr)` (riga base 617-618, invariata).
   A `≤760px` un'**altra** regola cambia lo stesso elemento in `grid-template-columns: 1fr` (impilamento verticale di logo/switch/azioni su 3 righe), ma **non tocca `height`**, che resta `48px` fisso ereditato dalla regola a 768px.
   Le due media query sono entrambe attive per ogni larghezza ≤760px (760 < 768): il risultato è un contenitore a 3 righe impilate forzato in un box alto 48px, con overflow visivo (nessun `overflow:hidden` sul box, quindi il contenuto eccedente non viene tagliato ma trabocca fuori dal box sticky). Bug concreto, non ipotesi — verificabile leggendo le due regole in sequenza.

2. **`SintesiCorrenti.css:1759-1761` — `.detail-panel__metrics-grid { grid-template-columns: repeat(3, 1fr); }`** non ha **nessuna** regola di override in nessun breakpoint del file (verificato con grep mirato su tutte le occorrenze di `grid-template-columns` nel file). Questo pannello (aperto quando si seleziona una famiglia sul radar, sia in ramo mobile che desktop — chiamato da `renderDetailPanel()` sia in `SintesiCorrenti.jsx:772` mobile che nel ramo desktop) mostra sempre 3 colonne di metriche, anche su schermi stretti. Causa diretta del sintomo "metriche compresse in più colonne".

3. **`report-tst.css:939-947` — `.report-section-controller__mobile-scroll-container`**: `overflow-x: auto; overflow-y: hidden; max-height: min(42vh, 320px)`, pensato per pillole scrollabili orizzontalmente (commento a riga 922: "Horizontal scrollable pills"). Ma il figlio diretto `.report-section-controller__mobile-steps` (riga 998-1006) ha `flex-direction: column` mai resettato a `row` in nessun override successivo (verificato: la regola a `≤1099px`, riga 3611-3617, imposta `display:flex; gap:8px` ma non `flex-direction`, quindi `column` resta valido per cascata). Risultato: una lista **verticale** di sezioni dentro un contenitore che scrolla solo in **orizzontale** e taglia il verticale a 320px — se le sezioni sono più di ~7 alcune diventano irraggiungibili (non c'è modo di scrollarle in verticale). Bug concreto.

4. **`SintesiCorrenti.css:23` — `.sintesi-correnti__answer-card { grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.8fr); }`**: colonna minima 18rem (288px). Va in `1fr` a `≤760px` (riga 1224-1228), **ma** questo ramo del componente è quello "desktop" di `SintesiCorrenti.jsx` (righe 780+), che **non viene mai montato** su viewport ≤768px perché il componente sceglie il ramo `isMobileViewport` (riga 408-411, 584) prima di arrivare lì. Quindi su telefono reale questo non è un problema attivo; **resta un rischio solo per tablet 769-900px**, dove il ramo desktop è montato e la colonna da 288px può stringere il layout. Priorità bassa, non è la causa dei sintomi riportati su mobile.

5. **`tst-mobile.css:829-835` — `.profilo-chapter-nav__btn { width: 120px; }`** (fisso, dentro `@media max-width:768px`, con `!important`). Intenzionale (tab a scroll orizzontale), ma 120px è stretto per etichette come "Memoria, Esperienza, Essere Musica" (`CHAPTER_NAV_LABELS.racconto` in `ProfiloEmotivo.jsx:16`) — probabile causa concreta di "tab interni troppo stretti".

---

## 4. Breakpoint esistenti (mappa completa)

Valori trovati via grep `@media` su tutti i file CSS del report:

```
420, 480, 560, 620, 640, 680, 720, 760, 768, 780(height),
900, 960, 1080, 1099, 1100, 1180, 1200
```

Non esiste un set coerente di breakpoint condivisi: ogni file (e a volte ogni sezione dello stesso file) ha scelto la propria soglia. `tst-mobile.css` usa **solo 768px** come limite "mobile", mentre `report-tst.css`/`SintesiCorrenti.css`/`galassia-view.css` frammentano lo stesso concetto su 420-1200px. Questo non è di per sé un bug, ma è la causa strutturale per cui interventi mirati in futuro (anche non di questo audit) rischiano di creare nuove incoerenze se non si rispetta quale file "vince" per quale soglia.

---

## 5. Componenti grafici Recharts / SVG / Canvas

| Componente | Tecnologia | Scaling | Rischio leggibilità mobile |
|---|---|---|---|
| `ReportRadarChart.jsx` (righe 127-160) | Recharts `ResponsiveContainer` + `RadarChart` | contenitore scala (`width:100%`), **ma** `margin={{ top:10, right:30, bottom:10, left:30 }}` è fisso in px e le etichette assi (`ReportRadarAxisTick`, riga 71: `fontSize={13}`) sono a dimensione fissa, non wrappano. Su un container ~300-340px di larghezza (mobile), nomi famiglia lunghi ai vertici sinistro/destro possono uscire dal margine di 30px riservato. Causa diretta candidata per "grafici radar non leggibili". |
| `EmotionalShape.jsx` (righe 100-106) | SVG puro, `viewBox="40 40 1120 1120"`, `width="100%" height="100%"` | scala correttamente (viewBox), non è un problema di ridimensionamento | testo istruzioni hardcoded, vedi §7 |
| `FioreCorrenti.jsx` (usato in `ReportShell.jsx`), `FioreMood.jsx` (usato in `ResultsPage.jsx`, fuori scope report) | verosimilmente SVG/canvas — non hanno mostrato pattern di larghezza fissa nella lettura, ma non sono stati aperti riga per riga in questo audit (bassa priorità, nessun sintomo riportato li riguarda direttamente) | — |
| `GalassiaView.jsx` | mix SVG/canvas per il grafo — ha già un'alternativa mobile completa a card (`galassia-mobile-alternative` in `tst-mobile.css`) | — | priorità bassa |
| `CompassEmotionalDiagram.jsx`, `GlassyEmotionalDiagram.jsx` | SVG | **dead code**, non importati da nessuno | fuori scope |

---

## 6. Cause dello spazio vuoto in "La Natura dell'Entusiasta"

Titolo verificato in `src/config/reportFamilyTheme.js:78` (`natura: "La Natura dell'Entusiasta"`), è il titolo personalizzato del capitolo `natura` in `ProfiloEmotivo.jsx` per la famiglia Giallo.

**Verificato: non è un bug CSS.** `ChapterBlock` (`ProfiloEmotivo.jsx:54-92`) non ha nessun `min-height` o contenitore a dimensione fissa — il pannello scorre libero in base al contenuto (`motion.div.profilo-chapter-block__panel`, nessun CSS con altezza forzata trovato per questa classe). Escluso anche un problema di lunghezza contenuto per famiglia: `descrizione_estesa` in `content_report.json` per Giallo è 429 caratteri, in linea con le altre famiglie (Rosso 492, Verde 424, Grigio 383, Blu 263).

**Causa reale identificata in `src/utils/profiloDisplayCopy.js`:**
- Riga 71: `natura: { maxParagraphs: 4, maxListItems: 0 }` — il capitolo "Natura" per **tutte** le famiglie è vincolato a **zero elenchi puntati**, a differenza di "Risorse"/"Ombre"/"Racconto" che includono liste (`enableList`, riga 181).
- Righe 130-165: per ogni famiglia esiste un **singolo paragrafo curato** (`DISPLAY_BY_FAMILY[fam].natura`), non derivato da `descrizione_estesa` — es. per Giallo (riga 151-153): un solo paragrafo di ~350 caratteri.

Il capitolo "Natura" è quindi **strutturalmente il più corto di tutti** (1 solo paragrafo breve, mai una lista), per progetto dei contenuti, non per un difetto di CSS. Su schermo mobile — dove ogni "schermata" di tab equivale a molto meno testo visibile che su desktop — questo singolo paragrafo circondato dal padding di sezione (`report-tst.css:2900`, `padding: clamp(3rem, 8vw, 7.5rem) 0` applicato all'intera `ProfiloEmotivo`, non solo al capitolo Natura) produce l'impressione di un grande vuoto rispetto agli altri tre capitoli (che hanno paragrafo + lista).

**Questo è un confine tra dominio contenuti e dominio layout:**
- Lato contenuti (fuori scope per Antigravity, dominio Claude Code): valutare se arricchire il paragrafo curato di "natura" con più testo o un elenco, coerente per tutte le famiglie.
- Lato layout (dominio Antigravity, senza toccare testo): non forzare la stessa spaziatura verticale generosa (`--space-lg`, padding di sezione) quando il capitolo attivo ha un solo blocco di contenuto — es. ridurre lo spazio sotto al paragrafo quando non segue una lista, oppure introdurre un elemento visivo leggero (non testuale) che non richiede di toccare le stringhe.

Non proporre una soluzione definitiva in questo audit: segnalare il bivio a chi riceve l'incarico.

---

## 7. Cause dell'overflow orizzontale / contenuti tagliati

**Causa strutturale principale:** `report-tst.css:100` — il contenitore radice `.report-tst` ha `overflow-x: hidden` su tutta la pagina (`min-height:100vh; width:100%; overflow-x:hidden`). Questo non **previene** l'overflow, lo **nasconde**: qualunque figlio che eccede la larghezza del viewport non produce uno scroll orizzontale visibile (che almeno segnalerebbe il problema) ma viene **tagliato silenziosamente al bordo destro**. Questo spiega perché il sintomo riportato è "contenuti tagliati orizzontalmente" e non "la pagina scrolla lateralmente".

Sorgenti concrete di overflow che questo `overflow-x:hidden` sta mascherando:
- Il conflitto `.navbar-tst__bar` di §3.1 (contenuto a 3 righe forzato in un box con `grid-template-columns` non impilata correttamente sotto i 768px se non completamente sotto i 760px).
- Le etichette del radar chart (§5) che possono eccedere il margine fisso di 30px.
- Il bug di `.report-section-controller__mobile-steps` (§3.3, dettagliato anche in §8) — colonna verticale dentro un contenitore che scrolla solo in orizzontale.

**Istruzioni desktop residue su mobile ("Passa il cursore"):**
Trovate 4 occorrenze via grep mirato:
- `src/components/report/SintesiCorrenti.jsx:747` — **dentro il ramo `isMobileViewport` (righe 584-778)**, quindi visibile esplicitamente su mobile: `"Passa il cursore sui vertici per i punteggi esatti."` — bug confermato, il testo assume un mouse che su touch non esiste.
- `src/components/report/SintesiCorrenti.jsx:846` e `:1033` — stesso testo ma nel ramo desktop (dopo `return` di riga 780), corretto per quel contesto, non serve intervento.
- `src/components/report/EmotionalShape.jsx:298` — `"Passa il cursore o premi Tab sui petali..."` — questo componente è condiviso tra ramo mobile e desktop (richiamato anche dentro il branch mobile di `SintesiCorrenti.jsx:762`), quindi il messaggio raggiunge sempre l'utente mobile anche se include un fallback tastiera ("premi Tab") che su touch è ugualmente non pertinente.

---

## 8. Navigazioni duplicate presenti su mobile

**Bug concreto e ad alta confidenza — non un'ipotesi di design, è verificabile leggendo tre file in sequenza:**

1. `ReportSectionController.jsx` (righe 201-228) restituisce **sempre entrambe** le varianti di navigazione nello stesso render, come fratelli in un Fragment:
   - `<nav className="report-section-controller report-section-controller--mobile">` (righe 203-213)
   - `<nav className="report-section-controller report-section-controller--rail">` (righe 215-226)
2. `ReportShell.jsx:456` monta `<ReportSectionController>` come figlio diretto di `.report-tst-layout` (riga 452), fratello di `.report-tst-layout__main` (riga 462) — cioè: entrambi i `<nav>` finiscono nello stesso contenitore grid del contenuto principale, non in un componente isolato.
3. In `report-tst.css`, `.report-section-controller--rail` **non ha nessuna regola di visibilità fuori dal blocco `@media (min-width: 1100px)`** (riga 1104-1124; unica altra occorrenza è dentro `@media print`, riga 4789). Senza un `display: none` di base, un elemento `<nav>` usa il default del browser (`display: block`). Sotto i 1100px, `.report-tst-layout` è a colonna singola (`grid-template-columns: 1fr`, riga 898, regola base non sovrascritta sotto 1100px tranne che a 1099px/768px per altre proprietà) — quindi il rail, invece di sparire, **si impila in flusso normale subito dopo la barra pillole mobile**, mostrando una seconda lista completa delle stesse sezioni (con gli stili propri di `.report-section-controller__section--rail`, `.report-section-controller__rail-list`, entrambi definiti senza guardia di breakpoint).

Risultato pratico su un telefono: l'utente vede, prima ancora di iniziare a leggere il report, (a) la sub-bar sticky di `NavbarTST` con lo switch Report/Galassia/For Musicians, poi (b) la barra pillole di `ReportSectionController--mobile` (essa stessa con un bug di overflow, §3.3), poi (c) **una seconda lista di navigazione** (`--rail`, pensata per la sidebar desktop) resa in blocco verticale — tre livelli di navigazione impilati prima di arrivare al primo contenuto reale. Questo è la causa più probabile, e la meglio evidenziata nel codice, di "navigazione iniziale ridondante" e contribuisce alla sensazione di "bottom navigation sovraffollata" (l'utente scrolla oltre più liste di link prima del contenuto).

Nota terminologica: i selettori `.report-xp-dock` e `.report-xp-mobile-bar`, per cui `tst-mobile.css` (righe 412-420) contiene ancora regole dedicate, **non esistono in nessun componente JSX attuale** (grep su tutto `src/`: zero risultati fuori da `tst-mobile.css`). Sono CSS morto, residuo di una versione precedente della navigazione. Da non confondere con il bug reale sopra descritto.

---

## 9. Componenti da passare da grid a colonna singola

| Selettore | File | Colonne attuali | Override mobile esistente? |
|---|---|---|---|
| `.detail-panel__metrics-grid` | `SintesiCorrenti.css:1761` | `repeat(3, 1fr)` | **nessuno** — da correggere |
| `.navbar-tst__bar` | `report-tst.css:618` | grid 3 zone | override esistente ma **in conflitto** (§3.1) — da armonizzare, non da riscrivere da zero |
| `.report-section-controller__mobile-steps` | `report-tst.css:998` | flex-direction:column mai resettato dentro un contenitore overflow-x:auto | bug di coerenza, non di "quante colonne" — da correggere insieme al punto §8 |
| `.hero-screen__journey-steps` | `report-tst.css:2866` | `repeat(5, 1fr)` | diventa `1fr 1fr` (2 colonne) solo sotto 640px (riga 1445-1447) — accettabile ma da verificare visivamente tra 641-768px |
| `.report-reading-guide__steps` | `report-tst.css:1321` | `repeat(5, 1fr)` | **già gestito**: `repeat(2,1fr)` a ≤1180px, `1fr` a ≤640px — nessun intervento necessario |
| `.quattro-rapporti-main` | `quattro-rapporti.css:100` | `55fr 1px 45fr` | **già gestito**: `1fr` a ≤768px, divider nascosto, min-height azzerato — nessun intervento necessario, riferimento di buona pratica da imitare |
| `.sintesi-correnti__answer-subcurrents-list` | `SintesiCorrenti.css:108` | `repeat(3, 1fr)` | va a `1fr` a ≤760px (riga 1234-1236) — ma ricadi nel ramo desktop non montato su telefono (§3.4), priorità bassa |

---

## 10. Rischi di regressione desktop

Da tenere presente per chi implementerà le correzioni (Antigravity):

1. **Non toccare le regole dentro `@media (min-width: 1100px)`** in `report-tst.css` (righe 1083-1157 e successive) — è lì che vive il layout desktop a due colonne con sidebar rail. Il fix di §8 riguarda solo l'assenza di un `display:none` di default per `.report-section-controller--rail` **fuori** da quel blocco.
2. **Non cambiare la soglia `matchMedia('(max-width: 768px)')`** usata in `SintesiCorrenti.jsx:411` e nell'equivalente di `GalassiaView.jsx` senza allineare contestualmente i breakpoint CSS collegati: questi componenti montano un **albero JSX diverso** sotto/sopra quella soglia, non solo CSS — un disallineamento produce doppio rendering o contenuto mancante, non solo un problema estetico.
3. **`tst-mobile.css` usa `!important` in modo estensivo**: qualunque nuova regola mobile per selettori già coperti lì va aggiunta nello stesso file/specificità, non in `report-tst.css`, altrimenti resta senza effetto pur sembrando corretta in lettura del solo file modificato.
4. **Il fix di `.navbar-tst__bar` (§3.1) deve preservare la resa desktop a 3 colonne** (`minmax(0,1fr) auto minmax(0,1fr)`, riga 618) invariata sopra i 768px — il problema è solo nella sovrapposizione 760-768px.
5. **Non toccare `content_report.json`, `profiloDisplayCopy.js`, `reportFamilyTheme.js`** per il punto §6: sono dominio contenuti (Claude Code), non layout. Se emerge la necessità di arricchire il paragrafo "Natura", va segnalato, non deciso unilateralmente da chi lavora sul CSS.
6. **`CompassEmotionalDiagram.jsx` e `GlassyEmotionalDiagram.jsx` sono dead code**: non vanno "sistemati" per mobile, vanno ignorati (o proposta separata di rimozione, fuori scope qui).

---

## Piano di modifica ordinato (proposta, da confermare prima di eseguire)

1. **`report-tst.css` — risolvere il conflitto `.navbar-tst__bar` (§3.1).** Unificare la regola mobile in un solo breakpoint (768px, coerente con il resto del sistema), rimuovere la ridondanza a 760px o farla convergere. Impatto: alto (bug visivo attivo su ogni report visto da telefono).
2. **`report-tst.css` — aggiungere `display: none` di default a `.report-section-controller--rail` fuori dal blocco `min-width:1100px` (§8).** Fix a una riga, rimuove la nav duplicata. Impatto: molto alto, è la causa meglio evidenziata di "navigazione iniziale ridondante".
3. **`report-tst.css` — correggere `.report-section-controller__mobile-steps` (§3.3, §8).** Decidere il comportamento voluto (lista orizzontale a pillole scrollabili, coerente col commento originale "Horizontal scrollable pills") e allineare `flex-direction`/`overflow-x`/`overflow-y` di conseguenza.
4. **`SintesiCorrenti.css` — aggiungere override mobile a `.detail-panel__metrics-grid` (§3.2, §9).** Da 3 a 1 colonna (o 1-2 con breakpoint intermedio) sotto ~480-560px.
5. **`ReportRadarChart.jsx` / `ReportRadarChart` CSS collegato — rendere responsive margini ed etichette (§5).** Margini e `fontSize` proporzionali al container invece che fissi; eventualmente troncare/abbreviare le etichette famiglia sotto una soglia di larghezza.
6. **`SintesiCorrenti.jsx:747` — sostituire il testo hover-only nel ramo mobile (§7).** Testo alternativo touch-appropriate (es. "Tocca i vertici per i punteggi esatti") o rimozione se il tap non è realmente interattivo su quel grafico in versione mobile — verificare comportamento reale prima di scegliere.
7. **`EmotionalShape.jsx:298` — stesso intervento del punto 6, versione condivisa mobile/desktop:** serve un testo o una logica condizionale che distingua touch da mouse (`onFamilyHover`/`onFamilySelect` sono già passati come prop, quindi il componente ha già l'informazione per adattare il messaggio).
8. **`tst-mobile.css:829-835` — valutare larghezza minima dei tab `.profilo-chapter-nav__btn` (§3.5).** Da 120px fisso a `min-width` con contenuto che può abbreviare l'etichetta lunga ("Memoria, Esperienza, Essere Musica"), senza toccare `CHAPTER_NAV_LABELS` in `ProfiloEmotivo.jsx` (dominio contenuti).
9. **`tst-mobile.css:412-420` — rimuovere le regole morte `.report-xp-dock`/`.report-xp-mobile-bar` (§8, nota).** Pulizia, non correttiva: solo dopo aver confermato con Codex che nessun componente le referenzia più (già verificato via grep in questo audit, ma una seconda verifica prima di cancellare è prudente).
10. **Segnalazione (non esecuzione) — spazio vuoto "Natura" (§6).** Aprire un confronto con il lato contenuti su se/come arricchire il capitolo "Natura", oppure applicare un fix di solo-layout (spaziatura adattiva) che non cambia testo.

Punti 1-2-3 sono i più impattanti e a rischio di regressione più basso (fix mirati su bug oggettivi). I punti 6-7-8 toccano testo/copy — rispettare "Regole testo vincolanti" di `CLAUDE.md` (mai alterare il significato, niente kicker non richiesti).

---

## Ownership dei file

Secondo la divisione già attiva in `AI_TASK.md`:

**File che Antigravity può modificare (UI/CSS/layout, nessuna logica di calcolo):**
- `src/styles/report-tst.css`
- `src/styles/tst-mobile.css`
- `src/components/report/SintesiCorrenti.css`
- `src/components/report/ReportRadarChart.jsx` (solo styling/dimensioni, non la logica dati passata via props)
- `src/components/report/EmotionalShape.jsx` (solo testo hint condizionale e styling, non la logica di calcolo attivo/hover)
- `src/components/report/NavbarTST.jsx` (solo se il fix di §3.1 richiede modifiche JSX oltre al CSS — verificare prima se basta CSS)
- `src/components/report/ReportSectionController.jsx` (solo se il fix di §8 richiede di non renderizzare il rail lato JS invece che via CSS — da preferire comunque la soluzione CSS, meno invasiva)
- `src/styles/quattro-rapporti.css` (solo se emergono regressioni da verificare, nessun intervento pianificato)

**File che restano fuori scope / dominio Claude Code (non toccare senza handoff esplicito):**
- `src/config/reportFamilyTheme.js`
- `src/content_report.json`
- `src/utils/profiloDisplayCopy.js`
- `src/utils/buildReportData.js`
- `src/testLogic.js`

**File che Codex dovrà testare/verificare:**
- Build/lint dopo ogni modifica (`npm run build`, `npm run lint`) — nessuna test suite automatica esiste (confermato in `CLAUDE.md`).
- Verifica manuale/browser reale su almeno 3 breakpoint: ~375px (iPhone SE/mini), ~390-430px (iPhone standard/Pro Max), ~768px (tablet/soglia critica dei conflitti §3.1).
- Verifica specifica del punto §8 (nav duplicata): confermare che dopo il fix compaia **una sola** lista di navigazione sezioni su schermi <1100px, e che il rail resti visibile e funzionante ≥1100px (nessuna regressione desktop).
- Verifica specifica del punto §3.3 (mobile-steps): confermare che tutte le sezioni del report siano raggiungibili dalla barra di navigazione mobile, non solo le prime ~7.
- Verifica del radar chart (§5) su viewport stretto (≤360px) per etichette tagliate/sovrapposte, sia nel ramo mobile di `SintesiCorrenti` sia in `QuattroRapporti`.
- Verifica che il fix di `.navbar-tst__bar` (§3.1) non rompa la resa a 3 colonne sopra 768px (regressione desktop, §10.4).
- Verifica testo "Passa il cursore" (§7): confermare che su device touch reale (non solo devtools responsive mode, che non sempre riflette `hover`/`pointer` media features) il nuovo testo sia coerente.

---

## Criteri di accettazione

- [ ] Su viewport ≤768px non è più visibile una seconda lista di navigazione sezioni oltre alla barra sticky principale (§8).
- [ ] `.navbar-tst__bar` non mostra contenuto troncato/sovrapposto tra 320px e 768px di larghezza (§3.1).
- [ ] Tutte le voci di `ReportSectionController` (mobile) sono raggiungibili/cliccabili, nessuna tagliata dal contenitore (§3.3).
- [ ] Il pannello dettaglio radar (`.detail-panel__metrics-grid`) non mostra più di 2 colonne sotto ~480px (§3.2, §9).
- [ ] Le etichette del radar chart (famiglie/correnti) restano leggibili e non escono dal contenitore su viewport ≤360px (§5).
- [ ] Nessun testo tipo "Passa il cursore"/"premi Tab" compare sul ramo reso per viewport mobile (§7).
- [ ] Il layout desktop (≥1100px per la sidebar rail, ≥768px per navbar/sezioni) resta visivamente invariato rispetto allo stato pre-intervento (nessuna regressione, §10).
- [ ] `npm run lint` e `npm run build` passano senza nuovi errori.
- [ ] Nessuna modifica a `content_report.json`, `profiloDisplayCopy.js`, `reportFamilyTheme.js`, `testLogic.js`, `buildReportData.js` (dominio contenuti/logica, invariato).
- [ ] Nessun testo del report è stato riformulato o il suo significato alterato (solo CSS/JSX di presentazione toccati, coerente con "Regole testo vincolanti" di `CLAUDE.md`).

---

## Elenco sintetico file da modificare (Antigravity)

```
src/styles/report-tst.css
src/styles/tst-mobile.css
src/components/report/SintesiCorrenti.css
src/components/report/ReportRadarChart.jsx
src/components/report/EmotionalShape.jsx
src/components/report/NavbarTST.jsx          (solo se necessario oltre al CSS)
src/components/report/ReportSectionController.jsx   (solo se necessario oltre al CSS)
```

## Elenco sintetico file da testare (Codex)

```
src/pages/ReportPage.jsx
src/components/report/ReportShell.jsx
src/components/report/NavbarTST.jsx
src/components/report/ReportSectionController.jsx
src/components/report/SintesiCorrenti.jsx
src/components/report/ReportRadarChart.jsx
src/components/report/EmotionalShape.jsx
src/components/report/QuattroRapporti.jsx
src/components/report/ProfiloEmotivo.jsx
```
