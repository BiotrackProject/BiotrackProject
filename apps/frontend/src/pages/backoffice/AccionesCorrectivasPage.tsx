// @ts-nocheck
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  Search, SlidersHorizontal, Download, Plus,
  ChevronLeft, ChevronRight, Eye, CheckCircle,
} from 'lucide-react'
import BackofficeTopbar from '../../components/backoffice/BackofficeTopbar'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { accionesService, ESTADOS_ACCION, ESTADO_ACCION_STYLES } from '../../services/accionesService'
import type { Accion, EstadoAccion } from '../../services/accionesService'
import { toast } from '../../utils/toast'
import { descargarBlob } from '../../utils/download'

const PAGE_SIZE_OPTIONS = [5, 10, 20]
const COLUMN_KEYS = ['colId', 'colTitle', 'colPlannedDate', 'colStatus', 'colResponsible', 'colActions']

function exportCSV(data: Accion[], headers: string[]) {
  const rows = data.map((a) => [
    a.IDAccion,
    `"${(a.titulo ?? '').replace(/"/g, "'")}"`,
    a.Estado,
    a.FechaPlanificacion ? new Date(a.FechaPlanificacion).toLocaleDateString('es-DO') : '—',
    a.responsable?.nombre_completo ?? '—',
  ])
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
  descargarBlob(new Blob([csv], { type: 'text/csv' }), 'acciones-correctivas.csv')
}

