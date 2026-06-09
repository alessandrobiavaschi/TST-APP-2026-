# Matrice tracciabilità — report TST 2026

Riferimento interno per la riscrittura testi. Ogni famiglia mappa alle fonti in `docs/fonti-scientifiche/`.

| Famiglia | Periodo evolutivo | Vento / Rosa | Colore / sfumature | Orientamento (restituzione visiva) | Sotto-correnti | Intervalli (fonte) |
|---|---|---|---|---|---|---|
| Blu | Adolescenza (seconda nascita affettiva ~9-10 anni) | Ovest–Est, Luna | Blu notte/scuro, Blu medio, Blu reale, Celeste | passato | Depressiva, Lunare, Nostalgia, Solare | 2ª min/mag, 3ª min, 7ª min/mag, 3ª mag |
| Rosso | Età adulta (~20 anni, Io governatore) | Est–Ovest, Sole | Rosso, Amaranto | presente | Assertività volitiva, Dubbio e Collera | 4ª, 4ª eccedente |
| Verde | Neonatale | Centro rosa dei venti (occhio del ciclone) | Verde | oblio sospeso | Calma flemmatica | 5ª, 5ª eccedente |
| Giallo | Pre-infanzia (dopo neonatale) | Sud–Nord, venti caldi | Giallo solare | futuro | Gioia/Entusiasmo, Volitivo passionale | Prima |
| Grigio | Sedimentazione dagli anni Settanta; trasversale | Nord–Sud, venti gelidi | Grigio scuro | trasversale (linea del presente) | Anaffettiva, Agnostico intellettuale evolutivo | Ottava |

## Fonti scientifiche (autoritative)

Il Pianeta della Musica - FM.pdf · STATI D'ANIMO IN 4 FAMIGLIE (Salvataggio automatico) · STATI_D_ANIMO_IN_4_FAMIGLIE_salvataggio_automatico (duplicato binario) · parole - STATI D'ANIMO · TEST DI RILEVAZIONE · RESTITUZIONE VISIVA RISULTATI DEL TEST.pptx.pdf

**Non fonte:** `lala.pdf` — vecchio report web usato solo come riferimento di stile/struttura (sintesi a 2 blocchi, capitoli trimmati, ordine sezioni). I fatti scientifici e il lessico canonico provengono esclusivamente da `docs/fonti-scientifiche/`.

## Decisioni conflitti sorgente (2026-06-09)

| # | Tema | Decisione | Implementazione |
|---|---|---|---|
| 1 | lala.pdf | Solo guideline UX/struttura, non fonte fatti | Architettura report invariata; matrice e lessico tracciati ai PDF scientifici |
| 2 | Rosso «Inquieto» | Sì, in lessico Rosso (sotto-corrente Amaranto / Dubbio-Collera) | `content_report.json`, `reportProfiloPdf.js`; già in `galaxyTheoryContent` (STATI D'ANIMO IN 4 FAMIGLIE) |
| 3 | Vocabolario canonico | Entrambe le fonti lessicali | **Forme** ← «parole - STATI D'ANIMO»; **Aggettivi** ← «STATI D'ANIMO IN 4 FAMIGLIE» (per sotto-corrente) |
| 4 | Verde etichetta natura | RESTITUZIONE_VISIVA forma singola | `restituzione_natura`: **NATURA FLEMMATICA** · `restituzione_caratteri`: **CONTEMPLATIVA** |
| 5 | Blu etichetta natura | Campi separati (slide forma singola) | `restituzione_natura`: **NATURA LUNARE** · `restituzione_caratteri`: **MALINCONICO NOSTALGICA** (non stringa combinata) |

## Etichette restituzione visiva (forma singola)

| Famiglia | `restituzione_natura` | `restituzione_caratteri` |
|---|---|---|
| Blu | NATURA LUNARE | MALINCONICO NOSTALGICA |
| Rosso | NATURA MARZIALE | VOLITIVO COLLERICA |
| Verde | NATURA FLEMMATICA | CONTEMPLATIVA |
| Giallo | NATURA SOLARE | SANGUINICO ENTUSIASTA |
| Grigio | NATURA ANAFFETTIVA | AGNOSTICO ANAFFETTIVA |

Fonte slide: RESTITUZIONE VISIVA RISULTATI DEL TEST (pagine forma singola). Le slide «comune struttura emotiva» usano etichette fuse (es. NATURA CALMA FLEMMATICA, NATURA LUNARE MALINCONICO NOSTALGICA) — non adottate in UI report.

## Lessico / stati d'animo nel report (2026-06)

| Componente | Contenuto integrato |
|---|---|
| `src/content/statiAnimoLessico.js` | `vocabolarioForme` (parole - STATI D'ANIMO via `reportProfiloPdf`); `vocabolarioAggettivi` + `sottoCorrenti` (STATI D'ANIMO IN 4 FAMIGLIE via `galaxyTheoryContent`) |
| `src/utils/buildReportData.js` | `extractParoleDalTest` (DIZIONARIO_2, file 29–42); `paroleEmerse` in nuvola; profilo con `natura` e `disposizione` separati |
| `ParoleStatiAnimo.jsx` | Nuvola = parole emerse dal test; expand = sezioni **Forme** + **Aggettivi** (sotto-correnti) |
| `reportProfiloPdf.js` / `content_report.json` | Capitoli profilo estesi ma trimmati (4§ natura/racconto, 2§+5 bullet risorse/ombre); elenchi nominali in lessico |

## Profilo emotivo — capitoli trimmati (2026-06-09)

| Capitolo | Limite | Fonte estratto |
|---|---|---|
| Natura | 4 paragrafi | `STATI D'ANIMO IN 4 FAMIGLIE` — venti, continente, rapporto con sé |
| Racconto | 4 paragrafi | stessa fonte — periodo evolutivo, sotto-correnti, preferenze d'ascolto |
| Risorse / Ombre | 2 paragrafi + max 5 bullet | stessa fonte — polo positivo / irrigidimento |
| Connettori | `PANEL_READING` in `reportRestitution.js` | testo ponte tra capitoli (non corpo) |

Implementazione: `trimProfiloChapterText` in `profiloDisplayCopy.js`; testi sorgente in `reportProfiloPdf.js`.
