import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, SlidersHorizontal, Download,
  ChevronLeft, ChevronRight, Eye, CheckCircle, Clock,
} from 'lucide-react'
import BackofficeTopbar from '../../components/backoffice/BackofficeTopbar'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { accionesService } from '../../services/accionesService'
import { ACCION_ESTADOS } from '../../constants/statuses'
import { toast } from '../../utils/toast'

const PAGE_SIZE_OPTIONS = [5, 10, 20]

const COLUMNS = [
  'Número de\nla denuncia',
  'Descripción\nde actividad',
  'Provincia',
  'Fecha de\nincidente',
  'Estado de la\nAcción',
  'Acciones',
]

function exportCSV(data) {
  const headers = ['ID', 'Denuncia', 'Descripción', 'Provincia', 'Fecha Incidente', 'Fecha Acción', 'Estado', 'Responsable']
  const rows = data.map((a) => [a.id, a.denunciaId, a.descripcionCompleta, a.provincia, a.fechaIncidente, a.fechaAccion ?? '—', a.estado, a.responsable])
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'acciones-correctivas.csv'; a.click()
  URL.revokeObjectURL(url)
}

function ActionBtn({ icon: Icon, title, color, onClick, disabled }) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${color}`}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  )
}

export default function AccionesCorrectivasPage() {
  const navigate = useNavigate()

  const [acciones, setAcciones]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [query, setQuery]               = useState('')
  const [filterOpen, setFilterOpen]     = useState(false)
  const [filterEstado, setFilterEstado] = useState('')
  const [page, setPage]                 = useState(1)
  const [pageSize, setPageSize]         = useState(10)

  // Status change modal
  const [statusModal, setStatusModal]     = useState({ open: false, accion: null })
  const [nuevoEstado, setNuevoEstado]     = useState('')
  const [saving, setSaving]               = useState(false)

  useEffect(() => {
    accionesService.getAll()
      .then(setAcciones)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return acciones.filter((a) => {
      const matchQ = !q || a.id.includes(q) || a.descripcion.toLowerCase().includes(q) || a.provincia.toLowerCase().includes(q)
      const matchE = !filterEstado || a.estado === filterEstado
      return matchQ && matchE
    })
  }, [acciones, query, filterEstado])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize)

  function openStatusModal(accion) {
    setNuevoEstado(accion.estado)
    setStatusModal({ open: true, accion })
  }

  async function handleSaveEstado() {
    setSaving(true)
    const updated = await accionesService.updateEstado(statusModal.accion.id, nuevoEstado)
    setAcciones((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
    setSaving(false)
    setStatusModal({ open: false, accion: null })
    toast.success(`Estado actualizado a "${nuevoEstado}"`)

  }

  return (
    <>
      <BackofficeTopbar
        title="Acciones Correctivas"
        actions={
          <button
            onClick={() => exportCSV(filtered)}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500 px-3 py-2 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 sm:px-4 sm:text-sm"
          >
            <Download className="h-4 w-4" />
            Exportar
          </button>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

          {/* Search + filter */}
          <div data-tour="backoffice-acciones-toolbar" className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="relative w-full sm:flex-1 sm:max-w-md">
              <input
                type="text"
                aria-label="Buscar acción correctiva"
                placeholder="Buscar denuncia..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1) }}
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-4 pr-10 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <button
                onClick={() => setFilterOpen((v) => !v)}
                aria-label="Filtrar acciones por estado"
                aria-expanded={filterOpen}
                className={`flex items-center justify-center h-10 w-10 rounded-xl border transition-colors ${filterOpen || filterEstado ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
              {filterOpen && (
                <div className="absolute top-12 left-0 z-20 w-48 rounded-xl border border-gray-100 bg-white shadow-lg p-2">
                  <p className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Estado</p>
                  {['', ...ACCION_ESTADOS].map((e) => (
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

          {/* Table */}
          {loading ? (
            <LoadingSpinner fullPage />
          ) : (
            <>
            <div data-tour="backoffice-acciones-list" className="divide-y divide-gray-100 lg:hidden">
              {paginated.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-gray-400">No se encontraron acciones con los filtros aplicados.</div>
              ) : (
                paginated.map((a) => (
                  <article key={a.id} className="space-y-3 px-4 py-4 sm:px-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-primary">#{a.id}</p>
                        <p className="mt-1 text-sm text-dark/85">{a.descripcion}</p>
                      </div>
                      <StatusBadge status={a.estado} className="shrink-0" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{a.provincia}</span>
                      <span>{a.fechaIncidente}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => navigate(`/admin/acciones/${a.id}`)}
                        className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                      >
                        Ver detalle
                      </button>
                      <button
                        onClick={() => openStatusModal(a)}
                        className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                      >
                        Cambiar estado
                      </button>
                      <button
                        onClick={() => navigate(`/admin/denuncias/${a.denunciaId}`)}
                        className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                      >
                        Ver denuncia
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>

            <div data-tour="backoffice-acciones-list" className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[920px] text-sm">
              <thead className="bg-[#F0F2F5]">
                <tr>
                  {COLUMNS.map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 whitespace-pre-line">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        title="Sin acciones correctivas"
                        description="No se encontraron acciones con los filtros aplicados."
                      />
                    </td>
                  </tr>
                ) : (
                  paginated.map((a) => (
                    <tr
                      key={a.id}
                      className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/acciones/${a.id}`)}
                    >
                      <td className="px-5 py-4 font-bold text-primary">{a.id}</td>
                      <td className="px-5 py-4 text-primary/80 max-w-[220px]">
                        <p className="truncate">{a.descripcion}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{a.provincia}</td>
                      <td className="px-5 py-4 text-gray-600">{a.fechaIncidente}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={a.estado} />
                      </td>
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <ActionBtn
                            icon={Eye}
                            title="Ver detalle"
                            color="bg-primary/10 text-primary hover:bg-primary/20"
                            onClick={() => navigate(`/admin/acciones/${a.id}`)}
                          />
                          <ActionBtn
                            icon={CheckCircle}
                            title="Cambiar estado"
                            color="bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            onClick={() => openStatusModal(a)}
                          />
                          <button
                            onClick={() => navigate(`/admin/denuncias/${a.denunciaId}`)}
                            className="rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-100"
                          >
                            Denuncia
                          </button>
                          <button
                            onClick={() => {
                              const lines = [`Acción: ${a.id}`, `Estado: ${a.estado}`, `Provincia: ${a.provincia}`, `Responsable: ${a.responsable}`, `Acción tomada: ${a.accionTomada}`]
                              const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
                              const url = URL.createObjectURL(blob)
                              const el = document.createElement('a')
                              el.href = url; el.download = `accion_${a.id}.txt`; el.click()
                              URL.revokeObjectURL(url)
                              toast.info(`Reporte de acción #${a.id} exportado`)
                            }}
                            className="rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600 hover:bg-gray-200"
                          >
                            Exportar
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
                Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, filtered.length)} de {filtered.length} entradas
              </p>
              <div className="order-1 flex items-center gap-1 sm:order-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => setPage(n)} className={`h-8 w-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${n === page ? 'bg-primary text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{n}</button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-colors">
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
          )}
        </div>
      </main>

      {/* Status change modal */}
      <Modal
        open={statusModal.open}
        onClose={() => setStatusModal({ open: false, accion: null })}
        title="Cambiar Estado de Acción"
        confirmLabel="Guardar cambio"
        onConfirm={handleSaveEstado}
        loading={saving}
      >
        {statusModal.accion && (
          <div className="flex flex-col gap-4">
            <p>Cambiando estado de la acción <span className="font-semibold text-gray-800">#{statusModal.accion.id}</span>.</p>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Nuevo estado</label>
              <select
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              >
                {ACCION_ESTADOS.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
