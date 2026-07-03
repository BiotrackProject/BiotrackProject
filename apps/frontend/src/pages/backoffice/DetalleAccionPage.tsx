import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { Download, FileText, User, Calendar, ClipboardList } from 'lucide-react'
import BackofficeTopbar from '../../components/backoffice/BackofficeTopbar'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Modal from '../../components/ui/Modal'
import { accionesService, ESTADOS_ACCION, ESTADO_ACCION_STYLES } from '../../services/accionesService'
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
  const { t } = useTranslation()
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
      toast.success(t('acciones.statusUpdated', { status: t('estados.' + nuevoEstado) }))
      setStatusModal(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('acciones.statusUpdateError'))
    } finally {
      setSaving(false)
    }
  }

  function exportAccion() {
    if (!accion) return
    const lines = [
      `${t('acciones.exportActionTitle')} ${accion.IDAccion}`,
      `${t('acciones.exportTitleField')} ${accion.titulo}`,
      `${t('acciones.exportStatusField')} ${t('estados.' + accion.Estado)}`,
      `${t('acciones.exportPlannedDate')} ${accion.FechaPlanificacion ? new Date(accion.FechaPlanificacion).toLocaleDateString('es-DO') : 'N/A'}`,
      `${t('acciones.exportImplDate')} ${accion.FechaImplementacion ? new Date(accion.FechaImplementacion).toLocaleDateString('es-DO') : 'N/A'}`,
      `${t('acciones.exportResponsibleField')} ${accion.responsable?.nombre_completo ?? 'N/A'}`,
      `${t('acciones.exportDescriptionField')} ${accion.descripcion_accion ?? 'N/A'}`,
      `${t('acciones.exportResultField')} ${accion.Resultado ?? 'N/A'}`,
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `accion_${accion.IDAccion.slice(-8)}.txt`; a.click()
    URL.revokeObjectURL(url)
    toast.info(t('acciones.exportStarted'))
  }

  if (loading) {
    return (
      <>
        <BackofficeTopbar title={t('acciones.detailTitle')} backTo="/admin/acciones" />
        <LoadingSpinner fullPage />
      </>
    )
  }

  if (notFound || !accion) {
    return (
      <>
        <BackofficeTopbar title={t('acciones.detailTitle')} backTo="/admin/acciones" />
        <main className="p-8">
          <p className="text-sm text-gray-400">{t('acciones.notFound')}</p>
        </main>
      </>
    )
  }

  const denunciasRelacionadas = accion.accion_denuncia ?? []

  return (
    <>
      <BackofficeTopbar
        title={t('acciones.detailTitle')}
        backTo="/admin/acciones"
        actions={
          <div data-tour="backoffice-accion-status" className="flex items-center gap-2">
            <button
              onClick={() => setStatusModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              {t('acciones.changeStatusBtn')}
            </button>
            <button
              onClick={exportAccion}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              {t('acciones.export')}
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
            <span className="text-sm font-semibold text-gray-500">{t('acciones.statusLabel')}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ESTADO_ACCION_STYLES[accion.Estado]}`}>
              {t('estados.' + accion.Estado)}
            </span>
          </div>
        </div>

        <div data-tour="backoffice-accion-details" className="grid grid-cols-2 gap-5">
          {/* Información general */}
          <InfoCard title={t('acciones.generalInfo')} icon={FileText}>
            <div className="flex flex-col gap-2">
              <InfoRow label={t('acciones.plannedDate')} value={accion.FechaPlanificacion ? new Date(accion.FechaPlanificacion).toLocaleDateString('es-DO') : null} />
              <InfoRow label={t('acciones.implementationDate')} value={accion.FechaImplementacion ? new Date(accion.FechaImplementacion).toLocaleDateString('es-DO') : null} />
              <InfoRow label={t('acciones.visibility')} value={accion.visibilidad} />
              <InfoRow label={t('acciones.budget')} value={accion.Presupuesto} />
            </div>
          </InfoCard>

          {/* Responsable */}
          <InfoCard title={t('acciones.responsible')} icon={User}>
            <div className="flex flex-col gap-2">
              <InfoRow label={t('acciones.responsibleName')} value={accion.responsable?.nombre_completo} />
              <InfoRow label={t('acciones.actionStatus')} value={t('estados.' + accion.Estado)} />
            </div>
          </InfoCard>
        </div>

        {/* Descripción */}
        <InfoCard title={t('acciones.description')} icon={FileText}>
          <p className="text-sm text-gray-600 leading-relaxed">{accion.descripcion_accion ?? '—'}</p>
        </InfoCard>

        {/* Resultado */}
        {accion.Resultado && (
          <InfoCard title={t('acciones.result')} icon={Calendar}>
            <p className="text-sm text-gray-600 leading-relaxed">{accion.Resultado}</p>
          </InfoCard>
        )}

        {/* Denuncias relacionadas */}
        {denunciasRelacionadas.length > 0 && (
          <InfoCard title={t('acciones.relatedComplaints')}>
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
                    {t('acciones.viewComplaint')}
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
        title={t('acciones.changeStatusActionTitle')}
        confirmLabel={t('acciones.changeStatusActionSave')}
        onConfirm={handleSaveEstado}
        loading={saving}
      >
        <div className="flex flex-col gap-4">
          <p>{t('acciones.changeStatusActionMsg', { title: accion.titulo })}</p>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">{t('acciones.statusFieldLabel')}</label>
            <select
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value as EstadoAccion)}
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            >
              {ESTADOS_ACCION.map((e) => (
                <option key={e} value={e}>{t('estados.' + e)}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </>
  )
}
