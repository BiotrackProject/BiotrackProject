import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, Download, ChevronLeft, ChevronRight, ListFilter, Map } from 'lucide-react'
import { toast } from '../../utils/toast'
import BackofficeTopbar from '../../components/backoffice/BackofficeTopbar'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { monitoreoService } from '../../services/monitoreoService'
import { ESTADO_STYLES } from '../../services/denunciasService'
import type { Denuncia, EstadoDenuncia } from '../../services/denunciasService'
import { descargarBlob } from '../../utils/download'
import { formatDate } from '../../utils/dates'

const MONITOREO_ESTADOS: EstadoDenuncia[] = ['Pendiente', 'En_Investigacion', 'Verificada']
const PAGE_SIZE_OPTIONS = [5, 10, 20]

function exportCSV(data: Denuncia[], headers: string[]) {
  const rows = data.map((d) => [
    d.codigo_seguimiento,
    `"${d.Descripcion.replace(/"/g, "'")}"`,
    d.tipo_actividad,
    formatDate(d.Fecha_denuncia),
    d.Estado,
  ])
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
  descargarBlob(new Blob([csv], { type: 'text/csv' }), 'monitoreos.csv')
}

export default function MonitoreoPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [denuncias, setDenuncias] = useState<Denuncia[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterEstado, setFilterEstado] = useState<EstadoDenuncia | ''>('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    monitoreoService.getDenuncias()
      .then(setDenuncias)
      .catch(() => toast.error(t('monitoreo.loadError')))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return denuncias.filter((d) => {
      const matchQ = !q || d.codigo_seguimiento.toLowerCase().includes(q) || d.Descripcion.toLowerCase().includes(q)
      const matchE = !filterEstado || d.Estado === filterEstado
      return matchQ && matchE
    })
  }, [denuncias, query, filterEstado])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <>
      <BackofficeTopbar
        title={t('monitoreo.title')}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/mapa')}
              className="flex items-center gap-1.5 rounded-lg bg-primary/10 text-primary px-3 py-2 text-xs font-semibold transition-colors hover:bg-primary/20 sm:px-4 sm:text-sm"
            >
              <Map className="h-4 w-4" />
              {t('denuncias.viewMap')}
            </button>
            <button
              onClick={() => exportCSV(filtered, [t('monitoreo.colCode'), t('monitoreo.colDescription'), t('monitoreo.colType'), t('monitoreo.colDate'), t('monitoreo.colStatus')])}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500 px-3 py-2 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 sm:px-4 sm:text-sm"
            >
              <Download className="h-4 w-4" />
              {t('common.export')}
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
                aria-label={t('monitoreo.searchLabel')}
                placeholder={t('monitoreo.searchPlaceholder')}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1) }}
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-4 pr-10 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <div className="relative">
              <button
                onClick={() => setFilterOpen((v) => !v)}
                aria-label={t('monitoreo.filterLabel')}
                aria-expanded={filterOpen}
                className={`flex items-center justify-center h-10 w-10 rounded-xl border transition-colors ${filterOpen || filterEstado ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
              {filterOpen && (
                <div className="absolute top-12 left-0 z-20 w-48 rounded-xl border border-gray-100 bg-white shadow-lg p-2">
                  <p className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">{t('denuncias.filterTitle')}</p>
                  {(['', ...MONITOREO_ESTADOS] as Array<EstadoDenuncia | ''>).map((e) => (
                    <button
                      key={e}
                      onClick={() => { setFilterEstado(e); setFilterOpen(false); setPage(1) }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filterEstado === e ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {e ? t(`estados.${e}`) : t('denuncias.filterAll')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile list */}
          <div data-tour="backoffice-monitoreo-list" className="divide-y divide-gray-100 lg:hidden">
            {paginated.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-gray-400">{t('monitoreo.noResults')}</div>
            ) : (
              paginated.map((d) => (
                <article key={d.IDDenuncia} className="space-y-3 px-4 py-4 sm:px-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-primary">{d.codigo_seguimiento}</p>
                      <p className="mt-1 text-sm text-dark/85">{d.Descripcion}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${ESTADO_STYLES[d.Estado]}`}>
                      {t(`estados.${d.Estado}`)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{d.tipo_actividad.replace(/_/g, ' ')}</span>
                    <span>{formatDate(d.Fecha_denuncia)}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/monitoreo/${d.IDDenuncia}`)}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                  >
                    {t('monitoreo.viewMonitoreo')} <ListFilter className="h-3.5 w-3.5" />
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
                  {[t('denuncias.colCode'), t('denuncias.colDescription'), t('denuncias.colType'), t('denuncias.colDate'), t('denuncias.colStatus'), t('denuncias.colActions')].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 whitespace-pre-line">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">{t('monitoreo.noResults')}</td></tr>
                ) : paginated.map((d) => (
                  <tr key={d.IDDenuncia} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-4 font-bold text-primary">{d.codigo_seguimiento}</td>
                    <td className="px-5 py-4 text-primary/80 max-w-[200px]">
                      <p className="truncate">{d.Descripcion}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-xs">{d.tipo_actividad.replace(/_/g, ' ')}</td>
                    <td className="px-5 py-4 text-gray-600">{formatDate(d.Fecha_denuncia)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ESTADO_STYLES[d.Estado]}`}>
                        {t(`estados.${d.Estado}`)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => navigate(`/admin/monitoreo/${d.IDDenuncia}`)}
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
              {t('denuncias.showing', { from: filtered.length === 0 ? 0 : (page - 1) * pageSize + 1, to: Math.min(page * pageSize, filtered.length), total: filtered.length })}
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
              {t('denuncias.perPage')}
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
