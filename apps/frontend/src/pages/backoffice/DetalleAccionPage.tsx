import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Download, FileText, User, Calendar, ClipboardList } from 'lucide-react'
import BackofficeTopbar from '../../components/backoffice/BackofficeTopbar'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Modal from '../../components/ui/Modal'
import { accionesService, ESTADOS_ACCION, ESTADO_ACCION_LABEL, ESTADO_ACCION_STYLES } from '../../services/accionesService'
import type { Accion, EstadoAccion } from '../../services/accionesService'
import { toast } from '../../utils/toast'

function InfoCard({ title, icon: Icon, children }: { title: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        <h3 className="text-sm font-bold text-primary">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <p className="text-sm text-gray-600">
      <span className="font-semibold text-gray-700">{label}: </span>
      {value ?? '—'}
    </p>
  )
}

export default function DetalleAccionPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [accion, setAccion] = useState<Accion | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [statusModal, setStatusModal] = useState(false)
  const [nuevoEstado, setNuevoEstado] = useState<EstadoAccion>('Planificada')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    accionesService.getById(id!)
      .then((data) => { setAccion(data); setNuevoEstado(data.Estado) })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSaveEstado() {
    setSaving(true)
    try {
      const updated = await accionesService.cambiarEstado(id!, nuevoEstado)
      setAccion(updated)
      toast.success(`Estado actualizado a "${ESTADO_ACCION_LABEL[nuevoEstado]}"`)
      setStatusModal(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar estado')
    } finally {
      setSaving(false)
    }
  }

  function exportAccion() {
    if (!accion) return
    const lines = [
      `Acción Correctiva: ${accion.IDAccion}`,
      `Título: ${accion.titulo}`,
      `Estado: ${ESTADO_ACCION_LABEL[accion.Estado]}`,
      `Fecha planificada: ${accion.FechaPlanificacion ? new Date(accion.FechaPlanificacion).toLocaleDateString('es-DO') : 'N/A'}`,
      `Fecha implementación: ${accion.FechaImplementacion ? new Date(accion.FechaImplementacion).toLocaleDateString('es-DO') : 'N/A'}`,
      `Responsable: ${accion.responsable?.nombre_completo ?? 'N/A'}`,
      `Descripción: ${accion.descripcion_accion ?? 'N/A'}`,
      `Resultado: ${accion.Resultado ?? 'N/A'}`,
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `accion_${accion.IDAccion.slice(-8)}.txt`; a.click()
    URL.revokeObjectURL(url)
    toast.info('Exportación iniciada')
  }

  if (loading) {
    return (
      <>
        <BackofficeTopbar title="Detalle de Acción" backTo="/admin/acciones" />
        <LoadingSpinner fullPage />
      </>
    )
  }

  if (notFound || !accion) {
    return (
      <>
        <BackofficeTopbar title="Detalle de Acción" backTo="/admin/acciones" />
        <main className="p-8">
          <p className="text-sm text-gray-400">Acción correctiva no encontrada.</p>
        </main>
      </>
    )
  }

  const denunciasRelacionadas = accion.accion_denuncia ?? []

  return (
    <>
      <BackofficeTopbar
        title="Detalle de Acción Correctiva"
        backTo="/admin/acciones"
        actions={
          <div data-tour="backoffice-accion-status" className="flex items-center gap-2">
            <button
              onClick={() => setStatusModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              Cambiar Estado
            </button>
            <button
              onClick={exportAccion}
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
        <div data-tour="backoffice-accion-summary" className="bg-white rounded-2xl px-6 py-4 shadow-sm flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <span className="text-base font-bold text-primary">{accion.titulo}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-500">Estado:</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ESTADO_ACCION_STYLES[accion.Estado]}`}>
              {ESTADO_ACCION_LABEL[accion.Estado]}
            </span>
          </div>
        </div>

        <div data-tour="backoffice-accion-details" className="grid grid-cols-2 gap-5">
          {/* Información general */}
          <InfoCard title="Información General" icon={FileText}>
            <div className="flex flex-col gap-2">
              <InfoRow label="Fecha planificada" value={accion.FechaPlanificacion ? new Date(accion.FechaPlanificacion).toLocaleDateString('es-DO') : null} />
              <InfoRow label="Fecha implementación" value={accion.FechaImplementacion ? new Date(accion.FechaImplementacion).toLocaleDateString('es-DO') : null} />
              <InfoRow label="Visibilidad" value={accion.visibilidad} />
              <InfoRow label="Presupuesto" value={accion.Presupuesto} />
            </div>
          </InfoCard>

          {/* Responsable */}
          <InfoCard title="Responsable" icon={User}>
            <div className="flex flex-col gap-2">
              <InfoRow label="Nombre" value={accion.responsable?.nombre_completo} />
              <InfoRow label="Estado de la acción" value={ESTADO_ACCION_LABEL[accion.Estado]} />
            </div>
          </InfoCard>
        </div>

        {/* Descripción */}
        <InfoCard title="Descripción" icon={FileText}>
          <p className="text-sm text-gray-600 leading-relaxed">{accion.descripcion_accion ?? '—'}</p>
        </InfoCard>

        {/* Resultado */}
        {accion.Resultado && (
          <InfoCard title="Resultado" icon={Calendar}>
            <p className="text-sm text-gray-600 leading-relaxed">{accion.Resultado}</p>
          </InfoCard>
        )}

        {/* Denuncias relacionadas */}
        {denunciasRelacionadas.length > 0 && (
          <InfoCard title="Denuncias Relacionadas">
            <div className="flex flex-col gap-2">
              {denunciasRelacionadas.map(({ Denuncia: d }) => (
                <div key={d.IDDenuncia} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-primary">{d.codigo_seguimiento}</p>
                    <p className="text-xs text-gray-400">{d.tipo_actividad.replace(/_/g, ' ')} · {d.Estado}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/denuncias/${d.IDDenuncia}`)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Ver denuncia
                  </button>
                </div>
              ))}
            </div>
          </InfoCard>
        )}
      </main>

      {/* Status change modal */}
      <Modal
        open={statusModal}
        onClose={() => { setStatusModal(false); setNuevoEstado(accion.Estado) }}
        title="Cambiar Estado de la Acción"
        confirmLabel="Guardar cambio"
        onConfirm={handleSaveEstado}
        loading={saving}
      >
        <div className="flex flex-col gap-4">
          <p>Selecciona el nuevo estado para la acción <span className="font-semibold text-gray-800">"{accion.titulo}"</span>.</p>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">Estado</label>
            <select
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value as EstadoAccion)}
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            >
              {ESTADOS_ACCION.map((e) => (
                <option key={e} value={e}>{ESTADO_ACCION_LABEL[e]}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </>
  )
}
