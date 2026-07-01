import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ReportHero from '../components/report/ReportHero'
import StatusBadge from '../components/ui/StatusBadge'
import {
  denunciasService,
  ESTADO_LABEL,
  TIPO_LABEL,
  type DenunciaSeguimiento,
} from '../services/denunciasService'

type FetchState =
  | { status: 'loading' }
  | { status: 'found'; reporte: DenunciaSeguimiento }
  | { status: 'notFound' }
  | { status: 'error'; message: string }

export default function ReportDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  // Inicializador perezoso para no llamar setState síncronamente en el effect.
  const [state, setState] = useState<FetchState>(() => (id ? { status: 'loading' } : { status: 'notFound' }))

  useEffect(() => {
    if (!id) return
    let active = true
    denunciasService
      .getSeguimiento(id)
      .then((reporte) => {
        if (active) setState({ status: 'found', reporte })
      })
      .catch((err) => {
        if (!active) return
        const message = err instanceof Error ? err.message : 'Error al consultar el reporte'
        if (/no encontrad|not found|404/i.test(message)) {
          setState({ status: 'notFound' })
        } else {
          setState({ status: 'error', message })
        }
      })
    return () => {
      active = false
    }
  }, [id])

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      <main id="main-content" className="flex-1">
        <ReportHero category={t('searchPage.category')} title={t('reportDetail.detailTitle', { id: id ?? '' })} />

        <section className="mx-auto max-w-5xl px-6 py-10">
          {state.status === 'loading' && (
            <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
              Cargando reporte...
            </div>
          )}

          {(state.status === 'notFound' || state.status === 'error') && (
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h2 className="text-xl font-black text-primary">
                {state.status === 'notFound' ? 'Reporte no encontrado' : 'No se pudo cargar el reporte'}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {state.status === 'notFound'
                  ? 'El código consultado no existe o no está disponible.'
                  : state.message}
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
          )}

          {state.status === 'found' && <ReportDetail reporte={state.reporte} />}
        </section>
      </main>
      <Footer />
    </div>
  )
}

function ReportDetail({ reporte }: Readonly<{ reporte: DenunciaSeguimiento }>) {
  const { t } = useTranslation()
  const fecha = new Date(reporte.Fecha_denuncia).toLocaleDateString('es-DO')
  const fechaIncidente = reporte.fecha_incidente
    ? new Date(reporte.fecha_incidente).toLocaleDateString('es-DO')
    : null

  // Construye la línea de tiempo a partir del historial; si está vacío, muestra
  // el estado actual como único hito.
  const timeline = reporte.historial_estado_denuncia.length
    ? reporte.historial_estado_denuncia.map((h) => ({
        key: h.id,
        estado: h.estado_nuevo,
        fecha: new Date(h.created_at).toLocaleDateString('es-DO'),
        comentario: h.comentario,
      }))
    : [{ key: 'actual', estado: reporte.Estado, fecha, comentario: null }]

  const acciones = reporte.acciones ?? []

  return (
    <div className="flex flex-col gap-6">
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <article className="rounded-2xl bg-white p-7 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-black text-primary">Resumen del caso</h2>
          <span className="text-sm font-semibold text-gray-400">{reporte.codigo_seguimiento}</span>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">{reporte.Descripcion}</p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Fecha de reporte</dt>
            <dd className="mt-1 text-sm font-semibold text-gray-700">{fecha}</dd>
          </div>
          {fechaIncidente && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Fecha del incidente</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-700">{fechaIncidente}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Ubicación</dt>
            <dd className="mt-1 text-sm font-semibold text-gray-700">{reporte.detalle_ubicacion || 'No especificada'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Tipo</dt>
            <dd className="mt-1 text-sm font-semibold text-gray-700">{TIPO_LABEL[reporte.tipo_actividad] ?? reporte.tipo_actividad}</dd>
          </div>
          {reporte.nivel_urgencia && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Nivel de urgencia</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-700">{reporte.nivel_urgencia}</dd>
            </div>
          )}
        </dl>
      </article>

      <aside className="rounded-2xl bg-white p-7 shadow-sm">
        <h3 className="text-lg font-black text-primary">Estado actual</h3>
        <p className="mt-3">
          <StatusBadge status={reporte.Estado} />
        </p>

        <h4 className="mt-6 text-xs font-semibold uppercase tracking-wide text-gray-400">Progreso</h4>
        <ul className="mt-3 space-y-2">
          {timeline.map((step) => (
            <li key={step.key} className="rounded-lg bg-surface px-3 py-2 text-sm text-gray-700">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{ESTADO_LABEL[step.estado] ?? step.estado}</span>
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
          Volver al listado
        </Link>
      </aside>
    </div>

      {/* Acciones correctivas publicadas (RF-5.2) */}
      {acciones.length > 0 && (
        <article className="rounded-2xl bg-white p-7 shadow-sm">
          <h2 className="text-xl font-black text-primary">{t('reportDetail.accionesTitle')}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('reportDetail.accionesDesc')}
          </p>
          <ul className="mt-5 space-y-3">
            {acciones.map((a) => {
              const fecha = a.FechaImplementacion ?? a.FechaPlanificacion
              return (
                <li key={a.IDAccion} className="rounded-xl border border-gray-100 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-gray-800">{a.titulo}</h3>
                    <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-gray-600">
                      {t('estados.' + a.Estado)}
                    </span>
                  </div>
                  {a.resumen_publico && (
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{a.resumen_publico}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-gray-400">
                      {fecha ? t('reportDetail.executionDate', { date: new Date(fecha).toLocaleDateString('es-DO') }) : t('reportDetail.dateTbd')}
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
