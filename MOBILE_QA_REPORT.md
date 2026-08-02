# Mobile QA report — Report TST

## Esito

**PASS** dopo le correzioni documentate sotto.

- Worktree verificato prima di ogni modifica: `/Users/alessandrobiavaschi/Downloads/TST 2026 cursor-codex`
- Branch: `ai/codex`
- Browser: browser integrato, viewport espliciti e ispezione DOM/CSS
- Dati browser: record deterministico usato durante la sessione QA e rimosso dal codice prima del commit finale
- Nessun push e nessun merge su `ai/integration`

## Risultato per viewport

| Viewport | Documento | Testi/elementi | Grafici | Navigazione/layout | Esito |
| --- | --- | --- | --- | --- | --- |
| 320x568 | `scrollWidth 320 = clientWidth 320` | Nessun nodo visibile oltre viewport o testo tagliato | Responsive, altezza 340px, valori statici | Metriche e Portato a una colonna; bottom nav libera | **PASS** |
| 375x667 | `375 = 375` | Nessun nodo visibile oltre viewport o testo tagliato | Responsive, valori statici | Quattro azioni mobile, contenuto non coperto | **PASS** |
| 390x844 | `390 = 390` | Font mobile almeno 12px | Responsive e touch | Tab Natura completi e scorrevoli | **PASS** |
| 430x932 | `430 = 430` | Nessun clipping | Responsive e touch | Nessun vuoto rigido in Natura | **PASS** |
| 768x1024 | `768 = 768` | Nessun clipping | Responsive | Griglie e metriche impilate | **PASS** |
| 1440x900 | `1440 = 1440` | Struttura desktop invariata | Dimensioni e label desktop preservate | Rail desktop e griglia a tre colonne | **PASS** |

## Checklist richiesta

| # | Controllo | Risultato | Evidenza sintetica |
| --- | --- | --- | --- |
| 1 | Assenza overflow orizzontale | PASS | `scrollWidth === clientWidth` su tutti i viewport |
| 2 | Nessun elemento oltre viewport | PASS | Nessun elemento visibile fuori dai limiti; decorazioni cover mascherate |
| 3 | Nessun testo tagliato | PASS | Nessun nodo testuale visibile con clipping rilevato |
| 4 | Dimensioni minime font | PASS | Mobile >= 12px; corpo 16px; microtipografia desktop preesistente non alterata |
| 5 | Grafici responsive | PASS | `ResponsiveContainer`, dimensioni non nulle e SVG entro il contenitore |
| 6 | Tooltip touch | PASS | Target 40x40px; popover entro viewport; apertura al tap |
| 7 | Valori senza hover | PASS | Label statiche sui radar mobile |
| 8 | Metriche impilate | PASS | Una colonna fino a 768px; desktop resta a tre colonne |
| 9 | Tab/accordion accessibili | PASS | `tablist`/`tab`, roving tabindex, `aria-expanded`, `aria-controls`, Escape e focus return |
| 10 | Vuoto sezione Natura | PASS | Gap mobile regolare; eliminati vincoli rigidi anomali |
| 11 | Bottom navigation | PASS | Padding inferiore con safe area; nav sopra report e Galassia |
| 12 | Desktop invariato | PASS | Ordine/ID macro-blocchi coperti da test; layout 1440 verificato |
| 13 | Nessuna regressione dati | PASS | Utility dati non modificate; contratti esistenti tutti verdi |
| 14 | Nessun cambiamento punteggi | PASS | `testLogic.js` non modificato; nuova fixture golden 72 risposte |
| 15 | Nessun errore console | PASS | Console browser finale vuota per livelli error/warn |
| 16 | Nessun warning React | PASS | Rimossa nidificazione di pulsanti; console pulita |
| 17 | Nessuna chiave/ID duplicata | PASS | Nessun warning key; eliminato ID duplicato Portato |
| 18 | Nessuna altezza rigida anomala | PASS | Altezze grafico intenzionali; sezioni narrative fluide |
| 19 | Sei viewport richiesti | PASS | Matrice completa riportata sopra |

## Test eseguiti

- `npm test`: **PASS, 43/43**.
- `npm run lint`: **PASS**, zero errori.
- `npm run build`: **PASS**, 1225 moduli trasformati.
- Matrice browser ai sei viewport richiesti.
- Ispezione overflow documento, bounding box visibili, clipping testuale, font mobile e ID duplicati.
- Rendering Recharts con dimensioni non nulle e label statiche mobile.
- Apertura/chiusura accordion, attributi ARIA e tooltip al tap.
- Navigazione Report/Galassia e menu mobile con Escape e ripristino focus.
- Verifica bottom nav in fondo al documento e sopra la Galassia.
- Verifica console error/warning dopo nuova apertura della pagina.
- Verifica desktop 1440x900 e contratto automatico dell'ordine dei macro-blocchi.

### Test aggiunti

- `test/mobileReportContracts.test.js`: breakpoint, overflow/padding, grafici responsive, navigazione mobile e struttura desktop.
- `test/scoringRegression.test.js`: mappa delle 72 domande, pesi speciali e punteggi golden.

## Problemi trovati

- `EmotionalShape.jsx` aveva JSX incompleto e impediva lint/build.
- Il grid layout poteva espandersi fino alla larghezza intrinseca dei grafici, mascherando un overflow reale.
- Metriche e Portato generavano colonne implicite su mobile.
- Valori dei radar erano affidati all'hover.
- Tooltip piccoli o posizionati fuori viewport su touch.
- Bottom navigation poteva finire sotto il layer Galassia o coprire il contenuto finale.
- Tab Natura abbreviati/rigidi e spazio verticale anomalo.
- Pulsante tooltip annidato nel pulsante accordion, con warning React.
- Recharts veniva montato in pannelli chiusi, producendo warning di misura.
- ID duplicato nella sezione Portato e label mobile `For Musicians` alterata.

## Problemi corretti

- Ripristinato il rendering valido di `EmotionalShape` e corrette le label ARIA per petalo.
- Resi comprimibili shell, griglie e figli con `minmax(0, 1fr)`/`min-width: 0`.
- Impilate metriche e Portato su mobile.
- Aggiunte label statiche ai radar mobile, conservando la resa desktop.
- Portati i target tooltip a 40x40px e confinati i popover nel viewport.
- Aggiunti padding safe-area e ordine di stacking corretto alla bottom navigation.
- Resi fluidi e accessibili tab Natura e accordion.
- Rimossi nesting interattivo, ID duplicato e mount dei grafici nei pannelli chiusi.
- Ripristinata la label originale `For Musicians`.

## Problemi residui

Nessun problema bloccante o regressione verificabile residua. Lo scorrimento orizzontale interno dei tab/pill è intenzionale e non aumenta la larghezza del documento. Non è stata aggiunta una dipendenza E2E: la matrice visuale resta una verifica browser manuale/strumentata, mentre i contratti stabili sono coperti con `node:test`.
