# Brief per Claude Design

## Mandato

Progettare una nuova esperienza `For Musicians` per il report TST. Non ridisegnare
semplicemente la pagina esistente: la struttura editoriale da seguire e descritta in
`01_UX_CONTENT.md`.

Il prodotto deve permettere all'utente di capire immediatamente:

1. cosa e emerso dalle sue risposte;
2. cosa e una descrizione generale della famiglia;
3. cosa e una lettura che integra i due livelli;
4. come Timbro, Intervalli, Ritmo, Melodia e Armonia contribuiscono al risultato.

## Materiale obbligatorio

Leggere prima di disegnare:

- `00_README.md`;
- `01_UX_CONTENT.md`;
- `02_RESULT_STATES.md`;
- `03_CONTENT_PROVENANCE.md`;
- `04_COMBINATIONS.md`;
- `06_SOURCE_MAP.md`;
- `fixtures/result-states.json`.

Gli screenshot elencati in `references/README.md` mostrano solo lo stato attuale.

## Architettura da rappresentare

1. Hero compatto.
2. La tua firma musicale.
3. Come ascolti.
4. Come fai musica.
5. La tua mappa sonora.
6. La tua combinazione musicale, quando applicabile.
7. Sintesi finale.
8. Approfondimenti chiusi.

## Sistema di provenienza

Definire tre indicatori coerenti, leggibili anche senza colore:

- `Dal tuo test`;
- `Dalla famiglia {nome}`;
- `Lettura integrata`.

Devono apparire a livello di blocco, non come badge ripetuto su ogni frase. Prevedere
una legenda iniziale e tooltip/disclosure accessibili.

## Schermate obbligatorie

Produrre desktop e mobile per almeno:

1. `dominant_clear`;
2. `dominant_secondary`;
3. `near_tie`;
4. `three_relevant`;
5. `distributed`;
6. `single_area_contradiction`;
7. `anaffective_dominant`;
8. `missing_area_data`.

Usare i contenuti delle fixture, non lorem ipsum.

## Componenti da esplorare

### Firma musicale

- frase principale;
- 2-3 evidenze;
- provenienza;
- disclosure `Come lo sappiamo?`.

### Mappa sonora

Progettare prima una lettura sintetica per area, poi il grafico completo. Ogni area
deve mostrare:

- famiglia locale;
- seconda presenza, se significativa;
- relazione con il profilo globale;
- accesso ai valori.

Evitare di affidare il significato soltanto a cinque gruppi di barre.

### Combinazione

Deve funzionare con:

- dominante e secondaria;
- quasi parita;
- terza presenza localizzata;
- assenza della sezione nei profili distribuiti.

### Approfondimenti

Accordion o drawer per:

- metodo;
- valori completi;
- teoria;
- fonte;
- undici correnti.

## Vincoli visuali e UX

- Una sola CTA primaria nella pagina.
- Non usare il colore come unico veicolo semantico.
- Mantenere leggibilita con testi italiani lunghi.
- Niente grandi spazi vuoti fra contenuti logicamente consecutivi.
- Niente sequenze infinite di card equivalenti su mobile.
- Supportare `prefers-reduced-motion`.
- Grafici accessibili con equivalente testuale.
- Stati mancanti espliciti, mai sostituiti con contenuto generico.
- La famiglia Grigia deve poter avere meno moduli descrittivi senza rompere il layout.

## Tono

- autorevole ma non diagnostico;
- musicale ma comprensibile;
- personale quando parla il test;
- prudente quando parla la famiglia;
- nessuna prescrizione o esercizio.

## Cose da non fare

- Non conservare automaticamente la struttura lunga degli screenshot.
- Non trattare `For Musicians` come articolo editoriale lineare.
- Non mostrare la famiglia dominante come identita assoluta.
- Non nascondere la provenienza in una nota legale finale.
- Non inventare contenuti mancanti per riempire card simmetriche.
- Non proporre playlist, generi, strumenti ideali o consigli di studio.

## Output richiesto

Consegnare:

- mappa dei componenti;
- desktop e mobile per gli otto stati obbligatori;
- specifica di espansioni, tooltip e transizioni;
- token di spaziatura, tipografia, colore e stato;
- comportamento responsive;
- componenti vuoti, mancanti e loading;
- annotazione della fixture usata in ogni frame;
- handoff pronto per implementazione React.

## Criteri di approvazione

Il design e approvabile solo se un osservatore puo rispondere senza spiegazioni
esterne a queste domande:

1. Quale parte viene dal mio test?
2. Quale parte e generale per la famiglia?
3. Dove la mia risposta cambia fra le cinque aree?
4. Perche il testo parla di due famiglie?
5. Cosa accade quando non esiste una dominante netta?
