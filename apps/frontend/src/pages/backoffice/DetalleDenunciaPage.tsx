import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { Download, FileText } from 'lucide-react'
import BackofficeTopbar from '../../components/backoffice/BackofficeTopbar'
import StatusBadge from '../../components/ui/StatusBadge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Modal from '../../components/ui/Modal'
import { denunciasService, ESTADOS_DENUNCIA, ESTADO_STYLES } from '../../services/denunciasService'
import type { Denuncia, EstadoDenuncia } from '../../services/denunciasService'
import { toast } from '../../utils/toast'
import { descargarBlob } from '../../utils/download'
import { formatDate } from '../../utils/dates'
import { InfoCard, InfoRow } from '../../components/ui/InfoCard'
import HistorialEstados from '../../components/backoffice/HistorialEstados'
import EvidenciaList from '../../components/backoffice/EvidenciaList'

export default function DetalleDenunciaPage() {
  const { id } = useParams()
  const { t } = useTranslation()
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
      const refreshed = await denunciasService.getById(id!)
      setDenuncia(refreshed)
      setEstado(refreshed.Estado)
      toast.success(t('detalleDenuncia.statusUpdated', { status: t(`estados.${pendingEstado}`) }))
      setStatusModal(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('detalleDenuncia.statusError'))
    } finally {
      setSaving(false)
    }
  }

  function exportDenuncia() {
    if (!denuncia) return
    const lines = [
      `${t('detalleDenuncia.exportCode')} ${denuncia.codigo_seguimiento}`,
      `${t('detalleDenuncia.exportStatus')} ${t(`estados.${estado}`)}`,
      `${t('detalleDenuncia.exportDate')} ${formatDate(denuncia.Fecha_denuncia)}`,
      `${t('detalleDenuncia.exportType')} ${t(`tipos.${denuncia.tipo_actividad}`)}`,
      `${t('detalleDenuncia.exportDescription')} ${denuncia.Descripcion}`,
    ]
    descargarBlob(new Blob([lines.join('\n')], { type: 'text/plain' }), `denuncia_${denuncia.codigo_seguimiento}.txt`)
    toast.info(t('denuncias.exportStarted'))
  }

  if (loading) {
    return (
      <>
        <BackofficeTopbar title={t('detalleDenuncia.title')} backTo="/admin/denuncias" />
        <LoadingSpinner fullPage />
      </>
    )
  }

  if (notFound || !denuncia) {
    return (
      <>
        <BackofficeTopbar title={t('detalleDenuncia.title')} backTo="/admin/denuncias" />
        <main className="p-8">
          <p className="text-sm text-gray-400">{t('detalleDenuncia.notFound')}</p>
        </main>
      </>
    )
  }

  return (
    <>
      <BackofficeTopbar
        title={t('detalleDenuncia.title')}
        backTo="/admin/denuncias"
        actions={
          <div data-tour="backoffice-denuncia-status" className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2 py-1">
              <span className="text-xs font-semibold text-gray-500">{t('detalleDenuncia.statusLabel')}</span>
              <select
                value={estado}
                onChange={(e) => openStatusModal(e.target.value as EstadoDenuncia)}
                className="text-sm font-semibold text-primary bg-transparent outline-none cursor-pointer"
              >
                {ESTADOS_DENUNCIA.map((e) => (
                  <option key={e} value={e}>{t(`estados.${e}`)}</option>
                ))}
              </select>
            </div>
            <button
              onClick={exportDenuncia}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              {t('denuncias.export')}
            </button>
          </div>
        }
      />

      <main className="p-8 flex flex-col gap-5">

        {/* Header card */}
        <div data-tour="backoffice-denuncia-summary" className="bg-white rounded-2xl px-6 py-4 shadow-sm flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-base font-bold text-primary">{t('detalleDenuncia.denunciaLabel', { code: denuncia.codigo_seguimiento })}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-500">{t('detalleDenuncia.statusLabel')}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ESTADO_STYLES[estado]}`}>
              {t(`estados.${estado}`)}
            </span>
          </div>
        </div>

        {/* Info cards */}
        <div data-tour="backoffice-denuncia-details" className="grid grid-cols-2 gap-5">
          <InfoCard title={t('detalleDenuncia.incidentInfo')}>
            <div className="flex flex-col gap-2">
              <InfoRow label={t('detalleDenuncia.activityType')} value={t(`tipos.${denuncia.tipo_actividad}`)} />
              <InfoRow
                label={t('detalleDenuncia.incidentDate')}
                value={denuncia.fecha_incidente ? formatDate(denuncia.fecha_incidente) : null}
              />
              <InfoRow label={t('detalleDenuncia.approxTime')} value={denuncia.hora_aproximada} />
              <InfoRow label={t('detalleDenuncia.tipoExtraccion')} value={denuncia.tipo_extraccion} />
              <InfoRow label={t('detalleDenuncia.personasInvolucradas')} value={denuncia.numero_personas} />
              <InfoRow label={t('detalleDenuncia.cantidadArena')} value={denuncia.cantidad_arena} />
              <InfoRow label={t('detalleDenuncia.nivelUrgencia')} value={denuncia.nivel_urgencia} />
              <InfoRow label={t('detalleDenuncia.trackingCode')} value={denuncia.codigo_seguimiento} />
              <InfoRow label={t('detalleDenuncia.fechaRegistro')} value={formatDate(denuncia.Fecha_denuncia)} />
            </div>
          </InfoCard>

          <InfoCard title={t('detalleDenuncia.ubicacionTitle')}>
            <div className="flex flex-col gap-2">
              <InfoRow label={t('detalleDenuncia.coordenadasGPS')} value={denuncia.gps} />
              <InfoRow label={t('detalleDenuncia.detalleUbicacion')} value={denuncia.detalle_ubicacion} />
            </div>
          </InfoCard>
        </div>

        <InfoCard title={t('detalleDenuncia.activityDesc')}>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{denuncia.Descripcion}</p>
        </InfoCard>

        {/* Historial de estados */}
        {denuncia.historial && denuncia.historial.length > 0 && (
          <InfoCard title={t('detalleDenuncia.historyTitle')}>
            <HistorialEstados historial={denuncia.historial} />
          </InfoCard>
        )}

        {/* Evidencias */}
        <InfoCard title={t('detalleDenuncia.evidenceTitle')}>
          <EvidenciaList
            evidencias={denuncia.Evidencia_Denuncia ?? []}
            emptyText={t('detalleDenuncia.noEvidence')}
          />
        </InfoCard>

        {(() => {
          if (denuncia.acciones && denuncia.acciones.length > 0) {
            return (
              <InfoCard title={t('detalleDenuncia.linkedActions')}>
                <div className="flex flex-col gap-2">
                  {denuncia.acciones.map((a) => (
                    <div key={a.IDAccion} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-2.5">
                      <div>
                        <p className="text-sm font-semibold text-primary">{a.titulo}</p>
                        <p className="text-xs text-gray-400">
                          {t(`estados.${a.Estado}`)}
                          {a.FechaPlanificacion ? ` · ${formatDate(a.FechaPlanificacion)}` : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/admin/acciones/${a.IDAccion}`)}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        {t('detalleDenuncia.viewAction')}
                      </button>
                    </div>
                  ))}
                </div>
              </InfoCard>
            )
          }

          if (estado === 'Verificada' || estado === 'En_Investigacion') {
            return (
              <div className="bg-cyan-50 border border-cyan-200 rounded-2xl px-6 py-4 flex items-center justify-between">
                <p className="text-sm text-cyan-700 font-medium">
                  {t('detalleDenuncia.relatedActions')}
                </p>
                <button
                  onClick={() => navigate('/admin/acciones')}
                  className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 transition-colors"
                >
                  {t('detalleDenuncia.viewActions')}
                </button>
              </div>
            )
          }

          return null
        })()}
      </main>

      {/* Status change confirmation */}
      <Modal
        open={statusModal}
        onClose={() => setStatusModal(false)}
        title={t('detalleDenuncia.changeStatusTitle')}
        confirmLabel={t('detalleDenuncia.changeStatusConfirm')}
        onConfirm={confirmEstado}
        loading={saving}
      >
        <div className="flex flex-col gap-4">
          <p>
            {t('detalleDenuncia.changeStatusMsg', { code: denuncia.codigo_seguimiento, status: t(`estados.${pendingEstado}`) })}
          </p>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">{t('detalleDenuncia.commentLabel')}</label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              placeholder={t('detalleDenuncia.commentPlaceholder')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
            />
          </div>
        </div>
      </Modal>
    </>
  )
}
