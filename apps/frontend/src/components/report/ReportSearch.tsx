import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Search, X, AlertCircle, FileSearch } from 'lucide-react'
import isotipoGris from '../../assets/images/isotipogris.png'
import StatusBadge from '../ui/StatusBadge'
import {
  denunciasService,
  TIPO_LABEL,
  type DenunciaSeguimiento,
} from '../../services/denunciasService'

// El resultado guarda el código al que pertenece para que el render pueda
// derivar el estado "cargando" comparándolo con el código actual de la URL,
// evitando setState síncronos dentro del effect.
type SearchResult =
  | { status: 'idle' }
  | { status: 'found'; codigo: string; reporte: DenunciaSeguimiento }
  | { status: 'notFound'; codigo: string }
  | { status: 'error'; codigo: string; message: string }

export default function ReportSearch() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryCodigo = (searchParams.get('codigo') ?? '').trim()
  const [codigo, setCodigo] = useState(queryCodigo)
  const [result, setResult] = useState<SearchResult>({ status: 'idle' })

  // La URL (?codigo=) es la fuente de verdad de la búsqueda: permite enlaces
  // compartibles y dispara la consulta al cargar o navegar.
  useEffect(() => {
    if (!queryCodigo) return
    let active = true
    denunciasService
      .getSeguimiento(queryCodigo)
      .then((reporte) => {
        if (active) setResult({ status: 'found', codigo: queryCodigo, reporte })
      })
      .catch((err) => {
        if (!active) return
        const message = err instanceof Error ? err.message : 'Error al consultar el reporte'
        if (/no encontrad|not found|404/i.test(message)) {
          setResult({ status: 'notFound', codigo: queryCodigo })
        } else {
          setResult({ status: 'error', codigo: queryCodigo, message })
        }
      })
    return () => {
      active = false
    }
  }, [queryCodigo])

  // Mientras la URL pide un código cuyo resultado aún no llega, mostramos carga.
  const loading = Boolean(queryCodigo) && (result.status === 'idle' || result.codigo !== queryCodigo)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const cleaned = codigo.trim()
    setSearchParams(cleaned ? { codigo: cleaned } : {})
  }

  function clearSearch() {
    setCodigo('')
    setSearchParams({})
    setResult({ status: 'idle' })
  }

  return (
    <section aria-labelledby="report-search-heading" className="relative mx-auto max-w-4xl px-6 py-12 sm:py-14">
      <div className="pointer-events-none absolute bottom-10 right-4 flex items-center justify-center opacity-[0.14]">
        <img src={isotipoGris} alt="" className="w-48 sm:w-56" />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_8px_30px_-20px_rgba(17,24,39,0.35)] sm:p-6">
        <div className="border-b border-gray-100 pb-5">
          <h2 id="report-search-heading" className="text-2xl font-black text-primary">Consultar un reporte</h2>
          <p className="mt-1 text-sm text-gray-500">
            Ingresa el <strong>código de seguimiento</strong> que recibiste al registrar tu denuncia
            para consultar su estado y progreso.
          </p>
        </div>

        <div className="mt-5">
          <form
            role="search"
            aria-label="Buscar reporte por código de seguimiento"
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={handleSubmit}
          >
            <div className="relative w-full">
              <label htmlFor="report-search" className="sr-only">Código de seguimiento</label>
              <input
                id="report-search"
                type="text"
                autoComplete="off"
                placeholder="Ej. AB53525"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-4 pr-10 text-sm uppercase tracking-wide text-gray-700 placeholder:normal-case placeholder:tracking-normal placeholder:text-gray-400 outline-none transition-shadow focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {codigo.trim() && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={!codigo.trim() || loading}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>
        </div>

        <div className="mt-6" aria-live="polite">
          {loading ? (
            <div className="rounded-xl border border-gray-100 bg-surface px-4 py-9 text-center text-sm text-gray-500">
              Consultando reporte...
            </div>
          ) : result.status === 'idle' ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-surface px-4 py-9 text-center">
              <FileSearch className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-3 text-sm font-medium text-gray-600">
                Escribe tu código de seguimiento para ver el estado de tu reporte.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                ¿Aún no tienes un reporte?{' '}
                <Link to="/reporte/nuevo" className="font-semibold text-primary hover:underline">
                  Crea uno nuevo
                </Link>
                .
              </p>
            </div>
          ) : result.status === 'notFound' ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-surface px-4 py-9 text-center">
              <p className="text-sm font-medium text-gray-600">
                No encontramos ningún reporte con el código <span className="font-bold text-gray-800">{result.codigo}</span>.
              </p>
              <p className="mt-1 text-xs text-gray-500">Verifica que el código sea correcto e inténtalo de nuevo.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={clearSearch}
                  className="rounded-lg border border-primary px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  Limpiar búsqueda
                </button>
                <Link
                  to="/reporte/nuevo"
                  className="inline-flex rounded-lg bg-action px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                >
                  Crear nuevo reporte
                </Link>
              </div>
            </div>
          ) : result.status === 'error' ? (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">No se pudo completar la consulta.</p>
                <p className="mt-0.5 text-red-600">{result.message}</p>
              </div>
            </div>
          ) : (
            <ResultCard reporte={result.reporte} onOpen={() => navigate(`/reportes/${result.reporte.codigo_seguimiento}`)} />
          )}
        </div>
      </div>
    </section>
  )
}

function ResultCard({ reporte, onOpen }: { reporte: DenunciaSeguimiento; onOpen: () => void }) {
  const fecha = new Date(reporte.Fecha_denuncia).toLocaleDateString('es-DO')
  return (
    <article className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Código de seguimiento</p>
          <p className="text-lg font-black text-primary">{reporte.codigo_seguimiento}</p>
        </div>
        <StatusBadge status={reporte.Estado} />
      </div>

      <dl className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Fecha de reporte</dt>
          <dd className="mt-1 text-sm font-semibold text-gray-700">{fecha}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Tipo</dt>
          <dd className="mt-1 text-sm font-semibold text-gray-700">{TIPO_LABEL[reporte.tipo_actividad] ?? reporte.tipo_actividad}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Ubicación</dt>
          <dd className="mt-1 text-sm font-semibold text-gray-700">{reporte.detalle_ubicacion || 'No especificada'}</dd>
        </div>
      </dl>

      <p className="mt-4 line-clamp-2 text-sm text-gray-600">{reporte.Descripcion}</p>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          Ver detalle completo
        </button>
      </div>
    </article>
  )
}
