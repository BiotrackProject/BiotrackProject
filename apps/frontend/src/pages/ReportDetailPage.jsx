import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ReportHero from '../components/report/ReportHero'
import { PUBLIC_REPORTS, PUBLIC_STATUS_STYLES } from '../data/publicReports'

export default function ReportDetailPage() {
  const { id } = useParams()

  const report = useMemo(
    () => PUBLIC_REPORTS.find((item) => item.id === id),
    [id],
  )

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      <main id="main-content" className="flex-1">
        <ReportHero category="Consulta" title={`Detalle de reporte ${id ?? ''}`} />

        <section className="mx-auto max-w-5xl px-6 py-10">
          {!report ? (
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h2 className="text-xl font-black text-primary">Reporte no encontrado</h2>
              <p className="mt-2 text-sm text-gray-600">
                El identificador consultado no existe o no esta disponible.
              </p>
              <Link
                to="/reportes"
                className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
              >
                Volver a reportes
              </Link>
              <Link
                to="/reporte/nuevo"
                className="ml-2 mt-5 inline-flex rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white"
              >
                Crear nuevo reporte
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <article className="rounded-2xl bg-white p-7 shadow-sm">
                <h2 className="text-xl font-black text-primary">Resumen del caso</h2>
                <p className="mt-4 text-sm leading-relaxed text-gray-700">{report.summary}</p>

                <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Fecha de reporte</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-700">{report.date}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Ubicacion</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-700">{report.location}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Tipo</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-700">{report.type}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Nivel de urgencia</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-700">{report.urgency}</dd>
                  </div>
                </dl>
              </article>

              <aside className="rounded-2xl bg-white p-7 shadow-sm">
                <h3 className="text-lg font-black text-primary">Estado actual</h3>
                <p className="mt-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${PUBLIC_STATUS_STYLES[report.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {report.status}
                  </span>
                </p>

                <h4 className="mt-6 text-xs font-semibold uppercase tracking-wide text-gray-400">Progreso</h4>
                <ul className="mt-3 space-y-2">
                  {report.timeline.map((step) => (
                    <li key={step} className="rounded-lg bg-surface px-3 py-2 text-sm text-gray-700">
                      {step}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/reportes"
                  className="mt-6 inline-flex rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white"
                >
                  Volver al listado
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
