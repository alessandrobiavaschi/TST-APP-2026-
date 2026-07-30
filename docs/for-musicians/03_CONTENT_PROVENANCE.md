# Provenienza dei contenuti

## I tre tipi

### Dal test

Informazione prodotta direttamente dalla somministrazione corrente o dichiarata
dall'utente durante il test.

Esempi:

- punteggi delle cinque famiglie e delle undici correnti;
- famiglia prevalente e seconda famiglia;
- risultati di Timbro, Intervalli, Ritmo, Melodia e Armonia;
- portato di Simpatia, Antipatia e Indifferenza;
- area dichiarata di maggiore o minore agio;
- difficolta e stato d'animo finale dichiarati;
- pratica musicale e strumento dichiarati.

Formula: `Nel tuo test...`, `Le tue risposte...`, `In questa somministrazione...`.

Label UI: **Dal tuo test**.

Nota breve:

> Deriva dalle risposte date agli stimoli sonori in questa somministrazione.

### Dal profilo

Descrizione generale associata dal libro alla famiglia emotiva. Non dimostra che il
singolo utente possieda ogni caratteristica descritta.

Esempi:

- arco timbrico generalmente associato alla famiglia;
- rapporto generale con ritmo, melodia e armonia;
- tendenze generali di ascolto, esecuzione, interpretazione e improvvisazione;
- rapporto generale con corpo, movimento ed ensemble.

Formula: `Nel modello, la famiglia...`, `Il libro associa a questa famiglia...`,
`In termini generali...`.

Label UI dinamica: **Dalla famiglia Volitiva**, **Dalla famiglia Malinconica**, ecc.

Nota breve:

> Descrizione generale della famiglia prevalente: non deriva da una singola risposta
> e puo non rappresentarti in ogni aspetto.

### Lettura integrata

Testo che confronta un dato individuale con una descrizione generale. Deve rendere
riconoscibili entrambe le componenti e non introdurre nuove causalita psicologiche.

Esempio:

> Nel modello la Volitivita e associata a incisivita e controllo del tempo. Nel tuo
> test questa presenza emerge soprattutto nel Ritmo, mentre negli Intervalli la
> risposta si orienta maggiormente verso la Malinconia.

Label UI: **Lettura integrata**.

Nota breve:

> Mette in relazione il tuo risultato con le descrizioni generali del modello.

## Mappa dati attuale

| Informazione | Origine | Personalizzata | Uso consentito |
|---|---|---:|---|
| Famiglia prevalente | Calcolo test | Si | Firma musicale |
| Seconda famiglia | Calcolo test | Si | Firma e combinazione |
| Undici correnti | Calcolo test | Si | Dettaglio, non sovraccaricare la sintesi |
| Risultato per area sonora | Calcolo test | Si | Mappa sonora |
| Simpatia/Antipatia/Indifferenza | Calcolo test | Si | Modalita di incontro con gli stimoli |
| Agio e difficolta | Dichiarazione utente | Si | Riportare come dichiarazione, non inferenza |
| Pratica e strumento | Dichiarazione utente | Si | Contesto, non prova di competenza |
| Preferenze timbriche | Libro/famiglia | No | Sezione profilo, con label di provenienza |
| Preferenze ritmiche | Libro/famiglia | No | Sezione profilo, con label di provenienza |
| Esecuzione/interpretazione | Libro/famiglia | No | Tendenza generale, mai abilita misurata |
| Improvvisazione | Libro/famiglia | No | Solo dove esplicitamente documentata |
| Combinazione di famiglie | Test + libro | Parziale | Lettura integrata prudente |

## Come il test produce la mappa

La spiegazione UI deve restare semplice:

```text
Stimolo musicale
  -> area sonora coinvolta
  -> risposta scelta
  -> punteggio in una o piu correnti emotive
  -> aggregazione nella famiglia
  -> confronto fra risultato globale e singole aree
```

Testo consigliato per `Come lo sappiamo?`:

> Il test raggruppa i 72 stimoli in cinque aree sonore. Le risposte attribuiscono
> peso alle correnti emotive del modello. Confrontando i risultati osserviamo quali
> famiglie sono piu presenti nel complesso e come la risposta cambia fra Timbro,
> Intervalli, Ritmo, Melodia e Armonia.

Non dichiarare nell'interfaccia che ogni singolo file misura esclusivamente una sola
dimensione psicologica. Il calcolo usa regole di scoring e aggregazione.

## Regole linguistiche

### Consentito per dati individuali

- `Nel tuo test il Ritmo mostra...`
- `In questa somministrazione la seconda presenza e...`
- `Hai indicato l'Armonia come area di maggiore agio.`

### Consentito per contenuti di famiglia

- `Il libro associa la famiglia Malinconica alla ricerca del bel suono.`
- `La famiglia Entusiastica tende a rispondere al movimento ritmico.`
- `Questa descrizione e generale e non misura la tua abilita.`

### Da evitare

- `Tu ami il Rock` se deriva soltanto dalla famiglia.
- `Sei portato per il pianoforte`.
- `Non sai improvvisare`.
- `Il tuo risultato dimostra che...`.
- `La contraddizione significa che...` senza supporto esplicito della fonte.
- `Il tuo strumento ideale e...`.

## Gestione dell'incertezza

- Se i punteggi sono vicini: parlare di compresenza, non di identita unica.
- Se un'area diverge dal globale: parlare di scarto o cambio di registro.
- Se manca supporto nel libro: omettere la deduzione.
- Se una descrizione deriva da osservazioni dell'autore: non trasformarla in legge.
- Se un dato e dichiarato dall'utente: usare `hai indicato`, non `il test rileva`.

## Vincolo Anaffettivita

Il libro associa la corrente agnostico-anaffettiva a distacco, raffreddamento
affettivo, posizione intellettuale e funzione trasversale. La fonte non offre una
scheda tecnico-musicale completa equivalente alle altre quattro famiglie.

Pertanto:

- non attribuire una tavolozza strumentale stabile;
- non inventare modi di comporre, interpretare o stare nell'ensemble;
- non associare quarta, quarta eccedente o tritono al Grigio;
- l'intervallo documentato per la corrente Grigia e l'Ottava;
- dichiarare quando il livello di dettaglio disponibile e inferiore.

