import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ReportHero from '../components/report/ReportHero'
import ReportForm from '../components/report/ReportForm'
import ReportSidebar from '../components/report/ReportSidebar'
import HelpTourButton from '../components/tour/HelpTourButton'
import { useGuidedTour } from '../hooks/useGuidedTour'
import { getCitizenTourSteps } from '../data/tourSteps'

export default function ReportPage() {
  const { t } = useTranslation()
  const { startTour, startAutoTour } = useGuidedTour('citizen')

  const citizenSteps = getCitizenTourSteps(t)

  useEffect(() => {
    const cleanup = startAutoTour(citizenSteps)
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
            category={t('reportPage.category')}
            title={t('reportPage.title')}
          />
        </div>

        {/* Intro text */}
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm leading-relaxed text-gray-600">
                {t('reportPage.introText')}
              </p>
              <ol className="mt-4 space-y-2 text-sm text-gray-600">
                <li><span className="font-semibold text-primary">1.</span> {t('reportPage.step1')}</li>
                <li><span className="font-semibold text-primary">2.</span> {t('reportPage.step2')}</li>
                <li><span className="font-semibold text-primary">3.</span> {t('reportPage.step3')}</li>
              </ol>
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-sm font-bold text-primary">{t('reportPage.alreadyReported')}</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-600">
                {t('reportPage.alreadyReportedDesc')}
              </p>
              <Link
                to="/reportes"
                className="mt-3 inline-flex rounded-lg border border-primary px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
              >
                {t('reportPage.goToConsult')}
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
        onStart={() => startTour(citizenSteps)}
        label={t('reportPage.tourLabel')}
      />
    </div>
  )
}
