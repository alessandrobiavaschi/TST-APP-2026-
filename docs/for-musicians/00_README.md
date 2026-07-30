# For Musicians - pacchetto editoriale e UX

Questo pacchetto e la fonte di lavoro per riprogettare la vista `For Musicians`.
Il design attuale e gli screenshot sono riferimenti visivi dello stato esistente, non
un'architettura da preservare.

## Obiettivo

Rendere immediatamente distinguibili tre livelli:

1. **Dal test**: dati prodotti dalle risposte della singola somministrazione.
2. **Dal profilo**: descrizioni generali della famiglia emotiva, tratte dal libro.
3. **Lettura integrata**: confronto prudente fra dati individuali e contenuti generali.

La pagina e descrittiva. Non contiene esercizi, prescrizioni, diagnosi, consigli di
repertorio o affermazioni sulle competenze musicali.

## Ordine di lettura

1. [01_UX_CONTENT.md](./01_UX_CONTENT.md) - struttura, testi e comportamento editoriale.
2. [02_RESULT_STATES.md](./02_RESULT_STATES.md) - stati che il design deve supportare.
3. [03_CONTENT_PROVENANCE.md](./03_CONTENT_PROVENANCE.md) - origine e formulazione dei dati.
4. [04_COMBINATIONS.md](./04_COMBINATIONS.md) - combinazioni tra famiglie supportabili.
5. [05_DESIGN_BRIEF.md](./05_DESIGN_BRIEF.md) - consegna operativa per Claude Design.
6. [06_SOURCE_MAP.md](./06_SOURCE_MAP.md) - pagine e limiti della fonte.
7. [fixtures/result-states.json](./fixtures/result-states.json) - dati dimostrativi.
8. [references/README.md](./references/README.md) - screenshot dello stato attuale.

## Fonte teorica unica

- `docs/fonti-scientifiche/Il Pianeta della Musica - FM.pdf`
- estratto ricercabile: `docs/fonti-scientifiche/_estratto/Il_Pianeta_della_Musica_-_FM.txt`

La matrice interna `docs/fonti-scientifiche/_estratto/MATRICE_TRACCIABILITA.md`
serve per orientarsi nella fonte, ma non sostituisce il libro.

## Regola inderogabile

Nessuna descrizione generale della famiglia deve essere presentata come fatto
misurato sul singolo utente. Se il libro non sostiene una relazione o una
caratteristica, l'interfaccia omette quel contenuto invece di completarlo per analogia.

## Ambito del redesign

Il redesign deve supportare:

- desktop e mobile;
- testi brevi e lunghi;
- dominante netta, doppia presenza, profilo plurale e profilo distribuito;
- scarti fra risultato globale e singole aree sonore;
- contenuti mancanti o non sufficientemente documentati;
- utente musicista e non musicista;
- provenienza sempre accessibile.

Non deve assumere che ogni risultato abbia una sola famiglia identitaria.
