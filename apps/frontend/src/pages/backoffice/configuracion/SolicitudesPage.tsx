import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Check, X as XIcon, UserCheck } from 'lucide-react'
import BackofficeTopbar from '../../../components/backoffice/BackofficeTopbar'
import Modal from '../../../components/ui/Modal'
import EmptyState from '../../../components/ui/EmptyState'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import { usuariosService } from '../../../services/usuariosService'
import type { SolicitudRegistro, Rol } from '../../../services/usuariosService'
import { toast } from '../../../utils/toast'
import i18n from '../../../i18n'

const ESTADO_STYLES: Record<string, string> = {
  Pendiente_Aprobacion: 'bg-amber-50 text-amber-600 border border-amber-200',
  Pendiente_Info: 'bg-amber-50 text-amber-600 border border-amber-200',
  Aprobada: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  Rechazada: 'bg-red-50 text-red-600 border border-red-200',
}

function isPendiente(estado: string) {
  return estado === 'Pendiente_Aprobacion' || estado === 'Pendiente_Info'
}

function getInitials(nombre_completo: string) {
  return nombre_completo.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}

function formatFecha(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-DO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function EstadoBadge({ estado }: Readonly<{ estado: string }>) {
  const { t } = useTranslation()
  const ESTADO_LABEL: Record<string, string> = {
    Pendiente_Aprobacion: t('solicitudes.statusPending'),
    Pendiente_Info: t('solicitudes.statusPendingInfo'),
    Aprobada: t('solicitudes.statusApproved'),
    Rechazada: t('solicitudes.statusRejected'),
  }
  const style = ESTADO_STYLES[estado] ?? 'bg-gray-100 text-gray-500 border border-gray-200'
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
      {ESTADO_LABEL[estado] ?? estado}
    </span>
  )
}

function fieldCls(err?: string) {
  return `w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors ${err ? 'border-action focus:border-action' : 'border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20'}`
}

const EMPTY_APROBAR = { rol_id: '', contrasena: '', comentario: '' }

