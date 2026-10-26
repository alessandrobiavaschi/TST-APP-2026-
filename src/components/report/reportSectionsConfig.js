import { GROUP_INTROS } from '../../content/reportRestitution.js'
import { FAMILY_THEME } from '../../config/reportFamilyTheme.js'
import { shouldShowEmotionalIntegrations } from './reportFeatureFlags.js'
import { PROFILO_UI } from './reportUiCopy.js'

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
  { id: 'report-tst-sintesi', label: 'Natura', navStep: '1.1', groupId: 'report-group-profilo-generale', isSub: true },
  { id: 'report-tst-grafici', label: 'Grafici dei risultati', navStep: '1.2', groupId: 'report-group-profilo-generale', isSub: true },
  { id: 'report-tst-famiglia', label: PROFILO_UI.title, navStep: '1.3', groupId: 'report-group-profilo-generale', isSub: true },
  { id: 'report-chapter-natura', label: 'Natura', groupId: 'report-group-profilo-generale', isSub: true, isSubSub: true },
  { id: 'report-chapter-racconto', label: 'Memoria, Esperienza, Essere Musica', groupId: 'report-group-profilo-generale', isSub: true, isSubSub: true },
  { id: 'report-chapter-risorse', label: 'Risorse', groupId: 'report-group-profilo-generale', isSub: true, isSubSub: true },
  { id: 'report-chapter-ombre', label: 'Ombre', groupId: 'report-group-profilo-generale', isSub: true, isSubSub: true },
  { id: 'report-tst-rapporti', label: 'I quattro rapporti', groupId: 'report-tst-rapporti' },
  { id: 'report-rapporto-natura', label: 'Natura di base', groupId: 'report-group-profilo-generale', isSub: true, isSubSub: true },
  { id: 'report-rapporto-se', label: 'Rapporto con te stesso', groupId: 'report-group-profilo-generale', isSub: true, isSubSub: true },
  { id: 'report-rapporto-altro', label: "Rapporto con l'altro", groupId: 'report-group-profilo-generale', isSub: true, isSubSub: true },
  { id: 'report-rapporto-agire', label: "Rapporto con l'agire", groupId: 'report-group-profilo-generale', isSub: true, isSubSub: true },
  { id: 'report-tst-mappa', label: 'Le cinque famiglie emotive in relazione tra loro', navStep: '1.5', groupId: 'report-group-relazioni', isSub: true },

  // 2. Forza delle tue correnti emotive
  { id: 'report-group-forza-correnti', label: 'Forza delle tue correnti emotive', groupId: 'report-group-forza-correnti' },
  { id: 'report-tst-portato', label: 'Come hai vissuto il test', navStep: '3.1', groupId: 'report-group-forza-correnti', isSub: true },
  { id: 'report-group-forza-correnti', label: 'Attivazioni delle correnti', navStep: '3.2', groupId: 'report-group-forza-correnti', isSub: true },

  // 4. Un contributo all'educazione emotiva
  { id: 'report-group-educazione', label: "Un contributo all'educazione emotiva", groupId: 'report-group-educazione' },
  { id: 'report-tst-parole', label: 'Parole e stati d\'animo', navStep: '4.1', groupId: 'report-group-educazione', isSub: true },
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
    title: 'Il profilo in sintesi',
    subtitle: 'Risultato e distribuzione delle famiglie emotive',
    intro: GROUP_INTROS['report-group-profilo-generale'] || '',
    stepLabel: '1',
    readingFocus: 'Il risultato principale e la presenza delle cinque famiglie emotive.',
    defaultOpen: true,
  },
  {
    id: 'report-group-relazioni',
    title: 'Le cinque famiglie emotive in relazione tra loro',
    subtitle: '',
    intro: '',
    stepLabel: '2',
    readingFocus: 'Come le cinque famiglie emotive dialogano e si bilanciano tra loro.',
    defaultOpen: false,
  },
  {
    id: 'stanza-identita',
    title: 'Identità emotiva e natura',
    subtitle: 'Natura, racconto, risorse e ombre',
    intro: '',
    stepLabel: '3',
    readingFocus: 'Come la natura emotiva prende forma nel racconto personale.',
    defaultOpen: false,
  },
  {
    id: 'report-tst-rapporti',
    title: 'I quattro rapporti',
    subtitle: '',
    intro: GROUP_INTROS['report-group-quattro-rapporti'] || '',
    stepLabel: '4',
    readingFocus: 'Natura emotiva di base, sé, altro, agire.',
    defaultOpen: false,
  },
  {
    id: 'report-group-forza-correnti',
    title: 'Portato esperienziale e vitalità',
    subtitle: '',
    intro: GROUP_INTROS['report-group-forza-correnti'] || '',
    stepLabel: '5',
    readingFocus: 'Come si è orientata la relazione con il contenuto musicale.',
    defaultOpen: false,
  },
  {
    id: 'report-group-educazione',
    title: 'Parole',
    subtitle: '',
    intro: GROUP_INTROS['report-group-educazione'] || '',
    stepLabel: '6',
    readingFocus: 'Le parole chiave e gli stati d’animo essenziali delle 5 famiglie.',
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
