// Funzioni pure per la gamification lato operatore.
// Operano solo su dati già caricati da Firestore (records con shape { id, raw }).

function getSafeDate(value) {
  if (!value) return null
  try {
    if (value.toDate) {
      return value.toDate()
    }
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return null
    return d
  } catch {
    return null
  }
}

function getPatientKey(raw) {
  const nome = (raw?.Nome || '').trim()
  const cognome = (raw?.Cognome || '').trim()
  const base = [nome, cognome].filter(Boolean).join(' ').trim()
  if (base) return base
  if (raw?.areaId) return `Area:${String(raw.areaId)}`
  return 'Anonimo'
}

export function computeOperatorStats(records) {
  const now = new Date()
  const MS_PER_DAY = 24 * 60 * 60 * 1000

  let totalTests = 0
  const patientsSet = new Set()
  let latestTestDate = null
  let testsLast30Days = 0

  const byPatient = new Map()
  const activeWeeks = new Set()

  const getWeekKey = (date) => {
    const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    // Giovedì come riferimento ISO
    const dayNum = (tmp.getUTCDay() + 6) % 7
    tmp.setUTCDate(tmp.getUTCDate() - dayNum + 3)
    const firstThursday = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 4))
    const diff = tmp - firstThursday
    const week = 1 + Math.round(diff / (7 * MS_PER_DAY))
    return `${tmp.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
  }

  records.forEach((rec) => {
    const raw = rec?.raw || {}
    const date = getSafeDate(raw.Data_Ora_Fine_Test)
    totalTests += 1

    const patientKey = getPatientKey(raw)
    patientsSet.add(patientKey)
    if (!byPatient.has(patientKey)) {
      byPatient.set(patientKey, [])
    }
    if (date) {
      byPatient.get(patientKey).push(date)

      if (!latestTestDate || date > latestTestDate) {
        latestTestDate = date
      }

      const daysAgo = (now - date) / MS_PER_DAY
      if (daysAgo <= 30) {
        testsLast30Days += 1
      }

      activeWeeks.add(getWeekKey(date))
    }
  })

  let patientsWithMultipleTests = 0
  let patientsWith3PlusTests = 0

  byPatient.forEach((dates) => {
    if (dates.length >= 2) patientsWithMultipleTests += 1
    if (dates.length >= 3) patientsWith3PlusTests += 1
  })

  return {
    totalTests,
    uniquePatients: patientsSet.size,
    latestTestDate,
    testsLast30Days,
    patientsWithMultipleTests,
    patientsWith3PlusTests,
    activeWeeks,
  }
}

export function deriveOperatorLevel(stats) {
  if (!stats || !stats.totalTests) {
    return 'nessuno'
  }

  const { totalTests, patientsWithMultipleTests } = stats

  if (totalTests >= 40 && patientsWithMultipleTests >= 10) {
    return 'esperto'
  }
  if (totalTests >= 10 && patientsWithMultipleTests >= 3) {
    return 'avanzato'
  }
  return 'base'
}

export function deriveBadges(stats) {
  const total = stats?.totalTests || 0
  const multi = stats?.patientsWithMultipleTests || 0
  const multi3 = stats?.patientsWith3PlusTests || 0

  return [
    {
      id: 'first-test',
      label: 'Primo test condotto',
      description: 'Hai completato almeno un protocollo TST.',
      unlocked: total >= 1,
    },
    {
      id: 'observer',
      label: 'Osservatore costante',
      description: 'Almeno tre pazienti con due o più test nel tempo.',
      unlocked: multi >= 3,
    },
    {
      id: 'comparative-gaze',
      label: 'Sguardo comparativo',
      description: 'Almeno un paziente con tre o più test effettuati.',
      unlocked: multi3 >= 1,
    },
    {
      id: 'archive-growing',
      label: 'Archivio in crescita',
      description: 'Più di venti test archiviati nel tempo.',
      unlocked: total >= 20,
    },
  ]
}

export function deriveContinuityTimeline(stats, weeksBack = 8) {
  const activeWeeks = stats?.activeWeeks || new Set()
  const result = []
  if (!weeksBack || weeksBack <= 0) return result

  const now = new Date()
  const MS_PER_DAY = 24 * 60 * 60 * 1000

  const getWeekKey = (date) => {
    const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = (tmp.getUTCDay() + 6) % 7
    tmp.setUTCDate(tmp.getUTCDate() - dayNum + 3)
    const firstThursday = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 4))
    const diff = tmp - firstThursday
    const week = 1 + Math.round(diff / (7 * MS_PER_DAY))
    return `${tmp.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
  }

  for (let i = weeksBack - 1; i >= 0; i -= 1) {
    const d = new Date(now.getTime() - i * 7 * MS_PER_DAY)
    const key = getWeekKey(d)
    const active = activeWeeks.has(key)
    result.push({
      key,
      label: `Sett. ${key.split('W')[1]}`,
      active,
    })
  }

  return result
}

export function deriveSuggestions(records, daysThreshold = 90, maxSuggestions = 5) {
  const now = new Date()
  const MS_PER_DAY = 24 * 60 * 60 * 1000
  const byPatient = new Map()

  records.forEach((rec) => {
    const raw = rec?.raw || {}
    const date = getSafeDate(raw.Data_Ora_Fine_Test)
    if (!date) return
    const key = getPatientKey(raw)
    const current = byPatient.get(key)
    if (!current || date > current.date) {
      byPatient.set(key, { date, raw })
    }
  })

  const suggestions = []

  byPatient.forEach((value, key) => {
    const daysAgo = (now - value.date) / MS_PER_DAY
    if (daysAgo >= daysThreshold) {
      suggestions.push({
        patientName: key,
        lastTestDate: value.date,
        daysAgo: Math.floor(daysAgo),
      })
    }
  })

  suggestions.sort((a, b) => b.daysAgo - a.daysAgo)
  return suggestions.slice(0, maxSuggestions)
}

