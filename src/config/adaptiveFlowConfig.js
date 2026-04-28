export const ADAPTIVE_FLOW_CONFIG = {
  responseWindowSize: 4,
  minSamplesForClassification: 3,
  fastThresholdMs: 1000,
  slowThresholdMs: 5000,
  baseTimings: {
    transitionDelayMs: 180,
    fadeInDurationMs: 260,
    processingStateMs: 180,
    choiceResetMs: 220,
    choiceRecallMs: 250,
  },
  multipliers: {
    fast: {
      transitionDelay: 0.8,
      fadeIn: 0.9,
      processing: 0.85,
      choiceReset: 0.9,
      choiceRecall: 0.9,
      neuroFlow: 0.9,
      spacing: 1,
    },
    balanced: {
      transitionDelay: 1,
      fadeIn: 1,
      processing: 1,
      choiceReset: 1,
      choiceRecall: 1,
      neuroFlow: 1,
      spacing: 1,
    },
    slow: {
      transitionDelay: 1.25,
      fadeIn: 1.4,
      processing: 1.3,
      choiceReset: 1.25,
      choiceRecall: 1.2,
      neuroFlow: 1.25,
      spacing: 1.08,
    },
  },
}

