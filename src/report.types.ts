/**
 * Authoritative shared contract for TST Report.
 * All agents must import types from this file.
 *
 * Naming law:
 * - Components: PascalCase
 * - Props: camelCase
 * - Files: kebab-case
 * - No abbreviations allowed
 */

/**
 * TODO: Define canonical shape for hero profile data.
 * Missing source specification from product/tech leadership.
 */
export type HeroProfileData = unknown;

/**
 * TODO: Define canonical shape for flower graph payload.
 * Missing source specification from data/analytics ownership.
 */
export type FlowerGraphData = unknown;

export interface FlowerData {
  id: string;
  title: string;
  themeColor: string;
  dominantTrait: string;
  quickInsightText: string;
  scientificText: string;
  deepDiveText: string;
  graphData: FlowerGraphData;
}

/**
 * TODO: Define canonical shape for synthesis data.
 * Missing source specification from narrative/report ownership.
 */
export type SynthesisData = unknown;

/**
 * TODO: Define canonical shape for closing narrative data.
 * Missing source specification from narrative/report ownership.
 */
export type ClosingNarrativeData = unknown;

export interface ReportData {
  heroProfile: HeroProfileData;
  flowers: [FlowerData, FlowerData, FlowerData, FlowerData];
  synthesis: SynthesisData;
  closingNarrative: ClosingNarrativeData;
}

export interface HeroProfileProps {
  heroProfile: ReportData["heroProfile"];
}

export interface FlowerSectionProps {
  flower: FlowerData;
}

export interface BigGraphProps {
  graphData: FlowerGraphData;
  themeColor: FlowerData["themeColor"];
}

export interface StickyNavigatorProps {
  flowers: ReportData["flowers"];
  sectionIds: ReportSectionId[];
  activeSectionId: ReportSectionId;
  progressPercent: number;
  onSectionSelect: (sectionId: ReportSectionId) => void;
}

export interface FinalSynthesisProps {
  synthesis: ReportData["synthesis"];
}

export interface ClosingNarrativeProps {
  closingNarrative: ReportData["closingNarrative"];
}

export type ReportSectionId =
  | "hero-profile"
  | "flower-1"
  | "flower-2"
  | "flower-3"
  | "flower-4"
  | "final-synthesis"
  | "closing-narrative";

export interface ScientificDeepDiveProps {
  content: FlowerData["deepDiveText"];
}
