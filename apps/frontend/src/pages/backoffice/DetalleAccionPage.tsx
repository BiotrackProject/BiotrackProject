import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { Download, FileText, User, Calendar, ClipboardList, Paperclip, Globe, Lock } from 'lucide-react'
import BackofficeTopbar from '../../components/backoffice/BackofficeTopbar'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Modal from '../../components/ui/Modal'
import { accionesService, ESTADOS_ACCION, ESTADO_ACCION_STYLES } from '../../services/accionesService'
import type { Accion, EstadoAccion } from '../../services/accionesService'
import { toast } from '../../utils/toast'
import { formatDate } from '../../utils/dates'
import { InfoCard, InfoRow } from '../../components/ui/InfoCard'

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
      toast.success(t('acciones.statusUpdated', { status: t(`estados.${nuevoEstado}`) }))
      setStatusModal(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('acciones.statusUpdateError'))
    } finally {
      setSaving(false)
    }
  }

  async function handleExport(formato: 'PDF' | 'XLSX') {
    if (!accion) return
    setExporting(true)
    try {
      await accionesService.exportar(accion.IDAccion, formato, formato === 'PDF')
      toast.success(t('acciones.exportSuccess', { format: formato }))
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('acciones.exportError'))
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
        toast.success(t('acciones.unpublished'))
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : t('acciones.unpublishError'))
      }
      return
    }
    setResumenPublico(accion.resumen_publico ?? '')
    setPublishModal(true)
  }

  async function handleConfirmPublish() {
    if (!accion) return
    if (resumenPublico.trim().length < 10) {
      toast.error(t('acciones.publishSummaryMin'))
      return
    }
    setPublishing(true)
    try {
      const updated = await accionesService.publicar(accion.IDAccion, resumenPublico.trim())
      setAccion({ ...accion, visibilidad: updated.visibilidad, resumen_publico: updated.resumen_publico })
      toast.success(t('acciones.published'))
      setPublishModal(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('acciones.publishError'))
    } finally {
      setPublishing(false)
    }
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
          <div data-tour="backoffice-accion-status" className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStatusModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              {t('acciones.changeStatusBtn')}
            </button>
            <button
              onClick={() => { void handlePublishToggle() }}
              className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                accion.visibilidad === 'Publico'
                  ? 'border-amber-500 text-amber-600 hover:bg-amber-50'
                  : 'border-sky-500 text-sky-600 hover:bg-sky-50'
              }`}
            >
              {accion.visibilidad === 'Publico' ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
              {accion.visibilidad === 'Publico' ? t('acciones.unpublish') : t('acciones.publish')}
            </button>
            <button
              onClick={() => { void handleExport('PDF') }}
              disabled={exporting}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              PDF
            </button>
            <button
              onClick={() => { void handleExport('XLSX') }}
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
            <span className="text-sm font-semibold text-gray-500">{t('acciones.statusLabel')}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ESTADO_ACCION_STYLES[accion.Estado]}`}>
              {t(`estados.${accion.Estado}`)}
            </span>
          </div>
        </div>

        <div data-tour="backoffice-accion-details" className="grid grid-cols-2 gap-5">
          {/* Información general */}
          <InfoCard title={t('acciones.generalInfo')} icon={FileText}>
            <div className="flex flex-col gap-2">
              <InfoRow label={t('acciones.plannedDate')} value={formatDate(accion.FechaPlanificacion)} />
              <InfoRow label={t('acciones.implementationDate')} value={formatDate(accion.FechaImplementacion)} />
              <InfoRow label={t('acciones.visibility')} value={accion.visibilidad} />
              <InfoRow label={t('acciones.budget')} value={accion.Presupuesto} />
            </div>
          </InfoCard>

          {/* Responsable */}
          <InfoCard title={t('acciones.responsible')} icon={User}>
            <div className="flex flex-col gap-2">
              <InfoRow label={t('acciones.responsibleName')} value={accion.responsable?.nombre_completo} />
              <InfoRow label={t('acciones.actionStatus')} value={t(`estados.${accion.Estado}`)} />
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
                    <p className="text-xs text-gray-400">{t(`tipos.${d.tipo_actividad}`)} · {t(`estados.${d.Estado}`)}</p>
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

        {/* Evidencias */}
        {(accion.Evidencia_Accion?.length ?? 0) > 0 && (
          <InfoCard title={t('acciones.evidence')} icon={Paperclip}>
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
                  <span className="text-xs font-semibold text-primary">{t('acciones.open')}</span>
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
        title={t('acciones.changeStatusActionTitle')}
        confirmLabel={t('acciones.changeStatusActionSave')}
        onConfirm={() => { void handleSaveEstado() }}
        loading={saving}
      >
        <div className="flex flex-col gap-4">
          <p>{t('acciones.changeStatusActionMsg', { title: accion.titulo })}</p>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="accion-nuevo-estado" className="text-xs font-semibold text-gray-600">{t('acciones.statusFieldLabel')}</label>
            <select
              id="accion-nuevo-estado"
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
      </Modal>

      {/* Publish modal */}
      <Modal
        open={publishModal}
        onClose={() => setPublishModal(false)}
        title={t('acciones.publishModalTitle')}
        confirmLabel={t('acciones.publish')}
        onConfirm={() => { void handleConfirmPublish() }}
        loading={publishing}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            {t('acciones.publishModalMsg')}
          </p>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="accion-resumen-publico" className="text-xs font-semibold text-gray-600">{t('acciones.publicSummaryLabel')}</label>
            <textarea
              id="accion-resumen-publico"
              value={resumenPublico}
              onChange={(e) => setResumenPublico(e.target.value)}
              maxLength={500}
              className="min-h-[100px] rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              placeholder={t('acciones.publicSummaryPlaceholder')}
            />
          </div>
        </div>
      </Modal>
    </>
  )
}
