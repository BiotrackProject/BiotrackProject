import { useEffect } from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ReportHero from '../components/report/ReportHero'
import ReportSearch from '../components/report/ReportSearch'
import HelpTourButton from '../components/tour/HelpTourButton'
import { useGuidedTour } from '../hooks/useGuidedTour'
import { CITIZEN_SEARCH_TOUR_STEPS } from '../data/tourSteps'

export default function SearchReportsPage() {
  const { startTour, startAutoTour } = useGuidedTour('citizen_search')

  useEffect(() => {
    const cleanup = startAutoTour(CITIZEN_SEARCH_TOUR_STEPS, 800)
    return cleanup
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <div data-tour="citizen-navbar">
        <Navbar />
      </div>

      <main id="main-content" className="flex-1">
        <ReportHero
          category="Consulta"
          title="Búsqueda de Reportes"
        />
        <div data-tour="citizen-search-area">
          <ReportSearch />
        </div>
      </main>

      <Footer />

      <HelpTourButton
        dataTour="citizen-tour-btn"
        onStart={() => startTour(CITIZEN_SEARCH_TOUR_STEPS)}
        label="Ver recorrido de la página"
      />
    </div>
  )
}
