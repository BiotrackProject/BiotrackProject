// @ts-nocheck
import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Download, FileText, Search, ChevronLeft, ChevronRight, Trash2, Edit, Map, BarChart2 } from 'lucide-react'
import BackofficeTopbar from '../../components/backoffice/BackofficeTopbar'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { monitoreoService } from '../../services/monitoreoService'
import { locationService } from '../../services/locationService'
import { DENUNCIA_ESTADOS } from '../../constants/statuses'
import { toast } from '../../utils/toast'
import LocationPickerMap from '../../components/map/LocationPickerMap'

const FILE_COLORS = {
  JPG: 'bg-blue-100 text-blue-600',
  MP3: 'bg-orange-100 text-orange-600',
  MP4: 'bg-purple-100 text-purple-600',
  PDF: 'bg-red-100 text-red-600',
  PNG: 'bg-green-100 text-green-600',
}

function InfoRow({ label, value }) {
  return (
    <p className="text-sm text-gray-600">
      <span className="font-semibold text-gray-700">{label}: </span>
      {value ?? 'N/A'}
    </p>
  )
}

function InfoCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-primary mb-3">{title}</h3>
      {children}
    </div>
  )
}

const PAGE_SIZE_OPTIONS = [5, 10, 20]

export default function DetalleMonitoreoPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [denuncia, setDenuncia]     = useState(null)
  const [loading, setLoading]       = useState(true)
  const [notFound, setNotFound]     = useState(false)
  const [estado, setEstado]         = useState('')
  const [planes, setPlanes]         = useState([])
  const [zoneLocation, setZoneLocation] = useState(null)

  // Note
  const [nota, setNota]             = useState('')
  const [notaGuardada, setNotaGuardada] = useState(false)

  // Status modal
  const [statusModal, setStatusModal]   = useState(false)
  const [pendingEstado, setPendingEstado] = useState('')
  const [savingEstado, setSavingEstado] = useState(false)

  // Map modal (Ver mapa de ruta)
  const [mapModal, setMapModal] = useState(false)

  // Análisis modal (placeholder)
  const [analisisModal, setAnalisisModal] = useState(false)

  // Reporte modal (Elaborar Reporte)
  const [reporteModal, setReporteModal] = useState(false)

  // Delete plan confirmation
  const [deleteModal, setDeleteModal]   = useState({ open: false, id: null })
  const [deletingPlan, setDeletingPlan] = useState(false)

  // Pagination
  const [query, setQuery]     = useState('')
  const [page, setPage]       = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    Promise.all([
      monitoreoService.getDenunciaById(id),
      monitoreoService.getPlanesByDenuncia(id),
      locationService.getZoneLocationById(id),
    ]).then(([den, pls, zone]) => {
      setDenuncia(den)
      setEstado(den.estado)
      setPlanes(pls)
      setZoneLocation(zone)
    }).catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  const isEnCorreccion = estado === 'En Corrección'

  const filteredPlanes = useMemo(() => {
    const q = query.toLowerCase()
    return !q ? planes : planes.filter((m) =>
      m.nombre.toLowerCase().includes(q) || m.responsable.toLowerCase().includes(q)
    )
  }, [planes, query])

  const totalPages = Math.max(1, Math.ceil(filteredPlanes.length / pageSize))
  const paginated  = filteredPlanes.slice((page - 1) * pageSize, page * pageSize)

  function openStatusModal(nuevoEstado) {
    setPendingEstado(nuevoEstado)
    setStatusModal(true)
  }

  async function confirmEstado() {
    setSavingEstado(true)
    await monitoreoService.updateEstado(id, pendingEstado)
    setEstado(pendingEstado)
    setSavingEstado(false)
    setStatusModal(false)
    toast.success(`Estado actualizado a "${pendingEstado}"`)
  }

  function guardarNota() {
    if (!nota.trim()) return
    setNotaGuardada(true)
    toast.success('Nota guardada correctamente')
    setTimeout(() => setNotaGuardada(false), 2000)
  }

  async function eliminarPlan(mid) {
    setDeletingPlan(true)
    await monitoreoService.removePlan(mid)
    setPlanes((prev) => prev.filter((m) => m.id !== mid))
    setDeletingPlan(false)
    setDeleteModal({ open: false, id: null })
    toast.success('Plan de monitoreo eliminado')
  }

  function exportDenuncia() {
    if (!denuncia) return
    const blob = new Blob([`Denuncia: ${denuncia.id}\nEstado: ${estado}\nProvincia: ${denuncia.provincia}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `monitoreo_${denuncia.id}.txt`; a.click()
    URL.revokeObjectURL(url)
    toast.info('Exportación iniciada')
  }

  if (loading) return (
    <>
      <BackofficeTopbar title="Monitoreo de Zona" backTo="/admin/monitoreo" />
      <LoadingSpinner fullPage />
    </>
  )

  if (notFound || !denuncia) return (
    <>
      <BackofficeTopbar title="Monitoreo de Zona" backTo="/admin/monitoreo" />
      <main className="p-8"><p className="text-sm text-gray-400">Denuncia no encontrada.</p></main>
    </>
  )

  return (
    <>
      <BackofficeTopbar
        title="Monitoreo de Zona"
        backTo="/admin/monitoreo"
        actions={
          <div data-tour="backoffice-topbar-actions" className="flex items-center gap-2">
            {/* Asignar Estado */}
            <div data-tour="backoffice-monitoreo-status" className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2 py-1">
              <span className="text-xs font-semibold text-gray-500">Estado:</span>
              <select
                value={estado}
                onChange={(e) => openStatusModal(e.target.value)}
                className="text-sm font-semibold text-primary bg-transparent outline-none cursor-pointer"
              >
                {DENUNCIA_ESTADOS.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            {!isEnCorreccion && (
              <button
                onClick={() => openStatusModal('En Monitoreo')}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                Monitorear Zona
              </button>
            )}

            <button
              onClick={exportDenuncia}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Exportar
            </button>
          </div>
        }
      />

      <main className="p-8 flex flex-col gap-5">
        {/* Header card */}
        <div data-tour="backoffice-monitoreo-summary" className="bg-white rounded-2xl px-6 py-4 shadow-sm flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-base font-bold text-primary">Denuncia: {denuncia.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-500">Estado:</span>
            <StatusBadge status={estado} />
          </div>
        </div>

        {/* Two-column info layout */}
        <div data-tour="backoffice-monitoreo-details" className="grid grid-cols-[1fr_1fr] gap-5">
          <div className="flex flex-col gap-5">
            <InfoCard title="Información del Denunciante">
              <div className="flex flex-col gap-1.5">
                <InfoRow label="Desea permanecer anónimo" value={denuncia.anonimo ? 'Sí' : 'No'} />
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <InfoRow label="Nombres" value={denuncia.nombres} />
                  <InfoRow label="Apellidos" value={denuncia.apellidos} />
                  <InfoRow label="Correo Electrónico" value={denuncia.correo} />
                  <InfoRow label="Teléfono de contacto" value={denuncia.telefono} />
                </div>
              </div>
            </InfoCard>

            <InfoCard title="Ubicación del Incidente">
              <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
                <InfoRow label="Fecha de Incidencia" value={denuncia.fecha} />
                <InfoRow label="Hora Aproximada" value={denuncia.hora} />
                <InfoRow label="Coordenadas GPS" value={denuncia.gps} />
                <InfoRow label="Provincia" value={denuncia.provincia} />
                <InfoRow label="Municipio" value={denuncia.municipio} />
                <InfoRow label="Sector" value={denuncia.sector} />
              </div>
            </InfoCard>

            <InfoCard title="Evidencias Adjuntas">
              {denuncia.evidencias?.length === 0 ? (
                <p className="text-sm text-gray-400">Sin evidencias.</p>
              ) : (
                <div className="flex flex-wrap gap-5">
                  {denuncia.evidencias?.map((ev, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className={`flex h-14 w-12 items-center justify-center rounded-xl text-xs font-bold ${FILE_COLORS[ev.type] ?? 'bg-gray-100 text-gray-500'}`}>{ev.type}</div>
                      <span className="text-xs text-gray-500 max-w-[80px] text-center truncate">{ev.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </InfoCard>
          </div>

          <div data-tour="backoffice-monitoreo-plans" className="flex flex-col gap-5">
            <InfoCard title="Descripción de la Actividad">
              <div className="flex flex-col gap-2">
                <InfoRow label="Tipo de extracción observada" value={denuncia.tipoExtraccion} />
                <InfoRow label="Número de personas involucradas" value={denuncia.numPersonas} />
                <div>
                  <p className="text-sm font-semibold text-gray-700">Cantidad estimada de arena extraída:</p>
                  <p className="text-sm text-gray-600">{denuncia.cantidadArena}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Detalle de la actividad realizada:</p>
                  <p className="text-sm text-gray-600 leading-relaxed mt-1 line-clamp-6">{denuncia.detalleActividad}</p>
                </div>
              </div>
            </InfoCard>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-primary mb-3">Añadir una nota</h3>
              <textarea
                rows={4}
                placeholder="Describir la zona afectada..."
                value={nota}
                onChange={(e) => { setNota(e.target.value); setNotaGuardada(false) }}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 outline-none resize-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
              {notaGuardada && <p className="text-xs text-emerald-600 mt-1">Nota guardada.</p>}
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={() => { setNota(''); setNotaGuardada(false) }} className="rounded-lg border border-gray-200 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  Borrar
                </button>
                <button onClick={guardarNota} className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
                  Guardar Nota
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Planes de monitoreo */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-primary mb-4">
            {isEnCorreccion ? 'Zonas Monitoreadas' : 'Monitoreo de Zona'}
          </h3>

            <div data-tour="backoffice-monitoreo-actions" className="flex items-center gap-3 mb-5">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar monitoreo..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1) }}
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-4 pr-10 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {isEnCorreccion ? (
              <button
                onClick={() => setReporteModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
              >
                Elaborar Reporte
              </button>
            ) : (
              <button
                onClick={() => navigate(`/admin/monitoreo/${id}/planificar`)}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                Planificar Monitoreo
              </button>
            )}
            {!isEnCorreccion && (
              <button
                onClick={() => navigate('/admin/acciones')}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
              >
                Acción Correctiva
              </button>
            )}
          </div>

          {filteredPlanes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <p className="text-sm">Aún no se ha planificado un monitoreo para esta zona</p>
              <button
                onClick={() => navigate(`/admin/monitoreo/${id}/planificar`)}
                className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                Crear primer plan
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {paginated.map((m) => (
                <div key={m.id} className="rounded-xl border border-gray-100 bg-[#F8F9FB] p-5">
                  <p className="text-xs font-bold text-primary mb-3">Plan de Monitoreo</p>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-1.5 mb-4">
                    <InfoRow label="Nombre del monitoreo" value={m.nombre} />
                    <InfoRow label="Fecha de inicio" value={m.fechaInicio} />
                    <InfoRow label="Frecuencia" value={m.frecuencia} />
                    <InfoRow label="Días de monitoreo" value={m.diasSemanales?.join(', ')} />
                    <InfoRow label="Medios o herramientas" value={m.medios?.join(', ')} />
                    <InfoRow label="Responsable" value={m.responsable} />
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => setAnalisisModal(true)}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${isEnCorreccion ? 'bg-action hover:bg-action/90' : 'bg-orange-500 hover:bg-orange-600'}`}
                    >
                      <BarChart2 className="h-4 w-4" /> Análisis de Monitoreo
                    </button>
                    <button
                      data-tour="backoffice-monitoreo-map"
                      onClick={() => setMapModal(true)}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${isEnCorreccion ? 'text-primary hover:underline' : 'bg-primary text-white hover:bg-primary/90'}`}
                    >
                      <Map className="h-4 w-4" /> Ver mapa de ruta
                    </button>
                    {!isEnCorreccion && (
                      <>
                        <button
                          onClick={() => navigate(`/admin/monitoreo/${id}/planificar?edit=${m.id}`)}
                          className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" /> Editar
                        </button>
                        <button
                          onClick={() => setDeleteModal({ open: true, id: m.id })}
                          className="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" /> Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredPlanes.length > 0 && (
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, filteredPlanes.length)} de {filteredPlanes.length} entradas
              </p>
              <div className="flex items-center gap-1">
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
              <div className="flex items-center gap-2 text-xs text-gray-500">
                Registros por página
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }} className="rounded-lg border border-gray-200 px-2 py-1 text-xs outline-none focus:border-primary">
                  {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Status change confirmation */}
      <Modal
        open={statusModal}
        onClose={() => setStatusModal(false)}
        title="Cambiar Estado"
        confirmLabel="Confirmar"
        onConfirm={confirmEstado}
        loading={savingEstado}
      >
        <p>
          ¿Confirmas cambiar el estado de la denuncia{' '}
          <span className="font-semibold text-gray-800">#{denuncia.id}</span> a{' '}
          <span className="font-semibold text-primary">{pendingEstado}</span>?
        </p>
      </Modal>

      {/* Map modal — interactive Leaflet */}
      <Modal open={mapModal} onClose={() => setMapModal(false)} title="Mapa de Ruta de Monitoreo">
        <LocationPickerMap
          lat={zoneLocation?.lat ?? (denuncia.gps ? parseFloat(denuncia.gps.split(',')[0]) : null)}
          lng={zoneLocation?.lng ?? (denuncia.gps ? parseFloat(denuncia.gps.split(',')[1]) : null)}
          readonly
          height="340px"
          province={denuncia.provincia}
        />
        <p className="text-xs text-gray-400 mt-2">
          Coordenadas GPS: {denuncia.gps ?? (zoneLocation ? `${zoneLocation.lat}, ${zoneLocation.lng}` : 'No especificadas')}
        </p>
      </Modal>

      {/* Análisis placeholder modal */}
      <Modal open={analisisModal} onClose={() => setAnalisisModal(false)} title="Análisis de Monitoreo">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-3">
            {[['Visitas realizadas', '8'], ['Alertas detectadas', '3'], ['Días monitoreados', '24']].map(([label, val]) => (
              <div key={label} className="rounded-xl bg-gray-50 p-3 text-center">
                <p className="text-xl font-black text-primary">{val}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 text-center pt-2">
            Análisis detallado disponible tras la integración con el backend.
          </p>
        </div>
      </Modal>

      {/* Elaborar Reporte modal */}
      <Modal
        open={reporteModal}
        onClose={() => setReporteModal(false)}
        title="Elaborar Reporte de Corrección"
        confirmLabel="Generar reporte"
        onConfirm={() => { setReporteModal(false); toast.success('Reporte generado — disponible en Exportar') }}
      >
        <div className="flex flex-col gap-3">
          <p>Se generará un reporte de cierre para la denuncia <span className="font-semibold">#{denuncia.id}</span>.</p>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">Observaciones finales</label>
            <textarea
              rows={3}
              placeholder="Agregar observaciones al reporte..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none resize-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>
      </Modal>

      {/* Delete plan confirmation */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        title="Eliminar Plan de Monitoreo"
        variant="danger"
        confirmLabel="Sí, eliminar"
        onConfirm={() => eliminarPlan(deleteModal.id)}
        loading={deletingPlan}
      >
        <p>¿Confirmas eliminar este plan de monitoreo? Esta acción no se puede deshacer.</p>
      </Modal>
    </>
  )
}
