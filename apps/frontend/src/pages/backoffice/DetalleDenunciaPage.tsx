import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Download, FileText } from 'lucide-react'
import BackofficeTopbar from '../../components/backoffice/BackofficeTopbar'
import StatusBadge from '../../components/ui/StatusBadge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Modal from '../../components/ui/Modal'
import { denunciasService, ESTADOS_DENUNCIA, ESTADO_LABEL, ESTADO_STYLES, TIPO_LABEL } from '../../services/denunciasService'
import type { Denuncia, EstadoDenuncia } from '../../services/denunciasService'
import { toast } from '../../utils/toast'

const FILE_COLORS: Record<string, string> = {
  JPG: 'bg-blue-100 text-blue-600',
  MP3: 'bg-orange-100 text-orange-600',
  MP4: 'bg-purple-100 text-purple-600',
  PDF: 'bg-red-100 text-red-600',
  PNG: 'bg-green-100 text-green-600',
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <p className="text-sm text-gray-600">
      <span className="font-semibold text-gray-700">{label}: </span>
      {value ?? '—'}
    </p>
  )
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
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

  const [denuncia, setDenuncia] = useState<Denuncia | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [estado, setEstado] = useState<EstadoDenuncia>('Pendiente')
  const [statusModal, setStatusModal] = useState(false)
  const [pendingEstado, setPendingEstado] = useState<EstadoDenuncia>('Pendiente')
  const [comentario, setComentario] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    denunciasService.getById(id!)
      .then((d) => { setDenuncia(d); setEstado(d.Estado) })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  function openStatusModal(nuevoEstado: EstadoDenuncia) {
    setPendingEstado(nuevoEstado)
    setComentario('')
    setStatusModal(true)
  }

  async function confirmEstado() {
    setSaving(true)
    try {
      const { Estado } = await denunciasService.cambiarEstado(id!, pendingEstado, comentario || undefined)
      setEstado(Estado)
      // Refrescamos para reflejar la nueva entrada del historial junto al estado.
      const refreshed = await denunciasService.getById(id!)
      setDenuncia(refreshed)
      setEstado(refreshed.Estado)
      toast.success(`Estado actualizado a "${ESTADO_LABEL[pendingEstado]}"`)
      setStatusModal(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar estado')
    } finally {
      setSaving(false)
    }
  }

  function exportDenuncia() {
    if (!denuncia) return
    const lines = [
      `Código: ${denuncia.codigo_seguimiento}`,
      `Estado: ${ESTADO_LABEL[estado]}`,
      `Fecha: ${new Date(denuncia.Fecha_denuncia).toLocaleDateString('es-DO')}`,
      `Tipo: ${TIPO_LABEL[denuncia.tipo_actividad]}`,
      `Descripción: ${denuncia.Descripcion}`,
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `denuncia_${denuncia.codigo_seguimiento}.txt`; a.click()
    URL.revokeObjectURL(url)
    toast.info('Exportación iniciada')
  }

  if (loading) {
    return (
      <>
        <BackofficeTopbar title="Detalle de Denuncia" backTo="/admin/denuncias" />
        <LoadingSpinner fullPage />
      </>
    )
  }

  if (notFound || !denuncia) {
    return (
      <>
        <BackofficeTopbar title="Detalle de Denuncia" backTo="/admin/denuncias" />
        <main className="p-8">
          <p className="text-sm text-gray-400">Denuncia no encontrada.</p>
        </main>
      </>
    )
  }

  return (
    <>
      <BackofficeTopbar
        title="Detalle de Denuncia"
        backTo="/admin/denuncias"
        actions={
          <div data-tour="backoffice-denuncia-status" className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2 py-1">
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
        <div data-tour="backoffice-denuncia-summary" className="bg-white rounded-2xl px-6 py-4 shadow-sm flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-base font-bold text-primary">Denuncia: {denuncia.codigo_seguimiento}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-500">Estado:</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ESTADO_STYLES[estado]}`}>
              {ESTADO_LABEL[estado]}
            </span>
          </div>
        </div>

        {/* Info cards */}
        <div data-tour="backoffice-denuncia-details" className="grid grid-cols-2 gap-5">
          <InfoCard title="Información del Incidente">
            <div className="flex flex-col gap-2">
              <InfoRow label="Tipo de actividad" value={TIPO_LABEL[denuncia.tipo_actividad]} />
              <InfoRow
                label="Fecha de incidente"
                value={denuncia.fecha_incidente ? new Date(denuncia.fecha_incidente).toLocaleDateString('es-DO') : null}
              />
              <InfoRow label="Hora aproximada" value={denuncia.hora_aproximada} />
              <InfoRow label="Tipo de extracción" value={denuncia.tipo_extraccion} />
              <InfoRow label="Personas involucradas" value={denuncia.numero_personas} />
              <InfoRow label="Cantidad estimada de arena" value={denuncia.cantidad_arena} />
              <InfoRow label="Nivel de urgencia" value={denuncia.nivel_urgencia} />
              <InfoRow label="Código de seguimiento" value={denuncia.codigo_seguimiento} />
              <InfoRow label="Fecha de registro" value={new Date(denuncia.Fecha_denuncia).toLocaleDateString('es-DO')} />
            </div>
          </InfoCard>

          <InfoCard title="Ubicación del Incidente">
            <div className="flex flex-col gap-2">
              <InfoRow label="Coordenadas GPS" value={denuncia.gps} />
              <InfoRow label="Detalle de la ubicación" value={denuncia.detalle_ubicacion} />
            </div>
          </InfoCard>
        </div>

        <InfoCard title="Descripción de la Actividad">
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{denuncia.Descripcion}</p>
        </InfoCard>

        {/* Historial de estados */}
        {denuncia.historial && denuncia.historial.length > 0 && (
          <InfoCard title="Historial de Estados">
            <div className="flex flex-col gap-3">
              {denuncia.historial.map((h) => (
                <div key={h.id} className="flex items-start gap-3 text-sm">
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ESTADO_STYLES[h.estado_anterior]}`}>
                        {ESTADO_LABEL[h.estado_anterior]}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ESTADO_STYLES[h.estado_nuevo]}`}>
                        {ESTADO_LABEL[h.estado_nuevo]}
                      </span>
                    </div>
                    {h.comentario && <p className="text-xs text-gray-500 mt-1">{h.comentario}</p>}
                    <p className="text-xs text-gray-400">
                      {h.Usuario.nombre_completo} · {new Date(h.created_at).toLocaleString('es-DO')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </InfoCard>
        )}

        {/* Evidencias */}
        <InfoCard title="Evidencias Adjuntas">
          {!denuncia.Evidencia_Denuncia || denuncia.Evidencia_Denuncia.length === 0 ? (
            <p className="text-sm text-gray-400">Sin evidencias adjuntas.</p>
          ) : (
            <div className="flex flex-wrap gap-6">
              {denuncia.Evidencia_Denuncia.map((ev) => {
                const ext = ev.TipoArchivo.toUpperCase()
                return (
                  <a key={ev.IDEvidencia} href={ev.archivo_url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2">
                    <div className={`flex h-14 w-12 items-center justify-center rounded-xl text-xs font-bold ${FILE_COLORS[ext] ?? 'bg-gray-100 text-gray-500'}`}>
                      {ext}
                    </div>
                    <span className="text-xs text-gray-500 max-w-[80px] text-center truncate">{ev.archivo_url.split('/').pop()}</span>
                  </a>
                )
              })}
            </div>
          )}
        </InfoCard>

        {/* Acción correctiva link */}
        {(estado === 'Verificada' || estado === 'En_Investigacion') && (
          <div className="bg-cyan-50 border border-cyan-200 rounded-2xl px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-cyan-700 font-medium">
              Esta denuncia tiene acciones correctivas asociadas.
            </p>
            <button
              onClick={() => navigate('/admin/acciones')}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 transition-colors"
            >
              Ver acciones
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
        <div className="flex flex-col gap-4">
          <p>
            ¿Confirmas cambiar el estado de la denuncia{' '}
            <span className="font-semibold text-gray-800">{denuncia.codigo_seguimiento}</span> a{' '}
            <span className="font-semibold text-primary">{ESTADO_LABEL[pendingEstado]}</span>?
          </p>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">Comentario (opcional)</label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              placeholder="Motivo del cambio de estado..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
            />
          </div>
        </div>
      </Modal>
    </>
  )
}
