const DEFAULT_POLICY = Object.freeze({
  nearGap: 8,
  significantGap: 15,
  significantRatio: 0.55,
  minimumSignificantPercent: 12,
  minimumSecondaryPercent: 7,
})

function numeric(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

/**
 * Gerarchia editoriale deterministica per non confondere "prima" con "unica".
 * Usa soltanto la quota di punti gia' calcolata nella lente; non modifica lo scoring.
 */
export function analyzeFamilyComposition(ranking = [], policy = DEFAULT_POLICY) {
  const sorted = [...ranking]
    .filter((item) => numeric(item?.rawValue) > 0)
    .sort((a, b) => numeric(b.rawValue) - numeric(a.rawValue))

  const leaderPercent = numeric(sorted[0]?.distributionPercent)
  const leaderRaw = numeric(sorted[0]?.rawValue)

  const families = sorted.map((item, index) => {
    const percent = numeric(item.distributionPercent)
    const gap = Math.max(0, Number((leaderPercent - percent).toFixed(1)))
    const ratio = leaderPercent > 0 ? Number((percent / leaderPercent).toFixed(3)) : 0
    let salience = 'marginal'

    if (index === 0) salience = 'leader'
    else if (item.rawValue === leaderRaw || gap <= policy.nearGap) salience = 'near'
    else if (
      percent >= policy.minimumSignificantPercent &&
      (gap <= policy.significantGap || ratio >= policy.significantRatio)
    ) salience = 'significant'
    else if (percent >= policy.minimumSecondaryPercent) salience = 'secondary'

    return { ...item, rank: index + 1, gapFromLeader: gap, ratioToLeader: ratio, salience }
  })

  return {
    status: families.length === 0
      ? 'empty'
      : families.some((item) => item.salience === 'near')
        ? 'balanced'
        : families.some((item) => item.salience === 'significant')
          ? 'mixed'
          : 'focused',
    leader: families[0] || null,
    families,
    foreground: families.filter((item) => ['leader', 'near', 'significant'].includes(item.salience)),
    background: families.filter((item) => ['secondary', 'marginal'].includes(item.salience)),
    policy,
  }
}

export function getFamilySalience(composition, familyKey) {
  return composition?.families?.find((item) => item.familyKey === familyKey) || null
}

export function canSupportStrongInterpretation(item) {
  return ['leader', 'near', 'significant'].includes(item?.salience)
}

