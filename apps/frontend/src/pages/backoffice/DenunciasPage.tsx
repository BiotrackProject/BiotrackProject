import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Download, ChevronRight, Map } from 'lucide-react'
import BackofficeTopbar from '../../components/backoffice/BackofficeTopbar'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import StatusFilterDropdown from '../../components/backoffice/StatusFilterDropdown'
import PaginationBar from '../../components/backoffice/PaginationBar'
import { denunciasService, ESTADOS_DENUNCIA, ESTADO_STYLES } from '../../services/denunciasService'
import type { Denuncia, EstadoDenuncia } from '../../services/denunciasService'
import { toast } from '../../utils/toast'
import { formatDate } from '../../utils/dates'
import { exportDenunciaCSV } from '../../utils/csv'
import { useDebounce } from '../../hooks/useDebounce'
import { useQuery } from '@tanstack/react-query'

// Debe coincidir con POR_PAGINA_PERMITIDOS del backend (shared/utils/pagination.ts);
// un valor no permitido hace que el backend caiga a 25 y rompe la paginación.
const PAGE_SIZE_OPTIONS = [10, 25, 50]

export default function DenunciasPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterEstado, setFilterEstado] = useState<EstadoDenuncia | ''>('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { isPending, isError, data } = useQuery({
    queryKey: ['denuncias', { q: debouncedQuery, estado: filterEstado, page, pageSize }],
    queryFn: () =>
      denunciasService.getAll({
        q: debouncedQuery || undefined,
        estado: filterEstado || undefined,
        pagina: page,
        por_pagina: pageSize,
      }),
  })

  useEffect(() => {
    if (isError) toast.error(t('denuncias.loadError'))
  }, [isError])

  const denuncias: Denuncia[] = data?.data ?? []
  const total = data?.paginacion?.total ?? 0
  const loading = isPending
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  function handleFilterSelect(estado: EstadoDenuncia | '') {
    setFilterEstado(estado)
    setFilterOpen(false)
    setPage(1)
  }

  return (
    <>
      <BackofficeTopbar
        title={t('denuncias.title')}
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
              onClick={() => navigate('/admin/denuncias/nueva')}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary/90 sm:px-4 sm:text-sm"
            >
              <Plus className="h-4 w-4" />
              {t('denuncias.newDenuncia')}
            </button>
            <button
              onClick={() => exportDenunciaCSV(denuncias, [t('denuncias.exportCode'), t('denuncias.exportDescription'), t('denuncias.exportType'), t('denuncias.exportDate'), t('denuncias.exportStatus')], 'denuncias.csv')}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500 px-3 py-2 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 sm:px-4 sm:text-sm"
            >
              <Download className="h-4 w-4" />
              {t('denuncias.export')}
            </button>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Search bar */}
          <div data-tour="backoffice-denuncias-toolbar" className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="relative w-full sm:flex-1 sm:max-w-md">
              <input
                type="text"
                aria-label={t('denuncias.searchLabel')}
                placeholder={t('denuncias.searchPlaceholder')}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1) }}
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-4 pr-10 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <StatusFilterDropdown
              estados={ESTADOS_DENUNCIA}
              filterEstado={filterEstado}
              filterOpen={filterOpen}
              filterLabel={t('denuncias.filterLabel')}
              filterTitle={t('denuncias.filterTitle')}
              filterAll={t('denuncias.filterAll')}
              onToggle={() => setFilterOpen((v) => !v)}
              onSelect={handleFilterSelect}
            />
          </div>

          {loading ? (
            <LoadingSpinner fullPage />
          ) : (
            <>
              {/* Mobile list */}
              <div data-tour="backoffice-denuncias-list" className="divide-y divide-gray-100 lg:hidden">
                {denuncias.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-gray-400">{t('denuncias.noResults')}</div>
                ) : (
                  denuncias.map((d) => (
                    <article key={d.IDDenuncia} className="space-y-3 px-4 py-4 sm:px-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-primary">{d.codigo_seguimiento}</p>
                          <p className="mt-1 text-sm text-dark/85 line-clamp-2">{d.Descripcion}</p>
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
                        onClick={() => navigate(`/admin/denuncias/${d.IDDenuncia}`)}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80"
                      >
                        {t('denuncias.viewDetail')} <ChevronRight className="h-4 w-4" />
                      </button>
                    </article>
                  ))
                )}
              </div>

              {/* Desktop table */}
              <div data-tour="backoffice-denuncias-list" className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[860px] text-sm">
                  <thead className="bg-[#F0F2F5]">
                    <tr>
                      {[t('denuncias.colCode'), t('denuncias.colDescription'), t('denuncias.colType'), t('denuncias.colDate'), t('denuncias.colStatus'), t('denuncias.colActions')].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 whitespace-pre-line">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {denuncias.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">{t('denuncias.noResults')}</td>
                      </tr>
                    ) : (
                      denuncias.map((d) => (
                        <tr key={d.IDDenuncia} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-5 py-4 font-bold text-primary">{d.codigo_seguimiento}</td>
                          <td className="px-5 py-4 text-primary/80 max-w-[220px] truncate">{d.Descripcion}</td>
                          <td className="px-5 py-4 text-gray-600 text-xs">{d.tipo_actividad.replace(/_/g, ' ')}</td>
                          <td className="px-5 py-4 text-gray-600">{formatDate(d.Fecha_denuncia)}</td>
                          <td className="px-5 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ESTADO_STYLES[d.Estado]}`}>
                              {t(`estados.${d.Estado}`)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => navigate(`/admin/denuncias/${d.IDDenuncia}`)}
                              className="text-primary hover:text-primary/70 transition-colors"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <PaginationBar
            dataTour="backoffice-denuncias-pagination"
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            from={total === 0 ? 0 : (page - 1) * pageSize + 1}
            to={Math.min(page * pageSize, total)}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
          />
        </div>
      </main>
    </>
  )
}
