import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ReportHero from '../components/report/ReportHero'
import RecursoPublicoFallback from '../components/report/RecursoPublicoFallback'
import { useRecursoPublico } from '../hooks/useRecursoPublico'
import {
  accionesService,
  type AccionPublica,
} from '../services/accionesService'

const dtClass = 'text-xs font-semibold uppercase tracking-wide text-gray-400'
const ddClass = 'mt-1 text-sm font-semibold text-gray-700'

function fmt(fecha: string | null, fallback: string): string {
  return fecha ? new Date(fecha).toLocaleDateString('es-DO') : fallback
}

export default function ReporteAccionPublicoPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const state = useRecursoPublico(id, (accionId) => accionesService.getPublica(accionId), t('publicAccion.fetchError'))

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      <main id="main-content" className="flex-1">
        <ReportHero category={t('publicAccion.heroCategory')} title={t('publicAccion.heroTitle')} />

        <section className="mx-auto max-w-4xl px-6 py-10">
          {state.status === 'found' ? (
            <DetalleAccion accion={state.data} />
          ) : (
            <RecursoPublicoFallback
              state={state}
              loadingText={t('publicAccion.loading')}
              notFoundTitle={t('publicAccion.notFoundTitle')}
              notFoundDesc={t('publicAccion.notFoundDesc')}
              errorTitle={t('publicAccion.errorTitle')}
              actions={
                <Link to="/" className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
                  {t('publicAccion.backHome')}
                </Link>
              }
            />
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}

function DetalleAccion({ accion }: Readonly<{ accion: AccionPublica }>) {
  const { t } = useTranslation()
  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <article className="rounded-2xl bg-white p-7 shadow-sm">
        <h2 className="text-xl font-black text-primary">{accion.titulo}</h2>
        {accion.resumen_publico && (
          <p className="mt-4 text-sm leading-relaxed text-gray-700">{accion.resumen_publico}</p>
        )}

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className={dtClass}>{t('publicAccion.statusLabel')}</dt>
            <dd className={ddClass}>{t(`estados.${accion.Estado}`)}</dd>
          </div>
          <div>
            <dt className={dtClass}>{t('publicAccion.executionDate')}</dt>
            <dd className={ddClass}>
              {fmt(accion.FechaImplementacion ?? accion.FechaPlanificacion, t('publicAccion.notSpecified'))}
            </dd>
          </div>
          {accion.institucion && (
            <div>
              <dt className={dtClass}>{t('publicAccion.institution')}</dt>
              <dd className={ddClass}>{accion.institucion}</dd>
            </div>
          )}
        </dl>
      </article>

      <aside className="rounded-2xl bg-white p-7 shadow-sm">
        <h3 className="text-lg font-black text-primary">{t('publicAccion.links')}</h3>

        <h4 className={`mt-4 ${dtClass}`}>{t('publicAccion.complaints')}</h4>
        {accion.denuncias.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">{t('publicAccion.none')}</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {accion.denuncias.map((d) => (
              <li key={d.codigo_seguimiento} className="rounded-lg bg-surface px-3 py-2 text-sm text-gray-700">
                <span className="font-semibold">{d.codigo_seguimiento}</span>
                <span className="text-xs text-gray-400"> · {t(`tipos.${d.tipo_actividad}`)}</span>
              </li>
            ))}
          </ul>
        )}

        <h4 className={`mt-5 ${dtClass}`}>{t('publicAccion.zones')}</h4>
        <p className="mt-2 text-sm text-gray-500">
          {accion.zonas.length ? t('publicAccion.zonesLinked', { count: accion.zonas.length }) : t('publicAccion.none')}
        </p>
      </aside>
    </div>
  )
}
