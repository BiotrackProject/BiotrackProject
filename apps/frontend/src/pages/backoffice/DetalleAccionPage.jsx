import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Download, FileText, User, MapPin, Calendar, ClipboardList } from 'lucide-react'
import BackofficeTopbar from '../../components/backoffice/BackofficeTopbar'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { accionesService } from '../../services/accionesService'
import { ACCION_ESTADOS } from '../../constants/statuses'
import { toast } from '../../utils/toast'

function InfoCard({ title, icon: Icon, children }) {
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

function InfoRow({ label, value }) {
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

  const [accion, setAccion]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Status change modal
  const [statusModal, setStatusModal]   = useState(false)
  const [nuevoEstado, setNuevoEstado]   = useState('')
  const [saving, setSaving]             = useState(false)

  useEffect(() => {
    accionesService.getById(id)
      .then((data) => { setAccion(data); setNuevoEstado(data.estado) })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSaveEstado() {
    setSaving(true)
    const updated = await accionesService.updateEstado(id, nuevoEstado)
    setAccion(updated)
    setSaving(false)
    setStatusModal(false)
    toast.success(`Estado actualizado a "${nuevoEstado}"`)

  }

  function exportAccion() {
    if (!accion) return
    const lines = [
      `Acción Correctiva: ${accion.id}`,
      `Denuncia relacionada: ${accion.denunciaId}`,
      `Estado: ${accion.estado}`,
      `Provincia: ${accion.provincia}`,
      `Fecha incidente: ${accion.fechaIncidente}`,
      `Fecha acción: ${accion.fechaAccion ?? 'N/A'}`,
      `Responsable: ${accion.responsable}`,
      `Acción tomada: ${accion.accionTomada}`,
      `Seguimiento: ${accion.seguimiento}`,
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `accion_${accion.id}.txt`; a.click()
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
            <span className="text-base font-bold text-primary">Acción: {accion.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-500">Denuncia:</span>
            <button
              onClick={() => navigate(`/admin/denuncias/${accion.denunciaId}`)}
              className="text-sm font-semibold text-primary hover:underline"
            >
              #{accion.denunciaId}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-500">Estado:</span>
            <StatusBadge status={accion.estado} />
          </div>
        </div>

        <div data-tour="backoffice-accion-details" className="grid grid-cols-2 gap-5">
          {/* Información general */}
          <InfoCard title="Información General" icon={FileText}>
            <div className="flex flex-col gap-2">
              <InfoRow label="Descripción" value={accion.descripcionCompleta} />
              <InfoRow label="Provincia" value={accion.provincia} />
              <InfoRow label="Fecha de incidente" value={accion.fechaIncidente} />
              <InfoRow label="Fecha de acción" value={accion.fechaAccion ?? 'Sin asignar'} />
            </div>
          </InfoCard>

          {/* Responsable */}
          <InfoCard title="Responsable" icon={User}>
            <div className="flex flex-col gap-2">
              <InfoRow label="Nombre" value={accion.responsable} />
              <InfoRow label="Estado de la acción" value={accion.estado} />
            </div>
          </InfoCard>
        </div>

        {/* Acción tomada */}
        <InfoCard title="Acción Tomada" icon={MapPin}>
          <p className="text-sm text-gray-600 leading-relaxed">{accion.accionTomada}</p>
        </InfoCard>

        {/* Seguimiento */}
        <InfoCard title="Seguimiento" icon={Calendar}>
          <p className="text-sm text-gray-600 leading-relaxed">{accion.seguimiento}</p>
        </InfoCard>

      </main>

      {/* Status change modal */}
      <Modal
        open={statusModal}
        onClose={() => { setStatusModal(false); setNuevoEstado(accion.estado) }}
        title="Cambiar Estado de la Acción"
        confirmLabel="Guardar cambio"
        onConfirm={handleSaveEstado}
        loading={saving}
      >
        <div className="flex flex-col gap-4">
          <p>Selecciona el nuevo estado para la acción <span className="font-semibold text-gray-800">#{accion.id}</span>.</p>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">Estado</label>
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
      </Modal>
    </>
  )
}
