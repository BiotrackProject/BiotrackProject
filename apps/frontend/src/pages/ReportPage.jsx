import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ReportHero from '../components/report/ReportHero'
import ReportForm from '../components/report/ReportForm'
import ReportSidebar from '../components/report/ReportSidebar'
import HelpTourButton from '../components/tour/HelpTourButton'
import { useGuidedTour } from '../hooks/useGuidedTour'
import { CITIZEN_TOUR_STEPS } from '../data/tourSteps'

export default function ReportPage() {
  const { startTour, startAutoTour } = useGuidedTour('citizen')

  useEffect(() => {
    const cleanup = startAutoTour(CITIZEN_TOUR_STEPS)
    return cleanup
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <div data-tour="citizen-navbar">
        <Navbar />
      </div>

      <main id="main-content" className="flex-1">
        <div data-tour="citizen-report-intro">
          <ReportHero
            category="Reporte"
            title="Actividad sospechosa de extracción de arena"
          />
        </div>

        {/* Intro text */}
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm leading-relaxed text-gray-600">
                Completa los campos esenciales para registrar una denuncia relacionada
                con extraccion ilegal de arena u otras actividades ambientales
                irregulares.
              </p>
              <ol className="mt-4 space-y-2 text-sm text-gray-600">
                <li><span className="font-semibold text-primary">1.</span> Describe ubicacion, actividad y fecha aproximada.</li>
                <li><span className="font-semibold text-primary">2.</span> Adjunta evidencia visual si esta disponible.</li>
                <li><span className="font-semibold text-primary">3.</span> Recibe un ID para dar seguimiento en la consulta.</li>
              </ol>
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-sm font-bold text-primary">¿Ya reportaste antes?</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-600">
                Consulta el estado de un caso existente por ID o ubicacion sin volver a registrar la incidencia.
              </p>
              <Link
                to="/reportes"
                className="mt-3 inline-flex rounded-lg border border-primary px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
              >
                Ir a consulta de reportes
              </Link>
            </div>
          </div>
        </div>

        {/* Form + Sidebar */}
        <div className="mx-auto max-w-6xl px-6 pb-16">
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_300px]">
            <div data-tour="citizen-report-form">
              <ReportForm />
            </div>
            <div className="lg:sticky lg:top-6" data-tour="citizen-report-sidebar">
              <ReportSidebar />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <HelpTourButton
        dataTour="citizen-tour-btn"
        onStart={() => startTour(CITIZEN_TOUR_STEPS)}
        label="Ver recorrido de la página"
      />
    </div>
  )
}
