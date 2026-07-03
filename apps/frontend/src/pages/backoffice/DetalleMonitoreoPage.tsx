// @ts-nocheck
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { Download, FileText, Map, BarChart2 } from 'lucide-react'
import BackofficeTopbar from '../../components/backoffice/BackofficeTopbar'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { monitoreoService } from '../../services/monitoreoService'
import { ESTADO_STYLES, ESTADOS_DENUNCIA } from '../../services/denunciasService'
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
  const { t } = useTranslation()
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
      toast.success(t('monitoreo.statusUpdated', { status: t('estados.' + pendingEstado) }))
      setStatusModal(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('monitoreo.statusError'))
    } finally {
      setSavingEstado(false)
    }
  }

  function guardarNota() {
    if (!nota.trim()) return
    setNotaGuardada(true)
    toast.success(t('monitoreo.noteSuccess'))
    setTimeout(() => setNotaGuardada(false), 2000)
  }

  function exportDenuncia() {
    if (!denuncia) return
    const lines = [
      `${t('detalleDenuncia.exportCode')} ${denuncia.codigo_seguimiento}`,
      `${t('detalleDenuncia.exportStatus')} ${t('estados.' + estado)}`,
      `${t('detalleDenuncia.exportType')} ${t('tipos.' + denuncia.tipo_actividad)}`,
      `${t('detalleDenuncia.exportDate')} ${new Date(denuncia.Fecha_denuncia).toLocaleDateString('es-DO')}`,
      `${t('detalleDenuncia.exportDescription')} ${denuncia.Descripcion}`,
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `monitoreo_${denuncia.codigo_seguimiento}.txt`; a.click()
    URL.revokeObjectURL(url)
    toast.info(t('monitoreo.exportStarted'))
  }

  if (loading) return (
    <>
      <BackofficeTopbar title={t('monitoreo.zoneTitle')} backTo="/admin/monitoreo" />
      <LoadingSpinner fullPage />
    </>
  )

  if (notFound || !denuncia) return (
    <>
      <BackofficeTopbar title={t('monitoreo.zoneTitle')} backTo="/admin/monitoreo" />
      <main className="p-8"><p className="text-sm text-gray-400">{t('monitoreo.notFound')}</p></main>
    </>
  )

  return (
    <>
      <BackofficeTopbar
        title={t('monitoreo.zoneTitle')}
        backTo="/admin/monitoreo"
        actions={
          <div data-tour="backoffice-topbar-actions" className="flex items-center gap-2">
            <div data-tour="backoffice-monitoreo-status" className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2 py-1">
              <span className="text-xs font-semibold text-gray-500">{t('monitoreo.statusLabel')}</span>
              <select
                value={estado}
                onChange={(e) => openStatusModal(e.target.value as EstadoDenuncia)}
                className="text-sm font-semibold text-primary bg-transparent outline-none cursor-pointer"
              >
                {ESTADOS_DENUNCIA.map((e) => (
                  <option key={e} value={e}>{t('estados.' + e)}</option>
                ))}
              </select>
            </div>
            <button
              onClick={exportDenuncia}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              {t('common.export')}
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
            <span className="text-sm font-semibold text-gray-500">{t('monitoreo.statusLabel')}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ESTADO_STYLES[estado]}`}>
              {t('estados.' + estado)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-500">{t('monitoreo.typeLabel')}</span>
            <span className="text-sm text-gray-600">{t('tipos.' + denuncia.tipo_actividad)}</span>
          </div>
        </div>

        {/* Two-column layout */}
        <div data-tour="backoffice-monitoreo-details" className="grid grid-cols-[1fr_1fr] gap-5">
          <div className="flex flex-col gap-5">
            <InfoCard title={t('monitoreo.incidentInfo')}>
              <div className="flex flex-col gap-2">
                <InfoRow label={t('monitoreo.codeLabel')} value={denuncia.codigo_seguimiento} />
                <InfoRow label={t('monitoreo.incidentDate')} value={new Date(denuncia.Fecha_denuncia).toLocaleDateString('es-DO')} />
                <InfoRow label={t('monitoreo.approxTime')} value={denuncia.hora_aproximada} />
                <InfoRow label={t('monitoreo.activityType')} value={t('tipos.' + denuncia.tipo_actividad)} />
              </div>
            </InfoCard>

            {/* Evidencias */}
            <InfoCard title={t('monitoreo.evidenceTitle')}>
              {!denuncia.Evidencia_Denuncia || denuncia.Evidencia_Denuncia.length === 0 ? (
                <p className="text-sm text-gray-400">{t('monitoreo.noEvidence')}</p>
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
              <InfoCard title={t('monitoreo.historyTitle')}>
                <div className="flex flex-col gap-2">
                  {denuncia.historial.map((h) => (
                    <div key={h.id} className="text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ESTADO_STYLES[h.estado_anterior]}`}>{t('estados.' + h.estado_anterior)}</span>
                        <span className="text-gray-400">→</span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ESTADO_STYLES[h.estado_nuevo]}`}>{t('estados.' + h.estado_nuevo)}</span>
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
            <InfoCard title={t('monitoreo.activityDesc')}>
              <p className="text-sm text-gray-600 leading-relaxed">{denuncia.Descripcion}</p>
            </InfoCard>

            {/* Nota */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-primary mb-3">{t('monitoreo.addNote')}</h3>
              <textarea
                rows={4}
                placeholder={t('monitoreo.notePlaceholder')}
                value={nota}
                onChange={(e) => { setNota(e.target.value); setNotaGuardada(false) }}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 outline-none resize-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
              {notaGuardada && <p className="text-xs text-emerald-600 mt-1">{t('monitoreo.noteSaved')}</p>}
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={() => { setNota(''); setNotaGuardada(false) }} className="rounded-lg border border-gray-200 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">{t('monitoreo.clearNote')}</button>
                <button onClick={guardarNota} className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">{t('monitoreo.saveNote')}</button>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-primary mb-3">{t('monitoreo.actionsTitle')}</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setAnalisisModal(true)}
                  className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
                >
                  <BarChart2 className="h-4 w-4" /> {t('monitoreo.analysisBtn')}
                </button>
                <button
                  onClick={() => setMapModal(true)}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                >
                  <Map className="h-4 w-4" /> {t('monitoreo.viewMapBtn')}
                </button>
                <button
                  onClick={() => navigate('/admin/acciones')}
                  className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
                >
                  {t('monitoreo.correctiveAction')}
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
        title={t('monitoreo.changeStatus')}
        confirmLabel={t('monitoreo.confirmBtn')}
        onConfirm={confirmEstado}
        loading={savingEstado}
      >
        <p>{t('detalleDenuncia.changeStatusMsg', { code: denuncia.codigo_seguimiento, status: t('estados.' + pendingEstado) })}</p>
      </Modal>

      {/* Análisis placeholder */}
      <Modal open={analisisModal} onClose={() => setAnalisisModal(false)} title={t('monitoreo.analysisTitle')} confirmLabel={t('monitoreo.closeBtn')} onConfirm={() => setAnalisisModal(false)}>
        <p className="text-sm text-gray-500">{t('monitoreo.analysisPlaceholder')}</p>
      </Modal>

      {/* Mapa placeholder */}
      <Modal open={mapModal} onClose={() => setMapModal(false)} title={t('monitoreo.mapTitle')} confirmLabel={t('monitoreo.closeBtn')} onConfirm={() => setMapModal(false)}>
        <p className="text-sm text-gray-500">{t('monitoreo.mapPlaceholder')}</p>
        <button onClick={() => { setMapModal(false); navigate('/admin/mapa') }} className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
          {t('monitoreo.goToMap')}
        </button>
      </Modal>
    </>
  )
}
