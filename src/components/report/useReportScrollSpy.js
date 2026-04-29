import { useEffect, useMemo, useState } from 'react'

/**
 * @typedef {import('../../report.types').ReportSectionId} ReportSectionId
 */

/**
 * @param {ReportSectionId[]} sectionIds
 */
function useReportScrollSpy(sectionIds) {
  const [activeSectionId, setActiveSectionId] = useState(sectionIds[0])

  useEffect(() => {
    if (!sectionIds.length) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const intersectingEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((entryA, entryB) => entryB.intersectionRatio - entryA.intersectionRatio)

        if (!intersectingEntries.length) return
        const nextSectionId = intersectingEntries[0].target.id
        if (sectionIds.includes(nextSectionId)) {
          setActiveSectionId(nextSectionId)
        }
      },
      {
        root: null,
        threshold: [0.25, 0.5, 0.75],
        rootMargin: '-20% 0px -55% 0px',
      },
    )

    sectionIds.forEach((sectionId) => {
      const sectionElement = document.getElementById(sectionId)
      if (sectionElement) observer.observe(sectionElement)
    })

    return () => observer.disconnect()
  }, [sectionIds])

  const progressPercent = useMemo(() => {
    if (!sectionIds.length) return 0
    const activeIndex = sectionIds.findIndex((sectionId) => sectionId === activeSectionId)
    if (activeIndex <= 0) return 0
    return (activeIndex / (sectionIds.length - 1)) * 100
  }, [activeSectionId, sectionIds])

  return {
    activeSectionId,
    setActiveSectionId,
    progressPercent,
  }
}

export default useReportScrollSpy
