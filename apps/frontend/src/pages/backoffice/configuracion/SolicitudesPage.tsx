import { useState, useEffect, useMemo } from 'react'
import { Search, Check, X as XIcon, UserCheck } from 'lucide-react'
import BackofficeTopbar from '../../../components/backoffice/BackofficeTopbar'
import Modal from '../../../components/ui/Modal'
import EmptyState from '../../../components/ui/EmptyState'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import { usuariosService } from '../../../services/usuariosService'
import type { SolicitudRegistro, Rol } from '../../../services/usuariosService'
import { toast } from '../../../utils/toast'

const COLUMNS = ['Solicitante', 'Correo', 'Cargo / Institución', 'Estado', 'Fecha', 'Acciones']

const ESTADO_TABS = [
  { key: 'Pendientes', label: 'Pendientes' },
  { key: 'Aprobada', label: 'Aprobadas' },
  { key: 'Rechazada', label: 'Rechazadas' },
  { key: '', label: 'Todas' },
]

const ESTADO_LABEL: Record<string, string> = {
  Pendiente_Aprobacion: 'Pendiente',
  Pendiente_Info: 'Pendiente info',
  Aprobada: 'Aprobada',
  Rechazada: 'Rechazada',
}

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
  return new Date(iso).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function EstadoBadge({ estado }: Readonly<{ estado: string }>) {
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
  const [solicitudes, setSolicitudes] = useState<SolicitudRegistro[]>([])
  const [roles, setRoles] = useState<Rol[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('Pendientes')
  const [saving, setSaving] = useState(false)

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
      .catch(() => toast.error('Error al cargar solicitudes'))
      .finally(() => setLoading(false))
  }, [])

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
    if (!aprobarForm.rol_id) errs.rol_id = 'Selecciona un rol'
    if (!aprobarForm.contrasena.trim() || aprobarForm.contrasena.length < 8) errs.contrasena = 'Mínimo 8 caracteres'
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
      toast.success(`Solicitud de ${solicitud.nombre_completo} aprobada. Se le envió la contraseña por correo.`)
      setAprobarModal({ open: false, solicitud: null })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al aprobar solicitud')
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
      toast.success(`Solicitud de ${solicitud.nombre_completo} rechazada`)
      setRechazarModal({ open: false, solicitud: null })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al rechazar solicitud')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <BackofficeTopbar title="Solicitudes de Registro" />

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:p-5">
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                aria-label="Buscar solicitud"
                placeholder="Buscar por nombre o correo..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-4 pr-10 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {/* Tabs por estado */}
            <div className="flex flex-wrap gap-2">
              {ESTADO_TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    tab === t.key
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {t.label}
                  <span className={`rounded-full px-1.5 text-[10px] ${tab === t.key ? 'bg-white/20' : 'bg-white'}`}>
                    {counts[t.key] ?? 0}
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
                  <EmptyState title="Sin solicitudes" description="No se encontraron solicitudes con ese criterio." />
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
                          <Check className="h-3.5 w-3.5" /> Aprobar
                        </button>
                        <button
                          onClick={() => openRechazar(s)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-action hover:bg-red-100"
                        >
                          <XIcon className="h-3.5 w-3.5" /> Rechazar
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
                      <tr><td colSpan={6}><EmptyState title="Sin solicitudes" description="No se encontraron solicitudes con ese criterio." /></td></tr>
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
                                title="Aprobar"
                                onClick={() => openAprobar(s)}
                                className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                              >
                                <Check className="h-4 w-4" /> Aprobar
                              </button>
                              <button
                                title="Rechazar"
                                onClick={() => openRechazar(s)}
                                className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-red-50 px-3 text-xs font-semibold text-action hover:bg-red-100 transition-colors"
                              >
                                <XIcon className="h-4 w-4" /> Rechazar
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">{s.comentario_admin || 'Revisada'}</span>
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
        title="Aprobar solicitud"
        confirmLabel="Aprobar y crear cuenta"
        onConfirm={handleAprobar}
        loading={saving}
      >
        {aprobarModal.solicitud && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5 rounded-lg bg-emerald-50 px-3 py-2.5 text-emerald-700">
              <UserCheck className="h-4 w-4 shrink-0" />
              <p className="text-xs">
                Se creará una cuenta para{' '}
                <span className="font-semibold">{aprobarModal.solicitud.nombre_completo}</span>{' '}
                ({aprobarModal.solicitud.correo_electronico}). Recibirá esta contraseña por
                correo y deberá cambiarla en su primer inicio de sesión.
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="aprobar-rol" className="text-xs font-semibold text-gray-600">Rol asignado *</label>
              <select
                id="aprobar-rol"
                value={aprobarForm.rol_id}
                onChange={(e) => setAprobarForm((p) => ({ ...p, rol_id: e.target.value }))}
                className={`rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 ${aprobarErrors.rol_id ? 'border-action' : 'border-gray-200'}`}
              >
                <option value="">Selecciona un rol</option>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
              {aprobarErrors.rol_id && <p className="text-xs text-action">{aprobarErrors.rol_id}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="aprobar-contrasena" className="text-xs font-semibold text-gray-600">Contraseña temporal *</label>
              <input
                id="aprobar-contrasena"
                type="password"
                value={aprobarForm.contrasena}
                onChange={(e) => setAprobarForm((p) => ({ ...p, contrasena: e.target.value }))}
                className={fieldCls(aprobarErrors.contrasena)}
                placeholder="Mínimo 8 caracteres"
              />
              {aprobarErrors.contrasena
                ? <p className="text-xs text-action">{aprobarErrors.contrasena}</p>
                : <p className="text-xs text-gray-400">Se enviará por correo; el usuario la cambiará al iniciar sesión.</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="aprobar-comentario" className="text-xs font-semibold text-gray-600">Comentario (opcional)</label>
              <textarea
                id="aprobar-comentario"
                value={aprobarForm.comentario}
                onChange={(e) => setAprobarForm((p) => ({ ...p, comentario: e.target.value }))}
                rows={2}
                maxLength={300}
                className={fieldCls()}
                placeholder="Nota interna o mensaje de bienvenida"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Rechazar modal */}
      <Modal
        open={rechazarModal.open}
        onClose={() => setRechazarModal({ open: false, solicitud: null })}
        title="Rechazar solicitud"
        variant="danger"
        confirmLabel="Sí, rechazar"
        onConfirm={handleRechazar}
        loading={saving}
      >
        {rechazarModal.solicitud && (
          <div className="flex flex-col gap-4">
            <p>
              ¿Confirmas rechazar la solicitud de{' '}
              <span className="font-semibold text-gray-800">{rechazarModal.solicitud.nombre_completo}</span>?
              Se le notificará por correo.
            </p>
            <div className="flex flex-col gap-1">
              <label htmlFor="rechazar-motivo" className="text-xs font-semibold text-gray-600">Motivo (opcional)</label>
              <textarea
                id="rechazar-motivo"
                value={rechazarComentario}
                onChange={(e) => setRechazarComentario(e.target.value)}
                rows={3}
                maxLength={300}
                className={fieldCls()}
                placeholder="Indica el motivo del rechazo"
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
