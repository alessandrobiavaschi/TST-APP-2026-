## Guida UI/UX per TST 2026

Questa guida serve per mantenere coerente l’esperienza utente tra Landing, Test, Report e console operatori.

---

## 1. Principi generali

- **Una cosa per volta**  
  Ogni schermata chiede una sola decisione importante. Tutto il resto (testi, grafici, pulsanti secondari) serve solo a supportare quella decisione.

- **Orientare sempre l’utente**  
  In qualunque pagina l’utente deve capire in meno di 3 secondi:
  - Dove sono? (titolo + sottotitolo)
  - Cosa devo fare adesso? (CTA primaria)
  - Cosa succede dopo? (microcopy vicino alla CTA)

- **Flussi lunghi sempre guidati**  
  Per percorsi con molti step (es. 72 file audio):
  - mostra sempre “Passo N di M”,
  - aggiungi una progress bar,
  - se esistono macro-sezioni (Timbro, Intervalli, Ritmo, Melodia, Armonia), mostrale.

- **Microcopy che anticipa i dubbi**  
  Testi brevi che rispondono alle domande implicite:
  - “Quanto dura?”
  - “Posso tornare indietro?”
  - “Cosa succede se consegno adesso?”
  - “Posso riascoltare?”

- **Pattern riutilizzabili**  
  Riusa sempre gli stessi componenti visivi:
  - `page`, `page-header`, `page-card`
  - `nav-button primary/secondary/ghost`
  - `answers-grid`, `feedback-field`, `report-section`
  Non creare varianti stilistiche ad hoc per la stessa funzione.

- **Primo uso ≠ uso ripetuto**  
  - Prima volta: onboarding e spiegazioni più ricche.
  - Dalla seconda in poi: versione breve + link “Vedi spiegazione completa”.

- **Accessibilità minima**  
  - Contrasto testo/sfondo sufficiente (WCAG AA).
  - Font-size di base ≥ 16px.
  - Target cliccabili ≥ 40×40 px.
  - Label sempre visibili (mai solo placeholder).

---

## 2. Struttura standard di una pagina

Ogni nuova pagina UI dovrebbe seguire questo schema:

1. **Header pagina**
   - `Titolo`: cosa è questa schermata (es. “Nuovo Test”).
   - `Sottotitolo`: beneficio in 1 frase (es. “72 passi guidati per mappare la tua struttura emotiva.”).

2. **Blocco “Come funziona” (opzionale ma consigliato)**
   - 3 bullet molto brevi che spiegano:
     - Cosa farai.
     - Quanto dura.
     - Cosa ottieni alla fine.

3. **Corpo principale**
   - 1–3 card (`page-card`) massimo.
   - Dentro ogni card:
     - Titolo di sezione.
     - Testo breve.
     - Elemento interattivo (form, player, tab, grafico).
     - CTA primaria chiara.

4. **Footer di flusso**
   - Per flussi lineari:
     - Pulsante “Indietro” (secondary).
     - Indicatore step (“Passo N di M”).
     - Pulsante “Avanti” (primary o secondary).
   - Per schermate finali:
     - CTA primaria verso il “next best action” (es. “Vai al report”).
     - CTA secondaria per tornare indietro (es. “Torna ai risultati”).

---

## 3. Regole specifiche per il Test (`NewTestPage`)

### 3.1 Fasi del flusso

1. **Intro / Onboarding**
   - Testo motivazionale ma sintetico.
   - Versione lunga solo al primo accesso (flag in `localStorage`), poi:
     - 3 bullet: perché il test, cosa farai, cosa ottieni.
   - CTA: “Inizia il tuo ascolto interiore” o “Inizia il test anonimo”.

2. **Profilazione (se non guest)**
   - Due blocchi:
     - “Chi sei” (Nome, Cognome, Data di nascita, Titolo di studio).
     - “Musica e pratica” (Pratica musicale, Strumento).
   - CTA: “Inizia test”.
   - Bottone disabilitato finché i campi obbligatori non sono validi.

3. **Player + Domande (72 step)**
   - Header di step:
     - “Passo N di 72”.
     - “Sezione: Timbro / Intervalli / Ritmo / Melodia / Armonia”.
     - Barra di avanzamento (`N/72`).
   - Card player:
     - Controlli ben distanziati (Play, Pausa, Stop, +/- 5 sec, velocità).
     - Micro-testo sotto:
       > “Puoi riascoltare lo stesso file tutte le volte che vuoi prima di rispondere.”
   - Card domanda:
     - Titolo dinamico da `getQuestionTitleForFile()`.
     - Micro-testo fisso:
       > “Ascolta con calma. Poi scegli la risposta che ti viene per prima. Non esistono risposte giuste o sbagliate.”
     - Griglia risposte:
       - Monocolonna o massimo due colonne su mobile.
       - Stato `selected` molto evidente (bordo + sfondo + icona check).
     - Navigazione:
       - `Indietro` (secondary), disabilitato se `currentFile === 1`.
       - `N/72` centrato.
       - `Avanti` (secondary), abilitato solo se lo step corrente ha una risposta.
       - Pulsante `Consegna e vai al report` come CTA principale in basso (vedi sotto).

