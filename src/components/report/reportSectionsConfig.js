import { GROUP_INTROS } from '../../content/reportRestitution.js'
import { shouldShowEmotionalIntegrations } from './reportFeatureFlags.js'

/**
 * Voci del menu laterale — ogni `id` deve corrispondere a un anchor nel DOM.
 * `isSub`: voce indentata sotto la macro-sezione del gruppo.
 */
export const REPORT_SECTIONS = [
  { id: 'report-tst-sintesi', label: 'Sintesi del profilo', groupId: 'report-group-identita' },
  { id: 'report-tst-profilo', label: 'Il tuo profilo emotivo', groupId: 'report-group-profilo' },
  { id: 'report-chapter-natura', label: 'La tua Natura', groupId: 'report-group-profilo', isSub: true },
  { id: 'report-chapter-racconto', label: 'Il tuo Racconto', groupId: 'report-group-profilo', isSub: true },
  { id: 'report-chapter-risorse', label: 'Le tue Risorse', groupId: 'report-group-profilo', isSub: true },
  { id: 'report-chapter-ombre', label: 'Le tue Ombre', groupId: 'report-group-profilo', isSub: true },
  { id: 'report-tst-rapporti', label: 'I quattro rapporti', groupId: 'report-group-rapporti' },
  { id: 'report-tst-portato', label: 'Portato esperienziale', groupId: 'report-group-rapporti' },
  { id: 'report-tst-dialogo', label: 'Schema interno delle correnti', groupId: 'report-group-rapporti' },
  { id: 'report-tst-mappa', label: 'Mappa e relazioni', groupId: 'report-group-rapporti' },
  { id: 'report-tst-parole', label: "Stati d'animo e lessico", groupId: 'report-group-lessico' },
  { id: 'report-tst-approfondimento', label: 'Approfondimento sulle sezioni', groupId: 'report-group-approfondimento' },
  { id: 'report-tst-filtro-musicale', label: 'Filtro musicale', groupId: 'report-group-approfondimento', isSub: true },
]

/** Sezioni visibili nel menu (condizionali per contenuto). */
export function getVisibleReportSections(profilo = {}, options = {}) {
  const { filtroMusicaleHasData = false } = options
  return REPORT_SECTIONS.filter((section) => {
    if (section.id === 'report-tst-mappa') {
      return shouldShowEmotionalIntegrations(profilo)
    }
    if (section.id === 'report-tst-filtro-musicale') {
      return Boolean(filtroMusicaleHasData)
    }
    return true
  })
}

/** Macro-blocchi accordion del report — ordine = percorso di lettura. */
export const REPORT_GROUPS = [
  {
    id: 'report-group-identita',
    title: 'Che profilo emerge?',
    subtitle: 'Sintesi del profilo',
    intro: GROUP_INTROS['report-group-identita'],
    stepLabel: '1',
    readingFocus: 'Famiglia prevalente, sfumatura e distribuzione.',
    defaultOpen: true,
  },
  {
    id: 'report-group-profilo',
    title: 'Cosa significa?',
    subtitle: 'Natura, racconto, risorse e ombre',
    intro: GROUP_INTROS['report-group-profilo'],
    stepLabel: '2',
    readingFocus: 'Il punteggio diventa testo narrativo.',
    defaultOpen: false,
  },
  {
    id: 'report-group-rapporti',
    title: 'Dove cambia?',
    subtitle: 'Rapporti, portato, schema interno e relazioni',
    intro: GROUP_INTROS['report-group-rapporti'],
    stepLabel: '3',
    readingFocus: 'Natura, sé, altro, agire e come hai vissuto gli stimoli.',
    defaultOpen: false,
  },
  {
    id: 'report-group-lessico',
    title: 'Quali parole restano?',
    subtitle: 'Lessico emerso dal test',
    intro: GROUP_INTROS['report-group-lessico'],
    stepLabel: '4',
    readingFocus: 'Parole scelte e vocabolario per famiglia.',
    defaultOpen: false,
  },
  {
    id: 'report-group-approfondimento',
    title: 'In quali stimoli si accende?',
    subtitle: 'Dettaglio per area sonora',
    intro: GROUP_INTROS['report-group-approfondimento'],
    stepLabel: '5',
    readingFocus: 'Timbro, intervalli, ritmo, melodia, armonia.',
    defaultOpen: false,
  },
]

export const SECTION_TO_GROUP = Object.fromEntries(
  REPORT_SECTIONS.map((s) => [s.id, s.groupId]),
)

/** Id capitoli profilo — usati da scroll-spy e navigazione. */
export const PROFILO_CHAPTER_SECTION_IDS = REPORT_SECTIONS.filter(
  (s) => s.groupId === 'report-group-profilo' && s.isSub,
).map((s) => s.id)

export function getDefaultGroupOpenState() {
  return Object.fromEntries(REPORT_GROUPS.map((g) => [g.id, g.defaultOpen]))
}

/** @deprecated Usare REPORT_SECTIONS — alias per compatibilità con ReportSectionNav. */
export const REPORT_TST_SECTIONS = REPORT_SECTIONS.map(({ id, label }) => ({ id, label }))