export default function SolicitudesPage() {
  const { t } = useTranslation()
  const [solicitudes, setSolicitudes] = useState<SolicitudRegistro[]>([])
  const [roles, setRoles] = useState<Rol[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('Pendientes')
  const [saving, setSaving] = useState(false)

  const COLUMNS = [
    t('solicitudes.colApplicant'),
    t('solicitudes.colEmail'),
    t('solicitudes.colPosition'),
    t('solicitudes.colStatus'),
    t('solicitudes.colDate'),
    t('solicitudes.colActions'),
  ]

  const ESTADO_TABS = [
    { key: 'Pendientes', label: t('solicitudes.tabPending') },
    { key: 'Aprobada',   label: t('solicitudes.tabApproved') },
    { key: 'Rechazada',  label: t('solicitudes.tabRejected') },
    { key: '',           label: t('solicitudes.tabAll') },
  ]

  // Aprobar modal
  const [aprobarModal, setAprobarModal] = useState<{ open: boolean; solicitud: SolicitudRegistro | null }>({ open: false, solicitud: null })
  const [aprobarForm, setAprobarForm] = useState(EMPTY_APROBAR)
  const [aprobarErrors, setAprobarErrors] = useState<Record<string, string>>({})

  // Rechazar modal
  const [rechazarModal, setRechazarModal] = useState<{ open: boolean; solicitud: SolicitudRegistro | null }>({ open: false, solicitud: null })
  const [rechazarComentario, setRechazarComentario] = useState('')

  useEffect(() => {
    Promise.all([usuariosService.getSolicitudes(), usuariosService.getRoles()])
      .then(([s, r]) => { setSolicitudes(s); setRoles(r) })
      .catch(() => toast.error(t('solicitudes.loadError')))
      .finally(() => setLoading(false))
  }, [t])

  const counts = useMemo(() => ({
    Pendientes: solicitudes.filter((s) => isPendiente(s.estado)).length,
    Aprobada: solicitudes.filter((s) => s.estado === 'Aprobada').length,
    Rechazada: solicitudes.filter((s) => s.estado === 'Rechazada').length,
    '': solicitudes.length,
  }), [solicitudes])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return solicitudes
      .filter((s) => {
        if (tab === 'Pendientes') return isPendiente(s.estado)
        if (tab) return s.estado === tab
        return true
      })
      .filter((s) =>
        !q ||
        s.nombre_completo.toLowerCase().includes(q) ||
        s.correo_electronico.toLowerCase().includes(q)
      )
  }, [solicitudes, query, tab])

  function openAprobar(solicitud: SolicitudRegistro) {
    setAprobarForm({ ...EMPTY_APROBAR, rol_id: roles[0]?.id ?? '' })
    setAprobarErrors({})
    setAprobarModal({ open: true, solicitud })
  }

  function validateAprobar() {
    const errs: Record<string, string> = {}
    if (!aprobarForm.rol_id) errs.rol_id = t('solicitudes.validationRole')
    if (!aprobarForm.contrasena.trim() || aprobarForm.contrasena.length < 8) errs.contrasena = t('solicitudes.validationPassword')
    setAprobarErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleAprobar() {
    if (!validateAprobar()) return
    const { solicitud } = aprobarModal
    if (!solicitud) return
    setSaving(true)
    try {
      await usuariosService.revisarSolicitud(solicitud.id, {
        accion: 'Aprobada',
        rol_id: aprobarForm.rol_id,
        contrasena: aprobarForm.contrasena,
        comentario: aprobarForm.comentario || undefined,
      })
      setSolicitudes((prev) => prev.map((s) => s.id === solicitud.id ? { ...s, estado: 'Aprobada', comentario_admin: aprobarForm.comentario || null } : s))
      toast.success(t('solicitudes.approvedMsg', { name: solicitud.nombre_completo }))
      setAprobarModal({ open: false, solicitud: null })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('solicitudes.approveError'))
    } finally {
      setSaving(false)
    }
  }

  function openRechazar(solicitud: SolicitudRegistro) {
    setRechazarComentario('')
    setRechazarModal({ open: true, solicitud })
  }

  async function handleRechazar() {
    const { solicitud } = rechazarModal
    if (!solicitud) return
    setSaving(true)
    try {
      await usuariosService.revisarSolicitud(solicitud.id, {
        accion: 'Rechazada',
        comentario: rechazarComentario || undefined,
      })
      setSolicitudes((prev) => prev.map((s) => s.id === solicitud.id ? { ...s, estado: 'Rechazada', comentario_admin: rechazarComentario || null } : s))
      toast.success(t('solicitudes.rejectedMsg', { name: solicitud.nombre_completo }))
      setRechazarModal({ open: false, solicitud: null })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('solicitudes.rejectError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <BackofficeTopbar title={t('solicitudes.title')} />

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:p-5">
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                aria-label={t('solicitudes.searchLabel')}
                placeholder={t('solicitudes.searchPlaceholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-4 pr-10 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {/* Tabs por estado */}
            <div className="flex flex-wrap gap-2">
              {ESTADO_TABS.map((tabItem) => (
                <button
                  key={tabItem.key}
                  onClick={() => setTab(tabItem.key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    tab === tabItem.key
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {tabItem.label}
                  <span className={`rounded-full px-1.5 text-[10px] ${tab === tabItem.key ? 'bg-white/20' : 'bg-white'}`}>
                    {counts[tabItem.key] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <LoadingSpinner fullPage />
          ) : (
            <>
              {/* Mobile list */}
              <div className="divide-y divide-gray-100 lg:hidden">
                {filtered.length === 0 ? (
                  <EmptyState title={t('solicitudes.emptyTitle')} description={t('solicitudes.emptyDesc')} />
                ) : filtered.map((s) => (
                  <article key={s.id} className="space-y-3 px-4 py-4 sm:px-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800">{s.nombre_completo}</p>
                        <p className="truncate text-xs text-gray-400">{s.correo_electronico}</p>
                      </div>
                      <EstadoBadge estado={s.estado} />
                    </div>
                    {(s.cargo || s.institucion) && (
                      <p className="text-xs text-gray-500">{[s.cargo, s.institucion].filter(Boolean).join(' · ')}</p>
                    )}
                    <p className="text-xs text-gray-400">{formatFecha(s.created_at)}</p>
                    {isPendiente(s.estado) && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => openAprobar(s)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          <Check className="h-3.5 w-3.5" /> {t('solicitudes.approveBtn')}
                        </button>
                        <button
                          onClick={() => openRechazar(s)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-action hover:bg-red-100"
                        >
                          <XIcon className="h-3.5 w-3.5" /> {t('solicitudes.rejectBtn')}
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="bg-[#F0F2F5]">
                    <tr>
                      {COLUMNS.map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.length === 0 ? (
                      <tr><td colSpan={6}><EmptyState title={t('solicitudes.emptyTitle')} description={t('solicitudes.emptyDesc')} /></td></tr>
                    ) : filtered.map((s) => (
                      <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                              {getInitials(s.nombre_completo)}
                            </div>
                            <p className="font-semibold text-gray-800">{s.nombre_completo}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-600">{s.correo_electronico}</td>
                        <td className="px-5 py-4 text-gray-500">{[s.cargo, s.institucion].filter(Boolean).join(' · ') || '—'}</td>
                        <td className="px-5 py-4"><EstadoBadge estado={s.estado} /></td>
                        <td className="px-5 py-4 text-xs text-gray-400">{formatFecha(s.created_at)}</td>
                        <td className="px-5 py-4">
                          {isPendiente(s.estado) ? (
                            <div className="flex items-center gap-2">
                              <button
                                title={t('solicitudes.approveBtn')}
                                onClick={() => openAprobar(s)}
                                className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                              >
                                <Check className="h-4 w-4" /> {t('solicitudes.approveBtn')}
                              </button>
                              <button
                                title={t('solicitudes.rejectBtn')}
                                onClick={() => openRechazar(s)}
                                className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-red-50 px-3 text-xs font-semibold text-action hover:bg-red-100 transition-colors"
                              >
                                <XIcon className="h-4 w-4" /> {t('solicitudes.rejectBtn')}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">{s.comentario_admin || t('solicitudes.reviewed')}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Aprobar modal */}
      <Modal
        open={aprobarModal.open}
        onClose={() => setAprobarModal({ open: false, solicitud: null })}
        title={t('solicitudes.approveTitle')}
        confirmLabel={t('solicitudes.approveConfirm')}
        onConfirm={handleAprobar}
        loading={saving}
      >
        {aprobarModal.solicitud && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5 rounded-lg bg-emerald-50 px-3 py-2.5 text-emerald-700">
              <UserCheck className="h-4 w-4 shrink-0" />
              <p className="text-xs">
                {t('solicitudes.approveInfo', {
                  name: aprobarModal.solicitud.nombre_completo,
                  email: aprobarModal.solicitud.correo_electronico,
                })}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="aprobar-rol" className="text-xs font-semibold text-gray-600">{t('solicitudes.roleLabel')}</label>
              <select
                id="aprobar-rol"
                value={aprobarForm.rol_id}
                onChange={(e) => setAprobarForm((p) => ({ ...p, rol_id: e.target.value }))}
                className={`rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 ${aprobarErrors.rol_id ? 'border-action' : 'border-gray-200'}`}
              >
                <option value="">{t('solicitudes.rolePlaceholder')}</option>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
              {aprobarErrors.rol_id && <p className="text-xs text-action">{aprobarErrors.rol_id}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="aprobar-contrasena" className="text-xs font-semibold text-gray-600">{t('solicitudes.passwordLabel')}</label>
              <input
                id="aprobar-contrasena"
                type="password"
                value={aprobarForm.contrasena}
                onChange={(e) => setAprobarForm((p) => ({ ...p, contrasena: e.target.value }))}
                className={fieldCls(aprobarErrors.contrasena)}
                placeholder={t('solicitudes.passwordPlaceholder')}
              />
              {aprobarErrors.contrasena
                ? <p className="text-xs text-action">{aprobarErrors.contrasena}</p>
                : <p className="text-xs text-gray-400">{t('solicitudes.passwordEmailHint')}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="aprobar-comentario" className="text-xs font-semibold text-gray-600">{t('solicitudes.commentLabel')}</label>
              <textarea
                id="aprobar-comentario"
                value={aprobarForm.comentario}
                onChange={(e) => setAprobarForm((p) => ({ ...p, comentario: e.target.value }))}
                rows={2}
                maxLength={300}
                className={fieldCls()}
                placeholder={t('solicitudes.commentPlaceholder')}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Rechazar modal */}
      <Modal
        open={rechazarModal.open}
        onClose={() => setRechazarModal({ open: false, solicitud: null })}
        title={t('solicitudes.rejectTitle')}
        variant="danger"
        confirmLabel={t('solicitudes.rejectConfirm')}
        onConfirm={handleRechazar}
        loading={saving}
      >
        {rechazarModal.solicitud && (
          <div className="flex flex-col gap-4">
            <p>
              {t('solicitudes.rejectMsg', { name: rechazarModal.solicitud.nombre_completo })}
            </p>
            <div className="flex flex-col gap-1">
              <label htmlFor="rechazar-motivo" className="text-xs font-semibold text-gray-600">{t('solicitudes.reasonLabel')}</label>
              <textarea
                id="rechazar-motivo"
                value={rechazarComentario}
                onChange={(e) => setRechazarComentario(e.target.value)}
                rows={3}
                maxLength={300}
                className={fieldCls()}
                placeholder={t('solicitudes.reasonPlaceholder')}
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
