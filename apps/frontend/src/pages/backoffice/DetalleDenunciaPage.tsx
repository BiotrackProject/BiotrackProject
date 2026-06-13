import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Download, FileText } from 'lucide-react'
import BackofficeTopbar from '../../components/backoffice/BackofficeTopbar'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import { MOCK_DENUNCIAS, ESTADOS } from '../../data/mockDenuncias'
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
      {value ?? 'N/A'}
    </p>
  )
}

function InfoCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-bold text-primary mb-4">{title}</h3>
      {children}
    </div>
  )
}

export default function DetalleDenunciaPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const denuncia = MOCK_DENUNCIAS.find((d) => d.id === id)

  const [estado, setEstado]           = useState(denuncia?.estado ?? 'Nueva')
  const [statusModal, setStatusModal] = useState(false)
  const [pendingEstado, setPendingEstado] = useState('')
  const [saving, setSaving]           = useState(false)

  if (!denuncia) {
    return (
      <>
        <BackofficeTopbar title="Detalle de Denuncia" backTo="/admin/denuncias" />
        <main className="p-8">
          <p className="text-sm text-gray-400">Denuncia no encontrada.</p>
        </main>
      </>
    )
  }

  function openStatusModal(nuevoEstado) {
    setPendingEstado(nuevoEstado)
    setStatusModal(true)
  }

  async function confirmEstado() {
    setSaving(true)
    // TODO: await denunciasService.updateEstado(id, pendingEstado)
    await new Promise((r) => setTimeout(r, 400))
    setEstado(pendingEstado)
    setSaving(false)
    setStatusModal(false)
    toast.success(`Estado actualizado a "${pendingEstado}"`)

  }

  function exportDenuncia() {
    const lines = [
      `Denuncia: ${denuncia.id}`,
      `Estado: ${estado}`,
      `Fecha: ${denuncia.fecha}`,
      `Provincia: ${denuncia.provincia}`,
      `Municipio: ${denuncia.municipio}`,
      `Sector: ${denuncia.sector}`,
      `GPS: ${denuncia.gps}`,
      `Tipo extracción: ${denuncia.tipoExtraccion}`,
      `Personas: ${denuncia.numPersonas}`,
      `Cantidad arena: ${denuncia.cantidadArena}`,
      `Detalle: ${denuncia.detalleActividad}`,
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `denuncia_${denuncia.id}.txt`; a.click()
    URL.revokeObjectURL(url)
    toast.info('Exportación iniciada')
  }

  return (
    <>
      <BackofficeTopbar
        title="Detalle de Denuncia"
        backTo="/admin/denuncias"
        actions={
          <div data-tour="backoffice-denuncia-status" className="flex items-center gap-2">
            {/* Status picker */}
            <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2 py-1">
              <span className="text-xs font-semibold text-gray-500">Estado:</span>
              <select
                value={estado}
                onChange={(e) => openStatusModal(e.target.value)}
                className="text-sm font-semibold text-primary bg-transparent outline-none cursor-pointer"
              >
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>{e}</option>
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
        <div data-tour="backoffice-denuncia-summary" className="bg-white rounded-2xl px-6 py-4 shadow-sm flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-base font-bold text-primary">Denuncia: {denuncia.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-500">Estado:</span>
            <StatusBadge status={estado} />
          </div>
        </div>

        {/* Info + Description */}
        <div data-tour="backoffice-denuncia-details" className="grid grid-cols-2 gap-5">
          <InfoCard title="Información del Denunciante">
            <div className="flex flex-col gap-2">
              <InfoRow label="Desea permanecer anónimo" value={denuncia.anonimo ? 'Sí' : 'No'} />
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <InfoRow label="Nombres" value={denuncia.nombres} />
                <InfoRow label="Apellidos" value={denuncia.apellidos} />
                <InfoRow label="Correo Electrónico" value={denuncia.correo} />
                <InfoRow label="Teléfono de contacto" value={denuncia.telefono} />
              </div>
            </div>
          </InfoCard>

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
                <p className="text-sm text-gray-600 leading-relaxed mt-1">{denuncia.detalleActividad}</p>
              </div>
            </div>
          </InfoCard>
        </div>

        {/* Ubicación */}
        <InfoCard title="Ubicación del Incidente">
          <div className="grid grid-cols-2 gap-x-12 gap-y-2">
            <div className="flex flex-col gap-2">
              <InfoRow label="Fecha de Incidencia" value={denuncia.fecha} />
              <InfoRow label="Coordenadas GPS" value={denuncia.gps} />
              <InfoRow label="Municipio" value={denuncia.municipio} />
            </div>
            <div className="flex flex-col gap-2">
              <InfoRow label="Hora Aproximada" value={denuncia.hora} />
              <InfoRow label="Provincia" value={denuncia.provincia} />
              <InfoRow label="Sector" value={denuncia.sector} />
            </div>
          </div>
        </InfoCard>

        {/* Evidencias */}
        <InfoCard title="Evidencias Adjuntas">
          {denuncia.evidencias.length === 0 ? (
            <p className="text-sm text-gray-400">Sin evidencias adjuntas.</p>
          ) : (
            <div className="flex flex-wrap gap-6">
              {denuncia.evidencias.map((ev, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className={`flex h-14 w-12 items-center justify-center rounded-xl text-xs font-bold ${FILE_COLORS[ev.type] ?? 'bg-gray-100 text-gray-500'}`}>
                    {ev.type}
                  </div>
                  <span className="text-xs text-gray-500 max-w-[80px] text-center truncate">{ev.name}</span>
                </div>
              ))}
            </div>
          )}
        </InfoCard>

        {/* Navigate to monitoring if applicable */}
        {(estado === 'En Monitoreo' || estado === 'Monitorear') && (
          <div className="bg-teal-50 border border-teal-200 rounded-2xl px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-teal-700 font-medium">
              Esta denuncia tiene un plan de monitoreo activo.
            </p>
            <button
              onClick={() => navigate(`/admin/monitoreo/${denuncia.id}`)}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
            >
              Ver monitoreo
            </button>
          </div>
        )}

        {estado === 'En Corrección' && (
          <div className="bg-cyan-50 border border-cyan-200 rounded-2xl px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-cyan-700 font-medium">
              Esta denuncia tiene una acción correctiva en curso.
            </p>
            <button
              onClick={() => navigate('/admin/acciones')}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 transition-colors"
            >
              Ver acción correctiva
            </button>
          </div>
        )}
      </main>

      {/* Status change confirmation */}
      <Modal
        open={statusModal}
        onClose={() => setStatusModal(false)}
        title="Cambiar Estado de Denuncia"
        confirmLabel="Confirmar cambio"
        onConfirm={confirmEstado}
        loading={saving}
      >
        <p>
          ¿Confirmas cambiar el estado de la denuncia{' '}
          <span className="font-semibold text-gray-800">#{denuncia.id}</span> a{' '}
          <span className="font-semibold text-primary">{pendingEstado}</span>?
        </p>
      </Modal>
    </>
  )
}
