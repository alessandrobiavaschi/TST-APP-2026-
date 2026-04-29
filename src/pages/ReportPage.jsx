import React, { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import HeroProfile from '../components/report/HeroProfile'
import FlowerSection from '../components/report/FlowerSection'
import FinalSynthesis from '../components/report/FinalSynthesis'
import ClosingNarrative from '../components/report/ClosingNarrative'

const REPORT_SESSION_STORAGE_KEY = 'tst_report_data'

function isValidReportData(candidate) {
  return (
    candidate &&
    typeof candidate === 'object' &&
    Array.isArray(candidate.flowers) &&
    candidate.flowers.length === 4
  )
}

function ReportPage() {
  const location = useLocation()
  const routedReportData = location.state?.reportData
  const persistedReportData = useMemo(() => {
    if (routedReportData) return null
    try {
      const persistedValue = window.sessionStorage.getItem(REPORT_SESSION_STORAGE_KEY)
      if (!persistedValue) return null
      const parsedValue = JSON.parse(persistedValue)
      return isValidReportData(parsedValue) ? parsedValue : null
    } catch {
      return null
    }
  }, [routedReportData])

  const reportData = routedReportData || persistedReportData

  useEffect(() => {
    if (!isValidReportData(routedReportData)) return
    try {
      window.sessionStorage.setItem(REPORT_SESSION_STORAGE_KEY, JSON.stringify(routedReportData))
    } catch {
      // noop
    }
  }, [routedReportData])

  if (!isValidReportData(reportData)) {
    return <main>TODO: report data missing</main>
  }

  return (
    <main
      style={{
        display: 'grid',
        gap: '64px',
        padding: '40px 24px 120px',
      }}
    >
      <HeroProfile heroProfile={reportData.heroProfile} />
      {reportData.flowers.map((flower, index) => (
        <FlowerSection
          key={flower?.id || `flower-${index + 1}`}
          flower={flower}
          sectionId={`flower-${index + 1}`}
        />
      ))}
      <FinalSynthesis synthesis={reportData.synthesis} />
      <ClosingNarrative closingNarrative={reportData.closingNarrative} />
    </main>
  )
}

export default ReportPage
