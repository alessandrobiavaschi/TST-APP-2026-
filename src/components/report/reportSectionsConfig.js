import { GROUP_INTROS } from '../../content/reportRestitution.js'
import { FAMILY_THEME } from '../../config/reportFamilyTheme.js'
import { shouldShowEmotionalIntegrations } from './reportFeatureFlags.js'

const REPORT_NAV_SECTION_IDS = new Set([
  'report-tst-sintesi',
  'report-tst-grafici',
  'report-tst-famiglia',
  'report-tst-mappa',
])

const MUSICALITA_ARTICLE_BY_MACRO = {
  Calma: 'della',
  Volitività: 'della',
  Malinconia: 'della',
  Entusiasmo: "dell'",
  Anaffettività: "dell'",
}

export function buildMusicalitaTitle(profilo = {}) {
  const macro = FAMILY_THEME[profilo?.famiglia]?.macro
  if (!macro) return 'Musicalità'
  const article = MUSICALITA_ARTICLE_BY_MACRO[macro] || 'della'
  const separator = article.endsWith("'") ? '' : ' '
  return `Musicalità ${article}${separator}${macro}`
}

/**
 * Voci del menu laterale — ogni `id` deve corrispondere a un anchor nel DOM.
 * `isSub` + `navStep`: sottosezioni numerate visibili nel menu (es. 1.1, 1.2).
 * `isSubSub`: capitoli profilo — solo scroll-spy interno, mai nel menu.
 */
export const REPORT_SECTIONS = [
  { id: 'report-hero', label: 'Risultato con fiore', groupId: 'report-group-hero' },

  // 1. Risultati del test
  { id: 'report-group-profilo-generale', label: 'Risultati del test', groupId: 'report-group-profilo-generale' },
  { id: 'report-tst-sintesi', label: 'Caratteristica emotiva', navStep: '1.1', groupId: 'report-group-profilo-generale', isSub: true },
  { id: 'report-tst-grafici', label: 'Grafici dei risultati', navStep: '1.2', groupId: 'report-group-profilo-generale', isSub: true },
  { id: 'report-tst-famiglia', label: 'La tua natura emotiva di appartenenza', navStep: '1.3', groupId: 'report-group-profilo-generale', isSub: true },
  { id: 'report-chapter-natura', label: 'Natura', groupId: 'report-group-profilo-generale', isSub: true, isSubSub: true },
  { id: 'report-chapter-racconto', label: 'Memoria, Esperienza, Essere Musica', groupId: 'report-group-profilo-generale', isSub: true, isSubSub: true },
  { id: 'report-chapter-risorse', label: 'Risorse', groupId: 'report-group-profilo-generale', isSub: true, isSubSub: true },
  { id: 'report-chapter-ombre', label: 'Ombre', groupId: 'report-group-profilo-generale', isSub: true, isSubSub: true },
  { id: 'report-tst-rapporti', label: 'Il quadro dei rapporti della natura', navStep: '1.4', groupId: 'report-group-profilo-generale', isSub: true },
  { id: 'report-rapporto-natura', label: 'Natura di base', groupId: 'report-group-profilo-generale', isSub: true, isSubSub: true },
  { id: 'report-rapporto-se', label: 'Rapporto con te stesso', groupId: 'report-group-profilo-generale', isSub: true, isSubSub: true },
  { id: 'report-rapporto-altro', label: "Rapporto con l'altro", groupId: 'report-group-profilo-generale', isSub: true, isSubSub: true },
  { id: 'report-rapporto-agire', label: "Rapporto con l'agire", groupId: 'report-group-profilo-generale', isSub: true, isSubSub: true },
  { id: 'report-tst-mappa', label: 'Le cinque famiglie emotive in relazione tra loro', navStep: '1.5', groupId: 'report-group-relazioni', isSub: true },
  { id: 'report-tst-dialogo', label: 'Dialogo tra le correnti emotive', navStep: '1.6', groupId: 'report-group-profilo-generale', isSub: true },

  // 2. Forza delle tue correnti emotive
  { id: 'report-group-forza-correnti', label: 'Forza delle tue correnti emotive', groupId: 'report-group-forza-correnti' },
  { id: 'report-tst-portato', label: 'Portato esperienziale', navStep: '3.1', groupId: 'report-group-forza-correnti', isSub: true },
  { id: 'report-group-forza-correnti', label: 'Attivazioni delle correnti', navStep: '3.2', groupId: 'report-group-forza-correnti', isSub: true },

  // 4. Un contributo all'educazione emotiva
  { id: 'report-group-educazione', label: "Un contributo all'educazione emotiva", groupId: 'report-group-educazione' },
  { id: 'report-tst-parole', label: 'Parole e stati d\'animo', navStep: '4.1', groupId: 'report-group-educazione', isSub: true },

  // 5. In quali stimoli si accende?
  { id: 'report-group-approfondimento', label: 'Aree sonore del test', groupId: 'report-group-approfondimento' },
  { id: 'report-tst-approfondimento', label: 'Aree sonore del test', navStep: '5.1', groupId: 'report-group-approfondimento', isSub: true },
]

