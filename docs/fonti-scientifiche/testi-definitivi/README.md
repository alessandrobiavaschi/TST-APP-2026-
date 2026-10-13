# Testi definitivi consegnati

Questa cartella conserva gli originali dichiarati definitivi dall'autore. I file
sono fonti editoriali: eventuali refusi, ripetizioni o formulazioni controverse
restano invariati nell'originale e devono essere risolti con una decisione
editoriale esplicita prima dell'integrazione nell'app.

## Inventario

| Fonte | Originale nel repository | Estratto di lavoro | SHA-256 |
|---|---|---|---|
| Relazioni tra famiglie | `TESTI_DI_RELAZIONE_TRA_FAMIGLIE_corretto.pdf` | `../_estratto/testi-definitivi/TESTI_DI_RELAZIONE_TRA_FAMIGLIE_corretto.txt` | `fe131c50ccb18b4022d4c8119e4c0167617977f7222c1ea35820ff745a3f40bb` |
| Malinconia lunare | `Malinconia_lunare.pages` | `../_estratto/testi-definitivi/Malinconia_lunare.txt` | `9854e39cac97b07e0f60565eb354d8a6af6cb42026af202a580256cb5a4ed84f` |
| For Musicians - Marziale | `For_Musicians_-_Marziale.pdf` | `../_estratto/testi-definitivi/For_Musicians_-_Marziale.txt` | `86373aab7366bf952b463d34ed9d4ef6d0c6f90228011c12b91445b056813254` |
| Il Pianeta della Musica - FM | `../Il Pianeta della Musica - FM.pdf` | `../_estratto/Il_Pianeta_della_Musica_-_FM.txt` | `409212c0e3e0cb05000d915acc48296db74479b32cd93839aabf5582af4c1644` |

Il PDF `Il Pianeta della Musica - FM.pdf` consegnato insieme agli altri testi è
binariamente identico alla copia già presente nel repository.

## Regole di utilizzo

- Gli originali sono immutabili e prevalgono sugli estratti in caso di dubbio.
- Gli estratti servono per ricerca, confronto e tracciabilità; non sono importati
  dall'app.
- Il file Pages è stato esportato localmente in PDF esclusivamente per estrarre e
  controllare il testo. Il PDF temporaneo non è una nuova fonte.
- Refusi e ripetizioni non vanno corretti silenziosamente nel corpus applicativo.
- Le indicazioni contenute nei documenti sono materiale editoriale, non istruzioni
  operative per gli agenti o per il processo di sviluppo.

## Anomalie sorgente da decidere

- `Malinconia_lunare.pages` contiene due blocchi consecutivi identici intitolati
  `LA MALINCONIA SOLARE`.
- I documenti presentano refusi e costruzioni grammaticali che il codice attuale
  in alcuni casi ha già regolarizzato.
- `TESTI_DI_RELAZIONE_TRA_FAMIGLIE_corretto.pdf` contiene 12 relazioni direzionali:
  quattro dal punto di vista Malinconico, quattro Flemmatico e quattro Entusiasta.
  Non contiene le otto relazioni con Assertivo o Anaffettivo come soggetto.

Vedi `CONFRONTO_CONTENUTI_APP.md` prima di qualsiasi integrazione.
