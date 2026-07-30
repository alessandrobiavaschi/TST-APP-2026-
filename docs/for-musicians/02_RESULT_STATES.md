# Stati di risultato da supportare

Questo documento descrive gli stati editoriali, non fissa ancora soglie numeriche.
Le soglie definitive devono essere ricavate dai massimi teorici e dalla distribuzione
reale dello scoring. Il design non deve incorporare numeri arbitrari.

## Assi indipendenti

Ogni risultato nasce dalla combinazione di quattro assi:

1. **Forma globale**: quanto e riconoscibile una dominante.
2. **Composizione**: quante famiglie sono significativamente presenti.
3. **Coerenza per area**: quanto le cinque aree confermano o modulano il globale.
4. **Portato**: attrazione, rifiuto e distacco emersi nella somministrazione.

## Stati globali

### S1 - Dominante netta

Una famiglia e chiaramente sopra le altre e viene confermata dalla maggioranza delle
aree sonore.

Copy:

> Nel tuo test emerge una firma prevalentemente {famiglia}, riconoscibile soprattutto
> in {aree}.

UI: una famiglia in evidenza; seconda presenza come dettaglio.

### S2 - Dominante con seconda presenza

La prima famiglia resta riconoscibile, ma la seconda ha peso sufficiente per
modificare la lettura.

Copy:

> La famiglia {dominante} costituisce il terreno principale. La presenza
> {secondaria} introduce un diverso registro, soprattutto in {aree}.

UI: gerarchia 70/30 circa a livello visivo, senza suggerire percentuali se non sono
mostrate davvero.

### S3 - Quasi parita fra due famiglie

La differenza non consente una narrazione identitaria univoca.

Copy:

> {famiglia_a} e {famiglia_b} hanno un peso vicino. La tua risposta si organizza
> attraverso entrambe, con accenti diversi nelle cinque aree.

UI: due famiglie allo stesso livello; evitare la parola `dominante`.

### S4 - Tre presenze importanti

Due famiglie formano il nucleo e una terza compare in modo significativo o
localizzato.

Copy:

> Il nucleo della risposta e formato da {famiglia_a} e {famiglia_b}. {famiglia_c}
> compare soprattutto in {area}, dove modifica il registro complessivo.

UI: due elementi principali e una modulazione. Non mostrare tre schede complete.

### S5 - Profilo distribuito

Le famiglie hanno pesi relativamente vicini e nessuna organizza da sola il risultato.

Copy:

> In questa somministrazione nessuna famiglia concentra da sola la risposta. La mappa
> cambia sensibilmente in relazione alla qualita sonora ascoltata.

UI: iniziare dalle aree, non da una grande identita di famiglia.

### S6 - Dominante numerica ma debole

Esiste una prima classificata, ma la sua presenza assoluta non giustifica una
descrizione forte.

Copy:

> {famiglia} e la presenza piu alta nel confronto, ma il risultato non mostra una
> concentrazione sufficiente per descrivere una firma nettamente dominante.

UI: evitare hero monocromatico e formule identitarie.

## Stati di relazione fra globale e aree

### A1 - Conferma diffusa

La famiglia globale prevale in almeno la maggioranza delle aree e non ci sono scarti
forti.

Label: `Conferma il profilo complessivo`.

### A2 - Conferma selettiva

La famiglia globale e molto forte solo in alcune aree.

Label: `Presenza concentrata`.

Copy:

> La presenza {famiglia} non e uniforme: emerge soprattutto in {aree}.

### A3 - Cambio di registro in una singola area

Una famiglia secondaria supera la globale in una sola area.

Label: `Cambia registro`.

Copy:

> Nel complesso prevale {globale}; in {area}, invece, la risposta si orienta verso
> {locale}.

### A4 - Aree divise fra due famiglie

Due famiglie si alternano sistematicamente.

Label: `Doppio registro`.

### A5 - Ogni area racconta una composizione diversa

Non esiste continuita sufficiente per una sola narrazione.

Label: `Risposta variabile per area`.

### A6 - Area distribuita

In una singola area i pesi sono vicini.

Label: `Risposta distribuita`.

### A7 - Area senza dati interpretabili

Valori mancanti, nulli o insufficienti.

Label: `Dati non sufficienti`.

Non utilizzare fallback narrativi basati sulla famiglia globale.

## Contrasti supportabili dal modello

Un contrasto non e un errore e non implica conflitto personale. Puo essere nominato
solo attraverso polarita esplicitamente presenti nel libro:

| Polarita | Famiglie coinvolte | Formula consentita |
|---|---|---|
| Interiorita / esteriorita | Malinconia / Entusiasmo | moto centripeto e moto centrifugo |
| Sosta / azione | Calma / Volitivita | contemplazione e realizzazione |
| Riflessione / governo | Malinconia / Volitivita | elaborazione interiore e direzione |
| Calore / distacco | Entusiasmo o Volitivita / Anaffettivita | partecipazione e raffreddamento affettivo |
| Movimento / quiete | Entusiasmo / Calma | attivazione corporea e riposo |

Non definire automaticamente opposte tutte le altre coppie.

## Stati del portato

### P1 - Simpatia prevalente

Descrive apertura e attrazione verso gli stimoli della somministrazione. Non significa
che l'utente ami ogni musica associata alla famiglia.

### P2 - Antipatia prevalente

Descrive frequenza di risposte di rifiuto o fastidio. Deve restare separata dalla
famiglia emotiva prevalente.

### P3 - Indifferenza prevalente

Descrive distacco o bassa attivazione in questa somministrazione. Non equivale
automaticamente a famiglia Anaffettiva.

### P4 - Portato misto

Due o tre dimensioni sono vicine. La sintesi deve riportare compresenza.

### P5 - Portato non disponibile

Non mostrare una conclusione sostitutiva.

## Stati dichiarativi

- Musicista con strumento dichiarato.
- Musicista senza strumento dichiarato.
- Nessuna pratica musicale dichiarata.
- Aree di agio dichiarate.
- Aree di difficolta dichiarate.
- Nessuna dichiarazione finale disponibile.

Questi stati usano sempre `hai indicato` o `non hai indicato`.

## Regole per il design

- Ogni combinazione di S, A e P deve poter vivere senza cambiare layout di base.
- La firma si accorcia quando il risultato e complesso; il dettaglio va nella mappa.
- Non usare colore pieno dominante nei profili distribuiti.
- Non mostrare `contrasto` come allarme.
- Non sostituire dati mancanti con contenuto di famiglia.
- Il layout deve reggere l'assenza completa della sezione `Come fai musica` per una
  famiglia non documentata a sufficienza.

