import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ReportHero from '../components/report/ReportHero'
import StatusBadge from '../components/ui/StatusBadge'
import RecursoPublicoFallback from '../components/report/RecursoPublicoFallback'
import { useRecursoPublico } from '../hooks/useRecursoPublico'
import {
  denunciasService,
  type DenunciaSeguimiento,
} from '../services/denunciasService'
import { formatDate } from '../utils/dates'

export default function ReportDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const state = useRecursoPublico(id, (codigo) => denunciasService.getSeguimiento(codigo), t('reportDetail.loadFetchError'))

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      <main id="main-content" className="flex-1">
        <ReportHero category={t('searchPage.category')} title={t('reportDetail.detailTitle', { id: id ?? '' })} />

        <section className="mx-auto max-w-5xl px-6 py-10">
          {state.status === 'found' ? (
            <ReportDetail reporte={state.data} />
          ) : (
            <RecursoPublicoFallback
              state={state}
              loadingText={t('reportDetail.loading')}
              notFoundTitle={t('reportDetail.notFoundTitle')}
              notFoundDesc={t('reportDetail.notFoundMsg')}
              errorTitle={t('reportDetail.loadError')}
              actions={
                <>
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
                </>
              }
            />
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}

function ReportDetail({ reporte }: Readonly<{ reporte: DenunciaSeguimiento }>) {
  const { t } = useTranslation()
  const fecha = formatDate(reporte.Fecha_denuncia)
  const fechaIncidente = reporte.fecha_incidente ? formatDate(reporte.fecha_incidente) : null

  const timeline = reporte.historial_estado_denuncia.length
    ? reporte.historial_estado_denuncia.map((h) => ({
        key: h.id,
        estado: h.estado_nuevo,
        fecha: formatDate(h.created_at),
        comentario: h.comentario,
      }))
    : [{ key: 'actual', estado: reporte.Estado, fecha, comentario: null }]

  const acciones = reporte.acciones ?? []

  return (
    <div className="flex flex-col gap-6">
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <article className="rounded-2xl bg-white p-7 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-black text-primary">{t('reportDetail.summaryTitle')}</h2>
          <span className="text-sm font-semibold text-gray-400">{reporte.codigo_seguimiento}</span>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">{reporte.Descripcion}</p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t('reportDetail.reportDate')}</dt>
            <dd className="mt-1 text-sm font-semibold text-gray-700">{fecha}</dd>
          </div>
          {fechaIncidente && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t('reportDetail.incidentDate')}</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-700">{fechaIncidente}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t('reportDetail.location')}</dt>
            <dd className="mt-1 text-sm font-semibold text-gray-700">{reporte.detalle_ubicacion || t('reportDetail.locationNone')}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t('reportDetail.type')}</dt>
            <dd className="mt-1 text-sm font-semibold text-gray-700">{t(`tipos.${reporte.tipo_actividad}`, reporte.tipo_actividad)}</dd>
          </div>
          {reporte.nivel_urgencia && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t('reportDetail.urgencyLevel')}</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-700">{reporte.nivel_urgencia}</dd>
            </div>
          )}
        </dl>
      </article>

      <aside className="rounded-2xl bg-white p-7 shadow-sm">
        <h3 className="text-lg font-black text-primary">{t('reportDetail.currentStatus')}</h3>
        <p className="mt-3">
          <StatusBadge status={reporte.Estado} />
        </p>

        <h4 className="mt-6 text-xs font-semibold uppercase tracking-wide text-gray-400">{t('reportDetail.progress')}</h4>
        <ul className="mt-3 space-y-2">
          {timeline.map((step) => (
            <li key={step.key} className="rounded-lg bg-surface px-3 py-2 text-sm text-gray-700">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{t(`estados.${step.estado}`, step.estado)}</span>
                <span className="text-xs text-gray-400">{step.fecha}</span>
              </div>
              {step.comentario && <p className="mt-1 text-xs text-gray-500">{step.comentario}</p>}
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

      {/* Corrective actions (RF-5.2) */}
      {acciones.length > 0 && (
        <article className="rounded-2xl bg-white p-7 shadow-sm">
          <h2 className="text-xl font-black text-primary">{t('reportDetail.accionesTitle')}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('reportDetail.accionesDesc')}
          </p>
          <ul className="mt-5 space-y-3">
            {acciones.map((a) => {
              const fechaAccion = a.FechaImplementacion ?? a.FechaPlanificacion
              return (
                <li key={a.IDAccion} className="rounded-xl border border-gray-100 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-gray-800">{a.titulo}</h3>
                    <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-gray-600">
                      {t(`estados.${a.Estado}`)}
                    </span>
                  </div>
                  {a.resumen_publico && (
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{a.resumen_publico}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-gray-400">
                      {fechaAccion ? t('reportDetail.executionDate', { date: formatDate(fechaAccion) }) : t('reportDetail.dateTbd')}
                    </span>
                    <Link
                      to={`/reportes/accion/${a.IDAccion}`}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      {t('reportDetail.viewFullReport')}
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        </article>
      )}
    </div>
  )
}
