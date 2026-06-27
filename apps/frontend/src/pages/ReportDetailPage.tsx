import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ReportHero from '../components/report/ReportHero'
import { PUBLIC_REPORTS, PUBLIC_STATUS_STYLES } from '../data/publicReports'

export default function ReportDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams()

  const report = useMemo(
    () => PUBLIC_REPORTS.find((item) => item.id === id),
    [id],
  )

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      <main id="main-content" className="flex-1">
        <ReportHero category={t('searchPage.category')} title={t('reportDetail.detailTitle', { id: id ?? '' })} />

        <section className="mx-auto max-w-5xl px-6 py-10">
          {!report ? (
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h2 className="text-xl font-black text-primary">{t('reportDetail.notFoundTitle')}</h2>
              <p className="mt-2 text-sm text-gray-600">
                {t('reportDetail.notFoundMsg')}
              </p>
              <Link
                to="/reportes"
                className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
              >
                {t('reportDetail.backToReports')}
              </Link>
              <Link
                to="/reporte/nuevo"
                className="ml-2 mt-5 inline-flex rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white"
              >
                {t('reportDetail.newReport')}
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <article className="rounded-2xl bg-white p-7 shadow-sm">
                <h2 className="text-xl font-black text-primary">{t('reportDetail.summaryTitle')}</h2>
                <p className="mt-4 text-sm leading-relaxed text-gray-700">{t(`publicSummary.${report.summaryKey}`)}</p>

                <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t('reportDetail.reportDate')}</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-700">{report.date}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t('reportDetail.location')}</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-700">{report.location}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t('reportDetail.type')}</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-700">{t(`publicType.${report.typeKey}`)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t('reportDetail.urgencyLevel')}</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-700">{t(`publicUrgency.${report.urgencyKey}`)}</dd>
                  </div>
                </dl>
              </article>

              <aside className="rounded-2xl bg-white p-7 shadow-sm">
                <h3 className="text-lg font-black text-primary">{t('reportDetail.currentStatus')}</h3>
                <p className="mt-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${PUBLIC_STATUS_STYLES[report.statusKey] ?? 'bg-gray-100 text-gray-500'}`}>
                    {t(`publicStatus.${report.statusKey}`)}
                  </span>
                </p>

                <h4 className="mt-6 text-xs font-semibold uppercase tracking-wide text-gray-400">{t('reportDetail.progress')}</h4>
                <ul className="mt-3 space-y-2">
                  {report.timelineKeys.map((key) => (
                    <li key={key} className="rounded-lg bg-surface px-3 py-2 text-sm text-gray-700">
                      {t(`publicTimeline.${key}`)}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/reportes"
                  className="mt-6 inline-flex rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white"
                >
                  {t('reportDetail.backToList')}
                </Link>
              </aside>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