4. **Consegna e feedback finale**
   - Bottone principale:
     - Label: “Consegna e vai al report”.
   - Conferma su test incompleto:
     - Testo:
       > “Stai consegnando un test incompleto. Possiamo comunque generare un report parziale, ma alcuni aspetti potrebbero risultare meno accurati. Vuoi proseguire?”
   - Blocco feedback (solo quando `isTestComplete()`):
     - 4 sotto-sezioni con domande finali.
     - Microcopy che spiega perché:
       > “Queste domande aiutano a dare un contesto qualitativo ai risultati sonori.”

---

## 4. Regole specifiche per il Report (`ReportPage`)

### 4.1 Struttura narrativa

1. **Hero – Carta d’identità emotiva**
   - Nome, eventuale età, data del test.
   - Colore dominante (Blu, Rosso, Verde, Giallo, Grigio).
   - Frase di restituzione breve (output di `restituzione`).
   - CTA:
     - “Scarica report” (CSV/PDF).
     - “Torna all’archivio test” o “Torna alla home”.

2. **Come leggere questo report**
   - 3 bullet fissi:
     - “In alto vedi la famiglia emotiva prevalente e il suo significato.”
     - “Più sotto trovi come le diverse famiglie si distribuiscono tra natura, sé, altro e azione.”
     - “Alla fine trovi un lessico di stati d’animo per dare parole precise a come ti senti.”

3. **Profilo emotivo (utente)**
   - Gestito da `EmotionalProfileCards`.
   - Ogni sezione segue la formula testo:
     - Frase 1: descrizione neutra (“Tendi a…”).
     - Frase 2: risorsa (“Questo ti aiuta a…”).
     - Frase 3: attenzione (“Il rischio è…”).
     - Frase 4 (opzionale): consiglio pratico breve (“Ti aiuta fare X quando ti trovi in Y.”).

4. **Approfondimenti per operatori**
   - `OperatorSection` + `RelationalTabs`.
   - Per ogni tab (Natura, Sé, Altro, Agire):
     - 1 definizione semplice (“Qui vediamo come ti sintonizzi sul mondo esterno…”).
     - 1–2 bullet:
       - “Cosa tende a funzionare bene”.
       - “Cosa può creare fatica o blocchi”.

5. **Lessico**
   - `LessicoChips` con famiglie Blu, Rossa, Verde, Gialla, Grigia.
   - Colore dominante evidenziato (dimensione/contorno).
   - Testo introduttivo breve:
     > “Usa queste parole per descrivere come ti senti nelle situazioni quotidiane. Più il termine ti risuona, più è probabile che rientri nel tuo vocabolario emotivo abituale.”

---

## 5. Convenzioni per testi e bottoni

- **Bottoni**
  - Evitare label generiche: “Conferma”, “Invia”, “OK”.
  - Preferire:
    - “Inizia il tuo ascolto interiore”
    - “Inizia test”
    - “Consegna e vai al report”
    - “Torna ai risultati”
    - “Torna alla home”

- **Messaggi di errore / conferma**
  - Sempre in linguaggio umano.
  - Struttura:
    - Cosa è successo.
    - Cosa significa per l’utente.
    - Cosa può fare adesso.

  Esempio:
  > “Non siamo riusciti a salvare il test. I tuoi dati non sono stati persi, ma non possiamo generarne il report ora. Riprova tra qualche minuto o contatta l’operatore.”

---

## 6. Checklist prima di chiudere una PR UI

1. La pagina ha un titolo e un sottotitolo chiari?
2. È evidente qual è l’azione principale (un solo bottone primario)?
3. Nei flussi lunghi: utente vede sempre passo corrente e progress bar?
4. Bottoni e messaggi usano verbi chiari con risultato esplicito?
5. Pattern visuali (`page-card`, `nav-button`, ecc.) sono coerenti con il resto dell’app?
6. La prima volta che arrivo qui ho una spiegazione, le volte successive non vengo rallentato inutilmente?
7. Su mobile tutto rimane leggibile e cliccabile senza zoom?

Se almeno una risposta è “no”, rivedere l’interfaccia prima di chiudere.

