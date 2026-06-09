import { GROUP_INTROS } from '../../content/reportRestitution.js'
import { shouldShowEmotionalIntegrations } from './reportFeatureFlags.js'

/** Voci navigazione report (Tracce esclusa: placeholder). */
export const REPORT_SECTIONS = [
  { id: 'report-tst-sintesi', label: 'Il tuo profilo, in sintesi', groupId: 'report-group-identita' },
  { id: 'report-tst-dialogo', label: 'Dialogo delle correnti', groupId: 'report-group-identita' },
  { id: 'report-chapter-natura', label: 'La tua Natura', groupId: 'report-group-profilo' },
  { id: 'report-chapter-racconto', label: 'Il tuo Racconto', groupId: 'report-group-profilo' },
  { id: 'report-chapter-risorse', label: 'Le tue Risorse', groupId: 'report-group-profilo' },
  { id: 'report-chapter-ombre', label: 'Le tue Ombre', groupId: 'report-group-profilo' },
  { id: 'report-tst-rapporti', label: 'I quattro rapporti', groupId: 'report-group-rapporti' },
  { id: 'report-tst-portato', label: 'Portato esperienziale', groupId: 'report-group-rapporti' },
  { id: 'report-tst-mappa', label: 'Dinamiche tra famiglie', groupId: 'report-group-rapporti' },
  { id: 'report-tst-parole', label: 'Stati d\'animo e lessico', groupId: 'report-group-lessico' },
  { id: 'report-tst-approfondimento', label: 'Approfondimento sulle sezioni', groupId: 'report-group-approfondimento' },
  { id: 'report-tst-filtro-musicale', label: 'Filtro musicale', groupId: 'report-group-approfondimento' },
]

/** Sezioni visibili nel menu laterale (filtra mappa se non c'è contenuto sostanziale). */
export function getVisibleReportSections(profilo = {}) {
  return REPORT_SECTIONS.filter(
    (section) =>
      section.id !== 'report-tst-mappa' || shouldShowEmotionalIntegrations(profilo),
  )
}

/** Macro-blocchi accordion del report — ordine allineato al PDF di riferimento. */
export const REPORT_GROUPS = [
  {
    id: 'report-group-identita',
    title: 'Il tuo profilo, in sintesi',
    subtitle: 'Grafici e sintesi descrittiva',
    intro: GROUP_INTROS['report-group-identita'],
    defaultOpen: true,
  },
  {
    id: 'report-group-profilo',
    title: 'Il tuo profilo emotivo',
    subtitle: 'La tua Natura · Il tuo Racconto · Le tue Risorse · Le tue Ombre',
    intro: GROUP_INTROS['report-group-profilo'],
    defaultOpen: false,
  },
  {
    id: 'report-group-rapporti',
    title: 'I quattro rapporti',
    subtitle: 'Natura, sé, altro, agire e portato esperienziale',
    intro: GROUP_INTROS['report-group-rapporti'],
    defaultOpen: false,
  },
  {
    id: 'report-group-lessico',
    title: 'Stati d\'animo e lessico',
    subtitle: 'Aggettivi in elenco e nuvola di parole',
    intro: GROUP_INTROS['report-group-lessico'],
    defaultOpen: false,
  },
  {
    id: 'report-group-approfondimento',
    title: 'Approfondimento sulle singole sezioni',
    subtitle: 'Timbro, Intervalli, Ritmo, Melodia, Armonia · Filtro musicale',
    intro: GROUP_INTROS['report-group-approfondimento'],
    defaultOpen: false,
  },
]

export const SECTION_TO_GROUP = Object.fromEntries(
  REPORT_SECTIONS.map((s) => [s.id, s.groupId]),
)

export function getDefaultGroupOpenState() {
  return Object.fromEntries(REPORT_GROUPS.map((g) => [g.id, g.defaultOpen]))
}

/** @deprecated Usare REPORT_SECTIONS — alias per compatibilità con ReportSectionNav. */
export const REPORT_TST_SECTIONS = REPORT_SECTIONS.map(({ id, label }) => ({ id, label }))
