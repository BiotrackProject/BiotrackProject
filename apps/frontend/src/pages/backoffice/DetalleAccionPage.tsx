import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Download, FileText, User, Calendar, ClipboardList, Paperclip, Globe, Lock } from 'lucide-react'
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
  const [exporting, setExporting] = useState(false)
  const [publishModal, setPublishModal] = useState(false)
  const [resumenPublico, setResumenPublico] = useState('')
  const [publishing, setPublishing] = useState(false)

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

  async function handleExport(formato: 'PDF' | 'XLSX') {
    if (!accion) return
    setExporting(true)
    try {
      await accionesService.exportar(accion.IDAccion, formato, formato === 'PDF')
      toast.success(`Reporte ${formato} descargado`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al exportar')
    } finally {
      setExporting(false)
    }
  }

  async function handlePublishToggle() {
    if (!accion) return
    if (accion.visibilidad === 'Publico') {
      try {
        const updated = await accionesService.despublicar(accion.IDAccion)
        setAccion({ ...accion, visibilidad: updated.visibilidad })
        toast.success('Reporte despublicado')
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Error al despublicar')
      }
      return
    }
    setResumenPublico(accion.resumen_publico ?? '')
    setPublishModal(true)
  }

  async function handleConfirmPublish() {
    if (!accion) return
    if (resumenPublico.trim().length < 10) {
      toast.error('El resumen público debe tener al menos 10 caracteres.')
      return
    }
    setPublishing(true)
    try {
      const updated = await accionesService.publicar(accion.IDAccion, resumenPublico.trim())
      setAccion({ ...accion, visibilidad: updated.visibilidad, resumen_publico: updated.resumen_publico })
      toast.success('Reporte publicado')
      setPublishModal(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al publicar')
    } finally {
      setPublishing(false)
    }
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
          <div data-tour="backoffice-accion-status" className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStatusModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              Cambiar Estado
            </button>
            <button
              onClick={handlePublishToggle}
              className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                accion.visibilidad === 'Publico'
                  ? 'border-amber-500 text-amber-600 hover:bg-amber-50'
                  : 'border-sky-500 text-sky-600 hover:bg-sky-50'
              }`}
            >
              {accion.visibilidad === 'Publico' ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
              {accion.visibilidad === 'Publico' ? 'Despublicar' : 'Publicar'}
            </button>
            <button
              onClick={() => handleExport('PDF')}
              disabled={exporting}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              PDF
            </button>
            <button
              onClick={() => handleExport('XLSX')}
              disabled={exporting}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              XLSX
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

        {/* Evidencias */}
        {(accion.Evidencia_Accion?.length ?? 0) > 0 && (
          <InfoCard title="Evidencias" icon={Paperclip}>
            <div className="flex flex-col gap-2">
              {accion.Evidencia_Accion!.map((ev) => (
                <a
                  key={ev.IDEvidencia}
                  href={ev.archivo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-2.5 hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2 text-sm text-gray-700">
                    <FileText className="h-4 w-4 text-gray-400" />
                    {ev.TipoArchivo}
                    {ev.tamano_bytes ? <span className="text-xs text-gray-400">· {(ev.tamano_bytes / 1024 / 1024).toFixed(2)} MB</span> : null}
                  </span>
                  <span className="text-xs font-semibold text-primary">Abrir</span>
                </a>
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

      {/* Publish modal */}
      <Modal
        open={publishModal}
        onClose={() => setPublishModal(false)}
        title="Publicar reporte"
        confirmLabel="Publicar"
        onConfirm={handleConfirmPublish}
        loading={publishing}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            El reporte será accesible públicamente sin necesidad de iniciar sesión. No se exponen datos personales.
          </p>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">Resumen público (10–500 caracteres)</label>
            <textarea
              value={resumenPublico}
              onChange={(e) => setResumenPublico(e.target.value)}
              maxLength={500}
              className="min-h-[100px] rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              placeholder="Versión simplificada para el público general"
            />
          </div>
        </div>
      </Modal>
    </>
  )
}
