# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # dev server (Vite, localhost:5173)
npm run build        # production build → dist/
npm run preview      # preview dist/ locally
npm run lint         # ESLint (flat config, eslint.config.js)
```

No test suite is configured. There are no unit tests in this repo.

## Environment

Copy `.env.example` to `.env` and fill in Firebase credentials:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=   # must be <project>.firebaseapp.com (not a custom domain)
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_AUDIO_BASE_URL=          # optional — base URL for audio files; empty = /audio/N.mp3
```

`vite.config.js` also accepts `FIREBASE_*` and `NEXT_PUBLIC_FIREBASE_*` prefixes (for Netlify/CI) and bakes them into `__TST_FIREBASE_BUILD__` at build time.

## Architecture

### Provider tree (`main.jsx`)
```
BrowserRouter
  SkyThemeProvider      ← sky background state (weather, time-of-day)
    UiSoundProvider     ← UI sound effects toggle
      App               ← header, mobile nav, routes, GDPR banner, ErrorBoundary
```

### Routing
| Route | Page |
|---|---|
| `/` | LandingPage — marketing, video background, auth entry point |
| `/home` | HomePage — personal area after login |
| `/nuovo-test` | NewTestPage — 72-step audio test |
| `/tutorial` | TutorialPage — listening tutorial slides |
| `/risultati` | ResultsPage — test archive |
| `/risultati/report` | ReportPage — single test report |
| `/tst` | TstPage — test description |
| `/profilo` | ProfilePage |
| `/info` | InfoPage (contacts / privacy) |

`/dashboard-operatore` redirects to `/home` — the operator role is now unified under the same account.

### Test scoring engine (`src/testLogic.js`)

The 72 audio files are grouped into question types, resolved by `getLogicTypeForFile(n)`:

| File range | Type | Options |
|---|---|---|
| 1–4 | `AFFINITA_BASE` | 5 preset options |
| 5–28, 43–45, 47–57, 59–72 | `DIZIONARIO_1` | 15 sensations |
| 29–42 | `DIZIONARIO_2` | 14 complex adjectives |
| 46 | `AFFINITA_ECCEZIONE` | 5 options, weight ×2 |
| 51, 58 | `AFFINITA_STANDARD` | 5 options, weight ×1 |

Files 42–46 carry weight +2; all others +1. The key function is:

```js
computeScoreDeltaForAnswer({ fileNumber, answerLabel, affinitaOptionId, isConfirmation })
// → { [correnteKey]: number, [portatoKey]: number }
```

Each answer scores into one of 11 **correnti emotive** (e.g. `GIALLO_1_Gioia_Entusiasmo`) and one of 3 **portato esperienziale** keys (`PE_Simpatia`, `PE_Antipatia`, `PE_Indifferenza`). The 11 correnti aggregate into 5 colour families that produce `Disposizione_Prevalente`:

- **BLU** (BLU_1–4) → Malinconia
- **ROSSO** (ROSSO_1–2) → Volitività
- **VERDE** (VERDE_1) → Calma
- **GIALLO** (GIALLO_1–2) → Entusiasmo
- **GRIGIO** (GRIGIO_1–2) → Anaffettività

### Firestore schema (`src/dbSchema.js`, `src/firestorePaths.js`)

Collection `test_results`. Each document has ~103 fields:
- **Blocco A**: profiling (Nome, Cognome, Data_Nascita, Titolo_Studio, Pratica_Musicale, Strumento_Suonato)
- **Blocco B**: raw answers `File_01`…`File_72` (string — the label chosen)
- **Blocco C**: PE_Simpatia, PE_Antipatia, PE_Indifferenza (number)
- **Blocco D**: 11 correnti emotive (number)
- **Blocco E**: final feedback fields + `Disposizione_Prevalente`, `Sottodisposizione_Prevalente`, `Portato_Esperienziale_Prevalente`
- `userId`: Firebase Auth UID (set by `saveTestResultForUser()` in `src/firestore/testResults.js`)

Firestore rules: each document is owned by the `userId` field; users can only read/write their own records. Collection `aree` is owned by `operatoreUid`.

### Sky background system (`src/SkyThemeContext.jsx`)

Animated video background across all pages except `/`. State: `timeOfDay` (morning/afternoon/sunset/twilight/night) × `weather` (sereno/nuvoloso/caldissimo/neve). `skyVideosConfig.js` maps each combination to a video file in `/public/Video Background/` and a visual profile `{ tone, warmth, intensity }` used for armocromia theming.

- Weather changes automatically every 15 min (simulated clock, not wall clock).
- `forceRandomWeatherChange()` cycles through `PRIORITY_SKY_SEQUENCE` before going random.
- Config persisted in `localStorage` key `tst_sky_config_v1`.
- Toggle static mode (no video, CSS fallback) via header button.

### Report components (`src/components/report/`)

Active flow: `ReportPage` → `ReportShell` (see `reportSectionsConfig.js`):

1. `HeroScreen` — opening hero (Natura / Disposizione legend, no duplicate activation circles)
2. `SintesiCorrenti` — key facts + presence charts
3. `ProfiloEmotivo` — chapters Natura, Racconto, Risorse, Ombre (+ `EmotionalIntegrations` after Ombre when enabled)
4. `QuattroRapporti`, `SezionePortatoEsperienziale`, `DialogoCorrenti`
5. `ParoleStatiAnimo`, `ApprofondimentoSezioni` (+ `OperatorSection`)
6. `GalassiaView` — alternate view via navbar toggle

User-facing score copy: **Prevalenza** (sum of points) vs **Presenza** (% resonance in profile) — see `reportUiCopy.js` `REPORT_CRITERION`.

Narrative texts live in `src/content_report.json` and `src/content/reportRestitution.js`. Score utilities in `src/utils/reportRecordUtils.js` and `src/utils/buildReportData.js`.

Landing/home/report video: `public/Video Background/SFONDO LANDING.mp4` via `VideoBackground0311.jsx`. Audio files: optional `VITE_AUDIO_BASE_URL` (no MP3 in repo by default).

### UI conventions (see `GUIDA_UI_UX.md` for full detail)

Reuse these CSS classes — do not create ad-hoc variants:
- `page`, `page-header`, `page-card`
- `nav-button primary` / `nav-button secondary` / `nav-button ghost`
- `answers-grid`, `feedback-field`, `report-section`

Every page needs a single primary CTA. Long flows (like the 72-step test) must always show "Passo N di 72" + progress bar + current section name.

## Syntax Guardrails

### Quotes formatting
Always use standard straight quotes (`'` or `"`) in JavaScript/TypeScript source code and configurations. Do not use smart/curly quotes (`‘`, `’`, `“`, `”`) even within string declarations, as they cause Rollup parser failures during `npm run build`.

### Known caveats

- No test runner is configured.
- `src/plugins/BANANA/` is an experimental plugin (animated flowers) — not part of the main flow.

