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

  // 1. Sintesi della natura
  { id: 'report-group-profilo-generale', label: 'Il profilo in sintesi', groupId: 'report-group-profilo-generale' },
  { id: 'report-tst-sintesi', label: 'Natura', navStep: '1.1', groupId: 'report-group-profilo-generale', isSub: true },

  // 2. I quattro rapporti
  { id: 'report-tst-rapporti', label: 'I quattro rapporti', groupId: 'report-tst-rapporti' },
  { id: 'report-rapporto-natura', label: 'Natura di base', groupId: 'report-tst-rapporti', isSub: true, isSubSub: true },
  { id: 'report-rapporto-se', label: 'Rapporto con te stesso', groupId: 'report-tst-rapporti', isSub: true, isSubSub: true },
  { id: 'report-rapporto-altro', label: "Rapporto con l'altro", groupId: 'report-tst-rapporti', isSub: true, isSubSub: true },
  { id: 'report-rapporto-agire', label: "Rapporto con l'agire", groupId: 'report-tst-rapporti', isSub: true, isSubSub: true },

  // 3. Identità emotiva e natura
  { id: 'stanza-identita', label: 'Identità emotiva e natura', groupId: 'stanza-identita' },
  { id: 'report-tst-famiglia', label: PROFILO_UI.title, navStep: '3.1', groupId: 'stanza-identita', isSub: true },
  { id: 'report-chapter-natura', label: 'Natura', groupId: 'stanza-identita', isSub: true, isSubSub: true },
  { id: 'report-chapter-racconto', label: 'Memoria, Esperienza, Essere Musica', groupId: 'stanza-identita', isSub: true, isSubSub: true },
  { id: 'report-chapter-risorse', label: 'Risorse', groupId: 'stanza-identita', isSub: true, isSubSub: true },
  { id: 'report-chapter-ombre', label: 'Ombre', groupId: 'stanza-identita', isSub: true, isSubSub: true },

  // 4. L'insieme della tua Identità Emotiva: grafici e portato esperienziale
  { id: 'report-group-forza-correnti', label: "L'insieme della tua Identità Emotiva", groupId: 'report-group-forza-correnti' },
  { id: 'report-tst-grafici', label: 'Grafici dei risultati', navStep: '4.1', groupId: 'report-group-forza-correnti', isSub: true },
  { id: 'report-tst-portato', label: 'Come hai vissuto il test', navStep: '4.2', groupId: 'report-group-forza-correnti', isSub: true },

  // 5. Parole
  { id: 'report-group-educazione', label: "Un contributo all'educazione emotiva", groupId: 'report-group-educazione' },
  { id: 'report-tst-parole', label: 'Parole e stati d\'animo', navStep: '5.1', groupId: 'report-group-educazione', isSub: true },

  // 6. Famiglie in relazione
  { id: 'report-tst-mappa', label: 'Le cinque famiglie emotive in relazione tra loro', navStep: '6.1', groupId: 'report-group-relazioni', isSub: true },
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
    subtitle: 'La famiglia prevalente e la sua Natura emotiva temperamentale',
    intro: GROUP_INTROS['report-group-profilo-generale'] || '',
    stepLabel: '1',
    readingFocus: 'La famiglia prevalente e la Natura emotiva temperamentale che emerge dalle risposte.',
    defaultOpen: true,
  },
  {
    id: 'report-tst-rapporti',
    title: 'I quattro rapporti',
    subtitle: '',
    intro: GROUP_INTROS['report-group-quattro-rapporti'] || '',
    stepLabel: '2',
    readingFocus: 'Natura emotiva di base, sé, altro, agire.',
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
    id: 'report-group-forza-correnti',
    title: "L'insieme della tua Identità Emotiva",
    subtitle: '',
    intro: GROUP_INTROS['report-group-forza-correnti'] || '',
    stepLabel: '4',
    readingFocus: 'Le quote delle famiglie e delle nature, e come si è orientata la relazione con il contenuto musicale.',
    defaultOpen: false,
  },
  {
    id: 'report-group-educazione',
    title: 'Parole',
    subtitle: '',
    intro: GROUP_INTROS['report-group-educazione'] || '',
    stepLabel: '5',
    readingFocus: 'Le parole chiave e gli stati d’animo essenziali delle 5 famiglie.',
    defaultOpen: false,
  },
  {
    id: 'report-group-relazioni',
    title: 'Le cinque famiglie emotive in relazione tra loro',
    subtitle: '',
    intro: '',
    stepLabel: '6',
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
  (s) => s.id.startsWith('report-chapter-'),
).map((s) => s.id)

export function getDefaultGroupOpenState() {
  return Object.fromEntries(REPORT_GROUPS.map((g) => [g.id, g.defaultOpen]))
}

export function getDefaultNavOpenState() {
  return Object.fromEntries(REPORT_NAV_GROUPS.map((g) => [g.id, false]))
}

/** @deprecated Usare REPORT_SECTIONS — alias per compatibilità con ReportSectionNav. */
export const REPORT_TST_SECTIONS = REPORT_SECTIONS.map(({ id, label }) => ({ id, label }))
