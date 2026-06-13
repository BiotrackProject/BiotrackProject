// @ts-nocheck
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Download, FileText, Map, BarChart2 } from 'lucide-react'
import BackofficeTopbar from '../../components/backoffice/BackofficeTopbar'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { monitoreoService } from '../../services/monitoreoService'
import { ESTADO_LABEL, ESTADO_STYLES, ESTADOS_DENUNCIA, TIPO_LABEL } from '../../services/denunciasService'
import type { Denuncia, EstadoDenuncia } from '../../services/denunciasService'
import { toast } from '../../utils/toast'

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
      {value ?? '—'}
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

export default function DetalleMonitoreoPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [denuncia, setDenuncia] = useState<Denuncia | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [estado, setEstado] = useState<EstadoDenuncia>('Pendiente')

  const [nota, setNota] = useState('')
  const [notaGuardada, setNotaGuardada] = useState(false)

  const [statusModal, setStatusModal] = useState(false)
  const [pendingEstado, setPendingEstado] = useState<EstadoDenuncia>('Pendiente')
  const [savingEstado, setSavingEstado] = useState(false)

  const [analisisModal, setAnalisisModal] = useState(false)
  const [mapModal, setMapModal] = useState(false)

  useEffect(() => {
    monitoreoService.getDenunciaById(id)
      .then((den) => { setDenuncia(den); setEstado(den.Estado) })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  function openStatusModal(nuevoEstado: EstadoDenuncia) {
    setPendingEstado(nuevoEstado)
    setStatusModal(true)
  }

  async function confirmEstado() {
    setSavingEstado(true)
    try {
      await monitoreoService.updateEstado(id, pendingEstado)
      setEstado(pendingEstado)
      toast.success(`Estado actualizado a "${ESTADO_LABEL[pendingEstado]}"`)
      setStatusModal(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar estado')
    } finally {
      setSavingEstado(false)
    }
  }

  function guardarNota() {
    if (!nota.trim()) return
    setNotaGuardada(true)
    toast.success('Nota guardada correctamente')
    setTimeout(() => setNotaGuardada(false), 2000)
  }

  function exportDenuncia() {
    if (!denuncia) return
    const lines = [
      `Código: ${denuncia.codigo_seguimiento}`,
      `Estado: ${ESTADO_LABEL[estado]}`,
      `Tipo: ${TIPO_LABEL[denuncia.tipo_actividad]}`,
      `Fecha: ${new Date(denuncia.Fecha_denuncia).toLocaleDateString('es-DO')}`,
      `Descripción: ${denuncia.Descripcion}`,
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `monitoreo_${denuncia.codigo_seguimiento}.txt`; a.click()
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
            <div data-tour="backoffice-monitoreo-status" className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2 py-1">
              <span className="text-xs font-semibold text-gray-500">Estado:</span>
              <select
                value={estado}
                onChange={(e) => openStatusModal(e.target.value as EstadoDenuncia)}
                className="text-sm font-semibold text-primary bg-transparent outline-none cursor-pointer"
              >
                {ESTADOS_DENUNCIA.map((e) => (
                  <option key={e} value={e}>{ESTADO_LABEL[e]}</option>
                ))}
              </select>
            </div>
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
            <span className="text-base font-bold text-primary">{denuncia.codigo_seguimiento}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-500">Estado:</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ESTADO_STYLES[estado]}`}>
              {ESTADO_LABEL[estado]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-500">Tipo:</span>
            <span className="text-sm text-gray-600">{TIPO_LABEL[denuncia.tipo_actividad]}</span>
          </div>
        </div>

        {/* Two-column layout */}
        <div data-tour="backoffice-monitoreo-details" className="grid grid-cols-[1fr_1fr] gap-5">
          <div className="flex flex-col gap-5">
            <InfoCard title="Información del Incidente">
              <div className="flex flex-col gap-2">
                <InfoRow label="Código" value={denuncia.codigo_seguimiento} />
                <InfoRow label="Fecha de incidente" value={new Date(denuncia.Fecha_denuncia).toLocaleDateString('es-DO')} />
                <InfoRow label="Hora aproximada" value={denuncia.hora_aproximada} />
                <InfoRow label="Tipo de actividad" value={TIPO_LABEL[denuncia.tipo_actividad]} />
              </div>
            </InfoCard>

            {/* Evidencias */}
            <InfoCard title="Evidencias Adjuntas">
              {!denuncia.Evidencia_Denuncia || denuncia.Evidencia_Denuncia.length === 0 ? (
                <p className="text-sm text-gray-400">Sin evidencias.</p>
              ) : (
                <div className="flex flex-wrap gap-5">
                  {denuncia.Evidencia_Denuncia.map((ev) => {
                    const ext = ev.TipoArchivo.toUpperCase()
                    return (
                      <a key={ev.IDEvidencia} href={ev.archivo_url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2">
                        <div className={`flex h-14 w-12 items-center justify-center rounded-xl text-xs font-bold ${FILE_COLORS[ext] ?? 'bg-gray-100 text-gray-500'}`}>{ext}</div>
                        <span className="text-xs text-gray-500 max-w-[80px] text-center truncate">{ev.archivo_url.split('/').pop()}</span>
                      </a>
                    )
                  })}
                </div>
              )}
            </InfoCard>

            {/* Historial */}
            {denuncia.historial && denuncia.historial.length > 0 && (
              <InfoCard title="Historial de Estados">
                <div className="flex flex-col gap-2">
                  {denuncia.historial.map((h) => (
                    <div key={h.id} className="text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ESTADO_STYLES[h.estado_anterior]}`}>{ESTADO_LABEL[h.estado_anterior]}</span>
                        <span className="text-gray-400">→</span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ESTADO_STYLES[h.estado_nuevo]}`}>{ESTADO_LABEL[h.estado_nuevo]}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{h.Usuario.nombre_completo} · {new Date(h.created_at).toLocaleString('es-DO')}</p>
                      {h.comentario && <p className="text-xs text-gray-500 italic">{h.comentario}</p>}
                    </div>
                  ))}
                </div>
              </InfoCard>
            )}
          </div>

          <div data-tour="backoffice-monitoreo-plans" className="flex flex-col gap-5">
            <InfoCard title="Descripción de la Actividad">
              <p className="text-sm text-gray-600 leading-relaxed">{denuncia.Descripcion}</p>
            </InfoCard>

            {/* Nota */}
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
                <button onClick={() => { setNota(''); setNotaGuardada(false) }} className="rounded-lg border border-gray-200 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Borrar</button>
                <button onClick={guardarNota} className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">Guardar Nota</button>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-primary mb-3">Acciones</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setAnalisisModal(true)}
                  className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
                >
                  <BarChart2 className="h-4 w-4" /> Análisis de Monitoreo
                </button>
                <button
                  onClick={() => setMapModal(true)}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                >
                  <Map className="h-4 w-4" /> Ver en mapa
                </button>
                <button
                  onClick={() => navigate('/admin/acciones')}
                  className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
                >
                  Acción Correctiva
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Status change modal */}
      <Modal
        open={statusModal}
        onClose={() => setStatusModal(false)}
        title="Cambiar Estado"
        confirmLabel="Confirmar"
        onConfirm={confirmEstado}
        loading={savingEstado}
      >
        <p>¿Confirmas cambiar el estado de <span className="font-semibold">{denuncia.codigo_seguimiento}</span> a <span className="font-semibold text-primary">{ESTADO_LABEL[pendingEstado]}</span>?</p>
      </Modal>

      {/* Análisis placeholder */}
      <Modal open={analisisModal} onClose={() => setAnalisisModal(false)} title="Análisis de Monitoreo" confirmLabel="Cerrar" onConfirm={() => setAnalisisModal(false)}>
        <p className="text-sm text-gray-500">El módulo de análisis estará disponible cuando el backend de zonas esté implementado.</p>
      </Modal>

      {/* Mapa placeholder */}
      <Modal open={mapModal} onClose={() => setMapModal(false)} title="Mapa de Zona" confirmLabel="Cerrar" onConfirm={() => setMapModal(false)}>
        <p className="text-sm text-gray-500">Para ver la ubicación en el mapa, usa la vista de mapa general.</p>
        <button onClick={() => { setMapModal(false); navigate('/admin/mapa') }} className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
          Ir al mapa
        </button>
      </Modal>
    </>
  )
}