/** Macro-blocchi accordion del report — ordine = percorso di lettura. */
export const REPORT_GROUPS = [
  {
    id: 'report-group-hero',
    title: 'Risultato con fiore',
    subtitle: '',
    intro: '',
    stepLabel: undefined,
    readingFocus: '',
    defaultOpen: false,
  },
  {
    id: 'report-group-profilo-generale',
    title: 'Risultati del test',
    subtitle: 'Sintesi, famiglia emotiva, natura e relazioni',
    intro: GROUP_INTROS['report-group-profilo-generale'] || '',
    stepLabel: '1',
    readingFocus: 'Chi sei, la tua famiglia emotiva, le cinque famiglie in relazione.',
    defaultOpen: true,
  },
  {
    id: 'report-tst-rapporti',
    title: 'Quattro rapporti',
    subtitle: '',
    intro: GROUP_INTROS['report-group-quattro-rapporti'] || '',
    stepLabel: '2',
    readingFocus: 'Natura emotiva di base, sé, altro, agire.',
    defaultOpen: false,
  },
  {
    id: 'report-group-forza-correnti',
    title: 'Forza delle tue correnti emotive',
    subtitle: '',
    intro: GROUP_INTROS['report-group-forza-correnti'] || '',
    stepLabel: '3',
    readingFocus: 'Quanto sono forti le correnti e come si orientano nell\'esperienza.',
    defaultOpen: false,
  },
  {
    id: 'report-group-educazione',
    title: "Un contributo all'educazione emotiva",
    subtitle: 'Dizionario emotivo per nominare i sentimenti emersi dal test',
    intro: GROUP_INTROS['report-group-educazione'] || '',
    stepLabel: '4',
    readingFocus: 'Parole emerse dal test, dizionario per famiglia, definizioni e copia.',
    defaultOpen: false,
  },
  {
    id: 'report-group-approfondimento',
    title: 'Aree sonore del test',
    subtitle: 'Lettura delle aree sonore e filtro musicale',
    intro: GROUP_INTROS['report-group-approfondimento'] || '',
    stepLabel: '6',
    readingFocus: 'Come le famiglie emotive si attivano area per area.',
    defaultOpen: false,
  },
  {
    id: 'report-group-relazioni',
    title: 'Le cinque famiglie emotive in relazione tra loro',
    subtitle: '',
    intro: '',
    stepLabel: '7',
    readingFocus: 'Come le cinque famiglie emotive dialogano e si bilanciano tra loro.',
    defaultOpen: false,
  },
]

/** Macro-blocchi nel menu (solo percorso principale, senza dettagli tecnici). */
export const REPORT_NAV_GROUPS = REPORT_GROUPS.filter(
  (g) => g.id !== 'report-group-hero',
)

export function getReportGroups(profilo = {}) {
  let stepIndex = 0

  return REPORT_GROUPS
    .filter(
      (group) =>
        group.id !== 'report-group-relazioni' || shouldShowEmotionalIntegrations(profilo),
    )
    .map((group) => ({
      ...group,
      stepLabel: group.stepLabel ? String(++stepIndex) : group.stepLabel,
    }))
}

export function getReportNavGroups(profilo = {}) {
  return getReportGroups(profilo).filter((g) => g.id !== 'report-group-hero')
}

/** Sezioni tracciate dallo scroll-spy e visibili come sotto-voci nel menu. */
export function getVisibleReportSections(profilo = {}, options = {}) {
  void options

  return REPORT_SECTIONS.filter((section) => {
    if (section.isSubSub) return false
    if (section.id === 'report-hero') return true
    if (!REPORT_NAV_SECTION_IDS.has(section.id)) return false
    if (!section.isSub || !section.navStep) return false
    if (section.id === 'report-tst-mappa') return shouldShowEmotionalIntegrations(profilo)
    return true
  })
}

export const SECTION_TO_GROUP = Object.fromEntries(
  REPORT_SECTIONS.map((s) => [s.id, s.groupId]),
)

/** Id capitoli profilo (Natura/Racconto/Risorse/Ombre) — usati da scroll-spy e navigazione. */
export const PROFILO_CHAPTER_SECTION_IDS = REPORT_SECTIONS.filter(
  (s) => s.groupId === 'report-group-profilo-generale' && s.isSubSub,
).map((s) => s.id)

export function getDefaultGroupOpenState() {
  return Object.fromEntries(REPORT_GROUPS.map((g) => [g.id, g.defaultOpen]))
}

export function getDefaultNavOpenState() {
  return Object.fromEntries(REPORT_NAV_GROUPS.map((g) => [g.id, false]))
}

/** @deprecated Usare REPORT_SECTIONS — alias per compatibilità con ReportSectionNav. */
export const REPORT_TST_SECTIONS = REPORT_SECTIONS.map(({ id, label }) => ({ id, label }))
