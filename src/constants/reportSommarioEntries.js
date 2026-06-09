import { SHOW_TRACCE_SECTION } from '../components/report/reportFeatureFlags.js'

/** Anchor ids must match elements on `ReportPage` / report components. */
const REPORT_SOMMARIO_ENTRIES_ALL = [
  {
    id: 'report-sintesi',
    label: 'Il tuo profilo, in sintesi',
    navLabel: 'Sintesi',
  },
  {
    id: 'report-tst-profilo',
    label: 'Il tuo profilo emotivo',
    navLabel: 'Profilo emotivo',
  },
  {
    id: 'report-chapter-natura',
    label: 'La tua Natura',
    navLabel: 'Natura',
    sub: true,
  },
  {
    id: 'report-chapter-racconto',
    label: 'Il tuo Racconto',
    navLabel: 'Racconto',
    sub: true,
  },
  {
    id: 'report-chapter-risorse',
    label: 'Le tue Risorse',
    navLabel: 'Risorse',
    sub: true,
  },
  {
    id: 'report-chapter-ombre',
    label: 'Le tue Ombre',
    navLabel: 'Ombre',
    sub: true,
  },
  {
    id: 'report-rapporti',
    label: 'I quattro rapporti',
    navLabel: 'I quattro rapporti',
  },
  { id: 'report-tracce', label: 'Tracce semantiche', navLabel: 'Tracce' },
  { id: 'report-galassia', label: 'Galassia degli affetti', navLabel: 'Galassia' },
  { id: 'report-lessico', label: "Stati d'animo e lessico", navLabel: 'Lessico' },
  { id: 'report-operatori', label: 'Approfondimento sulle singole sezioni', navLabel: 'Sezioni del test' },
  { id: 'report-dati', label: 'Dati avanzati', navLabel: 'Dati avanzati' },
  { id: 'report-closing-epilogue', label: 'Prima di chiudere', navLabel: 'Prima di chiudere' },
]

export const REPORT_SOMMARIO_ENTRIES = SHOW_TRACCE_SECTION
  ? REPORT_SOMMARIO_ENTRIES_ALL
  : REPORT_SOMMARIO_ENTRIES_ALL.filter((entry) => entry.id !== 'report-tracce')

/** Sub-sections spy targets that map to the same sommario entry as `report-profilo`. */
export const REPORT_SOMMARIO_CHAPTER_IDS = new Set([
  'report-chapter-natura',
  'report-chapter-racconto',
  'report-chapter-risorse',
  'report-chapter-ombre',
])

export function activeSommarioIdFromSpyId(spyId) {
  return spyId
}
