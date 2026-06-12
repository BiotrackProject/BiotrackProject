import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, Download, ChevronLeft, ChevronRight, ListFilter, Map } from 'lucide-react'
import { toast } from '../../utils/toast'
import BackofficeTopbar from '../../components/backoffice/BackofficeTopbar'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { monitoreoService } from '../../services/monitoreoService'
import { STATUS_STYLES } from '../../data/mockDenuncias'

const MONITOREO_ESTADOS = ['Monitorear', 'En Monitoreo', 'En Corrección', 'Declinada']
const PAGE_SIZE_OPTIONS = [5, 10, 20]

function exportCSV(data) {
  const headers = ['ID', 'Descripción', 'Provincia', 'Fecha', 'Estado']
  const rows = data.map((d) => [d.id, d.descripcionCompleta, d.provincia, d.fecha, d.estado])
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'monitoreos.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function MonitoreoPage() {
  const navigate = useNavigate()
  const [denuncias, setDenuncias] = useState([])
  const [loading, setLoading]     = useState(true)
  const [query, setQuery]         = useState('')
  const [filterOpen, setFilterOpen]     = useState(false)
  const [filterEstado, setFilterEstado] = useState('')
  const [page, setPage]       = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    monitoreoService.getDenuncias()
      .then(setDenuncias)
      .catch(() => toast.error('Error al cargar los registros de monitoreo'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return denuncias.filter((d) => {
      const matchQ = !q || d.id.includes(q) || d.descripcion.toLowerCase().includes(q) || d.provincia.toLowerCase().includes(q)
      const matchE = !filterEstado || d.estado === filterEstado
      return matchQ && matchE
    })
  }, [denuncias, query, filterEstado])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <>
      <BackofficeTopbar
        title="Monitoreo de Zonas"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/mapa')}
              className="flex items-center gap-1.5 rounded-lg bg-primary/10 text-primary px-3 py-2 text-xs font-semibold transition-colors hover:bg-primary/20 sm:px-4 sm:text-sm"
            >
              <Map className="h-4 w-4" />
              Ver mapa
            </button>
            <button
              onClick={() => exportCSV(filtered)}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500 px-3 py-2 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 sm:px-4 sm:text-sm"
            >
              <Download className="h-4 w-4" />
              Exportar
            </button>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8">
        {loading ? <LoadingSpinner fullPage /> : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Search bar */}
          <div data-tour="backoffice-monitoreo-toolbar" className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="relative w-full sm:flex-1 sm:max-w-md">
              <input
                type="text"
                aria-label="Buscar monitoreo"
                placeholder="Buscar denuncia..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1) }}
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-4 pr-10 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <div className="relative">
              <button
                onClick={() => setFilterOpen((v) => !v)}
                aria-label="Filtrar monitoreo por estado"
                aria-expanded={filterOpen}
                className={`flex items-center justify-center h-10 w-10 rounded-xl border transition-colors ${filterOpen || filterEstado ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
              {filterOpen && (
                <div className="absolute top-12 left-0 z-20 w-48 rounded-xl border border-gray-100 bg-white shadow-lg p-2">
                  <p className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Estado</p>
                  {['', ...MONITOREO_ESTADOS].map((e) => (
                    <button
                      key={e}
                      onClick={() => { setFilterEstado(e); setFilterOpen(false); setPage(1) }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filterEstado === e ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {e || 'Todos'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile list */}
          <div data-tour="backoffice-monitoreo-list" className="divide-y divide-gray-100 lg:hidden">
            {paginated.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-gray-400">No se encontraron registros.</div>
            ) : (
              paginated.map((d) => (
                <article key={d.id} className="space-y-3 px-4 py-4 sm:px-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-primary">#{d.id}</p>
                      <p className="mt-1 text-sm text-dark/85">{d.descripcion}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[d.estado] ?? STATUS_STYLES['Declinada']}`}>
                      {d.estado}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{d.provincia}</span>
                    <span>{d.fecha}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/monitoreo/${d.id}`)}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                  >
                    Ver monitoreo <ListFilter className="h-3.5 w-3.5" />
                  </button>
                </article>
              ))
            )}
          </div>

          {/* Desktop table */}
          <div data-tour="backoffice-monitoreo-list" className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-[#F0F2F5]">
              <tr>
                {['Número de\nla denuncia', 'Descripción\nde actividad', 'Provincia', 'Fecha de\nincidente', 'Estado de la\nDenuncia', 'Acciones'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 whitespace-pre-line">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">No se encontraron registros.</td></tr>
              ) : paginated.map((d) => (
                <tr key={d.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-5 py-4 font-bold text-primary">{d.id}</td>
                  <td className="px-5 py-4 text-primary/80 max-w-[200px]">
                    <p className="truncate">{d.descripcion}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{d.provincia}</td>
                  <td className="px-5 py-4 text-gray-600">{d.fecha}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[d.estado] ?? STATUS_STYLES['Declinada']}`}>
                      {d.estado}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => navigate(`/admin/monitoreo/${d.id}`)}
                      className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <ListFilter className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div data-tour="backoffice-monitoreo-pagination" className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-4 sm:px-5">
            <p className="order-2 w-full text-xs text-gray-400 sm:order-1 sm:w-auto">
              Mostrando {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} a {Math.min(page * pageSize, filtered.length)} de {filtered.length} entradas
            </p>
            <div className="order-1 flex items-center gap-1 sm:order-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setPage(n)} className={`h-8 w-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${n === page ? 'bg-primary text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{n}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="order-3 flex items-center gap-2 text-xs text-gray-500">
              Registros por página
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }} className="rounded-lg border border-gray-200 px-2 py-1 text-xs outline-none focus:border-primary">
                {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
        </div>
        )}
      </main>
    </>
  )
}
