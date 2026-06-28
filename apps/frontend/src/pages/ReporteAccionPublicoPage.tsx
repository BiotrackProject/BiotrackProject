import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ReportHero from '../components/report/ReportHero'
import {
  accionesService,
  ESTADO_ACCION_LABEL,
  type AccionPublica,
} from '../services/accionesService'

type FetchState =
  | { status: 'loading' }
  | { status: 'found'; accion: AccionPublica }
  | { status: 'notFound' }
  | { status: 'error'; message: string }

function fmt(fecha: string | null): string {
  return fecha ? new Date(fecha).toLocaleDateString('es-DO') : 'No especificada'
}

export default function ReporteAccionPublicoPage() {
  const { id } = useParams()
  const [state, setState] = useState<FetchState>(() => (id ? { status: 'loading' } : { status: 'notFound' }))

  useEffect(() => {
    if (!id) return
    let active = true
    accionesService
      .getPublica(id)
      .then((accion) => { if (active) setState({ status: 'found', accion }) })
      .catch((err) => {
        if (!active) return
        const message = err instanceof Error ? err.message : 'Error al consultar el reporte'
        if (/no disponible|no encontrad|not found|404/i.test(message)) {
          setState({ status: 'notFound' })
        } else {
          setState({ status: 'error', message })
        }
      })
    return () => { active = false }
  }, [id])

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      <main id="main-content" className="flex-1">
        <ReportHero category="Acción Correctiva" title="Reporte público de acción correctiva" />

        <section className="mx-auto max-w-4xl px-6 py-10">
          {state.status === 'loading' && (
            <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
              Cargando reporte...
            </div>
          )}

          {(state.status === 'notFound' || state.status === 'error') && (
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h2 className="text-xl font-black text-primary">
                {state.status === 'notFound' ? 'Reporte no disponible' : 'No se pudo cargar el reporte'}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {state.status === 'notFound'
                  ? 'El reporte no existe o no ha sido publicado.'
                  : state.message}
              </p>
              <Link to="/" className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
                Volver al inicio
              </Link>
            </div>
          )}

          {state.status === 'found' && <DetalleAccion accion={state.accion} />}
        </section>
      </main>
      <Footer />
    </div>
  )
}

function DetalleAccion({ accion }: Readonly<{ accion: AccionPublica }>) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <article className="rounded-2xl bg-white p-7 shadow-sm">
        <h2 className="text-xl font-black text-primary">{accion.titulo}</h2>
        {accion.resumen_publico && (
          <p className="mt-4 text-sm leading-relaxed text-gray-700">{accion.resumen_publico}</p>
        )}

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Estado</dt>
            <dd className="mt-1 text-sm font-semibold text-gray-700">{ESTADO_ACCION_LABEL[accion.Estado] ?? accion.Estado}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Fecha de ejecución</dt>
            <dd className="mt-1 text-sm font-semibold text-gray-700">
              {fmt(accion.FechaImplementacion ?? accion.FechaPlanificacion)}
            </dd>
          </div>
          {accion.institucion && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Institución</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-700">{accion.institucion}</dd>
            </div>
          )}
        </dl>
      </article>

      <aside className="rounded-2xl bg-white p-7 shadow-sm">
        <h3 className="text-lg font-black text-primary">Vínculos</h3>

        <h4 className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-400">Denuncias</h4>
        {accion.denuncias.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">Ninguna</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {accion.denuncias.map((d) => (
              <li key={d.codigo_seguimiento} className="rounded-lg bg-surface px-3 py-2 text-sm text-gray-700">
                <span className="font-semibold">{d.codigo_seguimiento}</span>
                <span className="text-xs text-gray-400"> · {d.tipo_actividad.replace(/_/g, ' ')}</span>
              </li>
            ))}
          </ul>
        )}

        <h4 className="mt-5 text-xs font-semibold uppercase tracking-wide text-gray-400">Zonas</h4>
        <p className="mt-2 text-sm text-gray-500">
          {accion.zonas.length ? `${accion.zonas.length} zona(s) vinculada(s)` : 'Ninguna'}
        </p>
      </aside>
    </div>
  )
}
