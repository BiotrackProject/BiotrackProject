import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ReportHero from '../components/report/ReportHero'
import ReportSearch from '../components/report/ReportSearch'
import HelpTourButton from '../components/tour/HelpTourButton'
import { useGuidedTour } from '../hooks/useGuidedTour'
import { getCitizenSearchTourSteps } from '../data/tourSteps'

export default function SearchReportsPage() {
  const { t } = useTranslation()
  const { startTour, startAutoTour } = useGuidedTour('citizen_search')
  const searchSteps = getCitizenSearchTourSteps(t)

  useEffect(() => {
    const cleanup = startAutoTour(searchSteps, 800)
    return cleanup
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <div data-tour="citizen-navbar">
        <Navbar />
      </div>

      <main id="main-content" className="flex-1">
        <ReportHero
          category={t('searchPage.category')}
          title={t('searchPage.title')}
        />
        <div data-tour="citizen-search-area">
          <ReportSearch />
        </div>
      </main>

      <Footer />

      <HelpTourButton
        dataTour="citizen-tour-btn"
        onStart={() => startTour(searchSteps)}
        label={t('searchPage.tourLabel')}
      />
    </div>
  )
}