export default function AccionesCorrectivasPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [acciones, setAcciones] = useState<Accion[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterEstado, setFilterEstado] = useState<EstadoAccion | ''>('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [statusModal, setStatusModal] = useState<{ open: boolean; accion: Accion | null }>({ open: false, accion: null })
  const [nuevoEstado, setNuevoEstado] = useState<EstadoAccion>('Planificada')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    accionesService.getAll()
      .then((res) => setAcciones(res.data))
      .catch(() => toast.error(t('acciones.loadError')))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return acciones.filter((a) => {
      const matchQ = !q || a.IDAccion.toLowerCase().includes(q) || (a.titulo ?? '').toLowerCase().includes(q)
      const matchE = !filterEstado || a.Estado === filterEstado
      return matchQ && matchE
    })
  }, [acciones, query, filterEstado])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  function openStatusModal(accion: Accion) {
    setNuevoEstado(accion.Estado)
    setStatusModal({ open: true, accion })
  }

  async function handleSaveEstado() {
    setSaving(true)
    try {
      const updated = await accionesService.cambiarEstado(statusModal.accion!.IDAccion, nuevoEstado)
      setAcciones((prev) => prev.map((a) => (a.IDAccion === updated.IDAccion ? updated : a)))
      toast.success(t('acciones.statusUpdated', { status: t(`estados.${nuevoEstado}`) }))
      setStatusModal({ open: false, accion: null })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('acciones.statusUpdateError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <BackofficeTopbar
        title={t('acciones.title')}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/acciones/nueva')}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary/90 sm:px-4 sm:text-sm"
            >
              <Plus className="h-4 w-4" />
              {t('acciones.new')}
            </button>
            <button
              onClick={() => exportCSV(filtered, [t('acciones.exportIdLabel'), t('acciones.exportTitleLabel'), t('acciones.exportStatusLabel'), t('acciones.exportDateLabel'), t('acciones.exportResponsibleLabel')])}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500 px-3 py-2 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 sm:px-4 sm:text-sm"
            >
              <Download className="h-4 w-4" />
              {t('common.export')}
            </button>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Search + filter */}
          <div data-tour="backoffice-acciones-toolbar" className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="relative w-full sm:flex-1 sm:max-w-md">
              <input
                type="text"
                aria-label={t('acciones.searchLabel')}
                placeholder={t('acciones.searchPlaceholder')}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1) }}
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-4 pr-10 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <button
                onClick={() => setFilterOpen((v) => !v)}
                aria-expanded={filterOpen}
                className={`flex items-center justify-center h-10 w-10 rounded-xl border transition-colors ${filterOpen || filterEstado ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
              {filterOpen && (
                <div className="absolute top-12 left-0 z-20 w-48 rounded-xl border border-gray-100 bg-white shadow-lg p-2">
                  <p className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">{t('denuncias.filterTitle')}</p>
                  {(['', ...ESTADOS_ACCION] as Array<EstadoAccion | ''>).map((e) => (
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

          {loading ? (
            <LoadingSpinner fullPage />
          ) : (
            <>
              {/* Mobile list */}
              <div data-tour="backoffice-acciones-list" className="divide-y divide-gray-100 lg:hidden">
                {paginated.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-gray-400">{t('acciones.noResults')}</div>
                ) : (
                  paginated.map((a) => (
                    <article key={a.IDAccion} className="space-y-3 px-4 py-4 sm:px-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-primary">#{a.IDAccion.slice(-8)}</p>
                          <p className="mt-1 text-sm text-dark/85">{a.titulo}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${ESTADO_ACCION_STYLES[a.Estado]}`}>
                          {t(`estados.${a.Estado}`)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => navigate(`/admin/acciones/${a.IDAccion}`)} className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20">{t('common.viewDetail')}</button>
                        <button onClick={() => openStatusModal(a)} className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">{t('acciones.changeStatus')}</button>
                      </div>
                    </article>
                  ))
                )}
              </div>

              {/* Desktop table */}
              <div data-tour="backoffice-acciones-list" className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[860px] text-sm">
                  <thead className="bg-[#F0F2F5]">
                    <tr>
                      {COLUMN_KEYS.map((k) => (
                        <th key={k} className="px-5 py-3 text-left text-xs font-semibold text-gray-500">{t('acciones.' + k)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginated.length === 0 ? (
                      <tr><td colSpan={6}><EmptyState title={t('acciones.emptyTitle')} description={t('acciones.emptyDesc')} /></td></tr>
                    ) : (
                      paginated.map((a) => (
                        <tr key={a.IDAccion} className="hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => navigate(`/admin/acciones/${a.IDAccion}`)}>
                          <td className="px-5 py-4 font-bold text-primary font-mono text-xs">{a.IDAccion.slice(-8)}</td>
                          <td className="px-5 py-4 text-primary/80 max-w-[240px]">
                            <p className="truncate">{a.titulo}</p>
                          </td>
                          <td className="px-5 py-4 text-gray-600">
                            {a.FechaPlanificacion ? new Date(a.FechaPlanificacion).toLocaleDateString('es-DO') : '—'}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ESTADO_ACCION_STYLES[a.Estado]}`}>
                              {t(`estados.${a.Estado}`)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-gray-600">{a.responsable?.nombre_completo ?? '—'}</td>
                          <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5">
                              <button title={t('common.viewDetail')} onClick={() => navigate(`/admin/acciones/${a.IDAccion}`)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button title={t('acciones.changeStatus')} onClick={() => openStatusModal(a)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                                <CheckCircle className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <div data-tour="backoffice-acciones-pagination" className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-4 sm:px-5">
              <p className="order-2 w-full text-xs text-gray-400 sm:order-1 sm:w-auto">
                {t('denuncias.showing', { from: (page - 1) * pageSize + 1, to: Math.min(page * pageSize, filtered.length), total: filtered.length })}
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
          )}
        </div>
      </main>

      {/* Status change modal */}
      <Modal
        open={statusModal.open}
        onClose={() => setStatusModal({ open: false, accion: null })}
        title={t('acciones.changeStatusTitle')}
        confirmLabel={t('acciones.changeStatusSave')}
        onConfirm={handleSaveEstado}
        loading={saving}
      >
        {statusModal.accion && (
          <div className="flex flex-col gap-4">
            <p>{t('acciones.changeStatusMsg', { title: statusModal.accion.titulo })}</p>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">{t('acciones.newStatusLabel')}</label>
              <select
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value as EstadoAccion)}
                className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              >
                {ESTADOS_ACCION.map((e) => (
                  <option key={e} value={e}>{t(`estados.${e}`)}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
