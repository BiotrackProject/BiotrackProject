import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import isotipoGris from '../../assets/images/isotipogris.png'
import { PUBLIC_REPORTS, PUBLIC_STATUS_STYLES } from '../../data/publicReports'

export default function ReportSearch() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''
  const initialStatus = searchParams.get('status') ?? 'Todos'
  const [query, setQuery] = useState(initialQuery)
  const [statusFilter, setStatusFilter] = useState(initialStatus)

  const statusOptions = useMemo(
    () => ['Todos', ...new Set(PUBLIC_REPORTS.map((r) => r.status))],
    [],
  )

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
    setStatusFilter(searchParams.get('status') ?? 'Todos')
  }, [searchParams])

  const results = useMemo(() => {
    const cleaned = query.trim().toLowerCase()
    return PUBLIC_REPORTS.filter((r) => {
      const matchesQuery =
        !cleaned ||
        r.id.toLowerCase().includes(cleaned) ||
        r.location.toLowerCase().includes(cleaned)
      const matchesStatus = statusFilter === 'Todos' || r.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [query, statusFilter])

  const statusCounters = useMemo(() => {
    return PUBLIC_REPORTS.reduce((acc, report) => {
      acc[report.status] = (acc[report.status] ?? 0) + 1
      return acc
    }, {})
  }, [])

  const hasFilters = Boolean(query.trim()) || statusFilter !== 'Todos'

  function syncParams(nextQuery, nextStatus) {
    const next = {}
    const cleanedQuery = nextQuery.trim()
    if (cleanedQuery) next.q = cleanedQuery
    if (nextStatus !== 'Todos') next.status = nextStatus
    setSearchParams(next)
  }

  function handleQueryChange(e) {
    const next = e.target.value
    setQuery(next)
    syncParams(next, statusFilter)
  }

  function handleStatusChange(nextStatus) {
    setStatusFilter(nextStatus)
    syncParams(query, nextStatus)
  }

  function clearFilters() {
    setQuery('')
    setStatusFilter('Todos')
    setSearchParams({})
  }

  const heading = query.trim() && results.length === 1
    ? `Reporte ${results[0].id}`
    : 'Reportes'

  return (
    <section aria-labelledby="report-search-heading" className="relative mx-auto max-w-6xl px-6 py-12 sm:py-14">
      <div className="pointer-events-none absolute bottom-10 right-4 flex items-center justify-center opacity-[0.14]">
        <img src={isotipoGris} alt="" className="w-48 sm:w-56" />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_8px_30px_-20px_rgba(17,24,39,0.35)] sm:p-6">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="report-search-heading" aria-live="polite" className="text-2xl font-black text-primary">{heading}</h2>
            <p className="mt-1 text-sm text-gray-500">
              Consulta estado, seguimiento y detalle de reportes ciudadanos.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
              {results.length} resultado{results.length === 1 ? '' : 's'}
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-600">
              Total disponible: {PUBLIC_REPORTS.length}
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <form
            role="search"
            aria-label="Buscar reportes por ID o ubicación"
            className="relative w-full max-w-md"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="report-search" className="sr-only">Buscar por ID o ubicación</label>
            <input
              id="report-search"
              type="text"
              placeholder="Buscar por ID o ubicacion"
              value={query}
              onChange={handleQueryChange}
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-4 pr-11 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition-shadow focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
              {query.trim() && (
                <button
                  type="button"
                  onClick={clearFilters}
                  aria-label="Limpiar filtros"
                  className="text-gray-400 transition-colors hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </form>

          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => {
              const isActive = statusFilter === status
              const count = status === 'Todos' ? PUBLIC_REPORTS.length : (statusCounters[status] ?? 0)
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusChange(status)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-primary/40 hover:text-primary'
                  }`}
                >
                  {status} ({count})
                </button>
              )
            })}

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100"
              >
                Restablecer
              </button>
            )}
          </div>
        </div>

        <div className="mt-6">
          {results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-surface px-4 py-9 text-center">
              <p className="text-sm font-medium text-gray-600">No se encontraron reportes con esos filtros.</p>
              <p className="mt-1 text-xs text-gray-500">Prueba con otro estado, ID o ubicacion relacionada.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-lg border border-primary px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  Limpiar filtros
                </button>
                <Link
                  to="/reporte/nuevo"
                  className="inline-flex rounded-lg bg-action px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                >
                  Crear nuevo reporte
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
              <table className="min-w-[860px] w-full text-sm">
                <caption className="sr-only">Listado de reportes filtrados por estado, ID o ubicación</caption>
                <thead className="bg-surface text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    {['ID', 'Fecha', 'Ubicacion', 'Tipo de reporte', 'Estado', 'Acciones'].map((h) => (
                      <th key={h} scope="col" className="px-4 py-3 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.map((r) => (
                    <tr key={r.id} className="transition-colors hover:bg-blue-50/40">
                      <td className="px-4 py-3 font-semibold text-primary">{r.id}</td>
                      <td className="px-4 py-3 text-gray-600">{r.date}</td>
                      <td className="px-4 py-3 text-gray-700">{r.location}</td>
                      <td className="px-4 py-3 text-gray-700">{r.type}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${PUBLIC_STATUS_STYLES[r.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/reportes/${r.id}`)}
                          aria-label={`Ver detalle del reporte ${r.id}`}
                          className="rounded px-2 py-1 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 hover:underline"
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      </section>
  )
}
