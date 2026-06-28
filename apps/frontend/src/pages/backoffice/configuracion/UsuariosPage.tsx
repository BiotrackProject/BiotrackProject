// @ts-nocheck
import { useState, useEffect, useMemo } from 'react'
import { Search, UserPlus, Shield } from 'lucide-react'
import BackofficeTopbar from '../../../components/backoffice/BackofficeTopbar'
import StatusBadge from '../../../components/ui/StatusBadge'
import Modal from '../../../components/ui/Modal'
import EmptyState from '../../../components/ui/EmptyState'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import { usuariosService } from '../../../services/usuariosService'
import type { Usuario, Rol } from '../../../services/usuariosService'
import { toast } from '../../../utils/toast'
import { normalizarTelefono } from '../../../utils/validation'

const COLUMNS = ['Usuario', 'Correo', 'Rol', 'Estado', 'Último acceso', 'Acciones']

function getRolColor(rolNombre: string) {
  const map: Record<string, string> = {
    ADMINISTRADOR:      'bg-primary/10 text-primary border border-primary/20',
    TECNICO_AMBIENTAL:  'bg-secondary/40 text-primary border border-secondary/80',
    INSPECTOR:          'bg-emerald-50 text-emerald-700 border border-emerald-200',
    CONSULTOR:          'bg-gray-100 text-gray-500 border border-gray-200',
  }
  return map[rolNombre] ?? 'bg-gray-100 text-gray-500 border border-gray-200'
}

function getInitials(nombre_completo: string) {
  return nombre_completo.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}

function formatFecha(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })
}

const EMPTY_FORM = {
  nombre_completo: '',
  correo_electronico: '',
  contrasena: '',
  cargo: '',
  institucion: '',
  telefono: '',
  rol_id: '',
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [roles, setRoles] = useState<Rol[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)

  // Edit role modal
  const [editModal, setEditModal] = useState<{ open: boolean; usuario: Usuario | null; nuevoRolId: string }>({ open: false, usuario: null, nuevoRolId: '' })

  // Toggle estado modal
  const [estadoModal, setEstadoModal] = useState<{ open: boolean; usuario: Usuario | null }>({ open: false, usuario: null })

  // Nuevo usuario modal
  const [nuevoModal, setNuevoModal] = useState(false)
  const [nuevoForm, setNuevoForm] = useState(EMPTY_FORM)
  const [nuevoErrors, setNuevoErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    Promise.all([usuariosService.getAll(), usuariosService.getRoles()])
      .then(([u, r]) => { setUsuarios(u); setRoles(r); if (r.length > 0) setNuevoForm((p) => ({ ...p, rol_id: r[0].id })) })
      .catch(() => toast.error('Error al cargar usuarios'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    if (!q) return usuarios
    return usuarios.filter((u) =>
      u.nombre_completo.toLowerCase().includes(q) ||
      u.correo_electronico.toLowerCase().includes(q) ||
      u.rol.nombre.toLowerCase().includes(q)
    )
  }, [usuarios, query])

  async function handleSaveRol() {
    setSaving(true)
    try {
      const updated = await usuariosService.asignarRol(editModal.usuario!.IDUsuario, editModal.nuevoRolId)
      setUsuarios((prev) => prev.map((u) => (u.IDUsuario === updated.IDUsuario ? updated : u)))
      toast.success(`Rol de ${updated.nombre_completo} actualizado`)
      setEditModal({ open: false, usuario: null, nuevoRolId: '' })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar rol')
    } finally {
      setSaving(false)
    }
  }

  async function handleDesactivar() {
    const { usuario } = estadoModal
    if (!usuario) return
    setSaving(true)
    try {
      await usuariosService.desactivar(usuario.IDUsuario)
      setUsuarios((prev) => prev.map((u) => u.IDUsuario === usuario.IDUsuario ? { ...u, Estado: 'Inactivo' } : u))
      toast.success(`Usuario ${usuario.nombre_completo} desactivado`)
      setEstadoModal({ open: false, usuario: null })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al desactivar usuario')
    } finally {
      setSaving(false)
    }
  }

  function validateNuevo() {
    const errs: Record<string, string> = {}
    if (!nuevoForm.nombre_completo.trim()) errs.nombre_completo = 'Requerido'
    if (!nuevoForm.correo_electronico.trim() || !nuevoForm.correo_electronico.includes('@')) errs.correo_electronico = 'Email inválido'
    if (!nuevoForm.contrasena.trim() || nuevoForm.contrasena.length < 8) errs.contrasena = 'Mínimo 8 caracteres'
    if (!nuevoForm.rol_id) errs.rol_id = 'Selecciona un rol'
    const tel = normalizarTelefono(nuevoForm.telefono)
    if (tel.error) errs.telefono = tel.error
    setNuevoErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleCrearUsuario() {
    if (!validateNuevo()) return
    setSaving(true)
    try {
      const created = await usuariosService.create({
        nombre_completo: nuevoForm.nombre_completo,
        correo_electronico: nuevoForm.correo_electronico,
        contrasena: nuevoForm.contrasena,
        rol_id: nuevoForm.rol_id,
        cargo: nuevoForm.cargo || undefined,
        institucion: nuevoForm.institucion || undefined,
        telefono: normalizarTelefono(nuevoForm.telefono).valor ?? undefined,
      })
      setUsuarios((prev) => [...prev, created])
      toast.success(`Usuario ${created.nombre_completo} creado correctamente`)
      setNuevoModal(false)
      setNuevoForm({ ...EMPTY_FORM, rol_id: roles[0]?.id ?? '' })
      setNuevoErrors({})
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al crear usuario')
    } finally {
      setSaving(false)
    }
  }

  function fieldCls(err?: string) {
    return `w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors ${err ? 'border-action focus:border-action' : 'border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20'}`
  }

  return (
    <>
      <BackofficeTopbar title="Gestión de Usuarios" />

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div data-tour="backoffice-usuarios-toolbar" className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="relative w-full sm:max-w-md sm:flex-1">
              <input
                type="text"
                placeholder="Buscar usuario..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-4 pr-10 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <button
              onClick={() => setNuevoModal(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 sm:w-auto"
            >
              <UserPlus className="h-4 w-4" />
              Nuevo Usuario
            </button>
          </div>

          {loading ? (
            <LoadingSpinner fullPage />
          ) : (
            <>
              {/* Mobile list */}
              <div data-tour="backoffice-usuarios-list" className="divide-y divide-gray-100 lg:hidden">
                {filtered.length === 0 ? (
                  <EmptyState title="Sin usuarios" description="No se encontraron usuarios con ese criterio." />
                ) : filtered.map((u) => (
                  <article key={u.IDUsuario} className="space-y-3 px-4 py-4 sm:px-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800">{u.nombre_completo}</p>
                        <p className="truncate text-xs text-gray-400">{u.correo_electronico}</p>
                      </div>
                      <StatusBadge status={u.Estado} className="shrink-0" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 font-semibold ${getRolColor(u.rol.nombre)}`}>{u.rol.nombre}</span>
                      {u.cargo && <span className="text-gray-400">{u.cargo}</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setEditModal({ open: true, usuario: u, nuevoRolId: u.rol.id })}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        Cambiar rol
                      </button>
                      {u.Estado === 'Activo' && (
                        <button
                          onClick={() => setEstadoModal({ open: true, usuario: u })}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-action hover:bg-red-100"
                        >
                          Desactivar
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table data-tour="backoffice-usuarios-list" className="w-full min-w-[900px] text-sm">
                  <thead className="bg-[#F0F2F5]">
                    <tr>
                      {COLUMNS.map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.length === 0 ? (
                      <tr><td colSpan={6}><EmptyState title="Sin usuarios" description="No se encontraron usuarios con ese criterio." /></td></tr>
                    ) : filtered.map((u) => (
                      <tr key={u.IDUsuario} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                              {getInitials(u.nombre_completo)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{u.nombre_completo}</p>
                              {u.cargo && <p className="text-xs text-gray-400">{u.cargo}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-600">{u.correo_electronico}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getRolColor(u.rol.nombre)}`}>{u.rol.nombre}</span>
                        </td>
                        <td className="px-5 py-4"><StatusBadge status={u.Estado} /></td>
                        <td className="px-5 py-4 text-xs text-gray-400">{formatFecha(u.Ultimo_acceso)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              title="Editar rol"
                              onClick={() => setEditModal({ open: true, usuario: u, nuevoRolId: u.rol.id })}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              <Shield className="h-4 w-4" />
                            </button>
                            {u.Estado === 'Activo' && (
                              <button
                                title="Desactivar"
                                onClick={() => setEstadoModal({ open: true, usuario: u })}
                                className="flex h-8 items-center justify-center rounded-lg bg-red-50 px-3 text-xs font-semibold text-action hover:bg-red-100 transition-colors"
                              >
                                Desactivar
                              </button>
                            )}
                          </div>
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

      {/* Nuevo usuario modal */}
      <Modal
        open={nuevoModal}
        onClose={() => { setNuevoModal(false); setNuevoForm({ ...EMPTY_FORM, rol_id: roles[0]?.id ?? '' }); setNuevoErrors({}) }}
        title="Nuevo Usuario"
        confirmLabel="Crear usuario"
        onConfirm={handleCrearUsuario}
        loading={saving}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Nombre completo *</label>
            <input value={nuevoForm.nombre_completo} onChange={(e) => setNuevoForm((p) => ({ ...p, nombre_completo: e.target.value }))} className={fieldCls(nuevoErrors.nombre_completo)} placeholder="Juan Pérez" />
            {nuevoErrors.nombre_completo && <p className="text-xs text-action">{nuevoErrors.nombre_completo}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Correo electrónico *</label>
            <input type="email" value={nuevoForm.correo_electronico} onChange={(e) => setNuevoForm((p) => ({ ...p, correo_electronico: e.target.value }))} className={fieldCls(nuevoErrors.correo_electronico)} placeholder="usuario@ejemplo.com" />
            {nuevoErrors.correo_electronico && <p className="text-xs text-action">{nuevoErrors.correo_electronico}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Contraseña *</label>
            <input type="password" value={nuevoForm.contrasena} onChange={(e) => setNuevoForm((p) => ({ ...p, contrasena: e.target.value }))} className={fieldCls(nuevoErrors.contrasena)} placeholder="Mínimo 8 caracteres" />
            {nuevoErrors.contrasena && <p className="text-xs text-action">{nuevoErrors.contrasena}</p>}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Cargo</label>
              <input value={nuevoForm.cargo} onChange={(e) => setNuevoForm((p) => ({ ...p, cargo: e.target.value }))} className={fieldCls()} placeholder="Inspector Ambiental" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Institución</label>
              <input value={nuevoForm.institucion} onChange={(e) => setNuevoForm((p) => ({ ...p, institucion: e.target.value }))} className={fieldCls()} placeholder="MARN" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Teléfono</label>
              <input value={nuevoForm.telefono} onChange={(e) => setNuevoForm((p) => ({ ...p, telefono: e.target.value }))} className={fieldCls(nuevoErrors.telefono)} placeholder="+1 809 000 0000" />
              {nuevoErrors.telefono && <p className="text-xs text-action">{nuevoErrors.telefono}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Rol *</label>
              <select value={nuevoForm.rol_id} onChange={(e) => setNuevoForm((p) => ({ ...p, rol_id: e.target.value }))} className={`rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 ${nuevoErrors.rol_id ? 'border-action' : 'border-gray-200'}`}>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
              {nuevoErrors.rol_id && <p className="text-xs text-action">{nuevoErrors.rol_id}</p>}
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        open={editModal.open}
        onClose={() => setEditModal({ open: false, usuario: null, nuevoRolId: '' })}
        title="Cambiar Rol de Usuario"
        confirmLabel="Guardar cambios"
        onConfirm={handleSaveRol}
        loading={saving}
      >
        {editModal.usuario && (
          <div className="flex flex-col gap-4">
            <p>Cambiando rol de <span className="font-semibold text-gray-800">{editModal.usuario.nombre_completo}</span></p>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Nuevo rol</label>
              <select value={editModal.nuevoRolId} onChange={(e) => setEditModal((prev) => ({ ...prev, nuevoRolId: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20">
                {roles.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
            </div>
          </div>
        )}
      </Modal>

      {/* Desactivar usuario Modal */}
      <Modal
        open={estadoModal.open}
        onClose={() => setEstadoModal({ open: false, usuario: null })}
        title="Desactivar usuario"
        variant="danger"
        confirmLabel="Sí, desactivar"
        onConfirm={handleDesactivar}
        loading={saving}
      >
        {estadoModal.usuario && (
          <p>
            ¿Confirmas desactivar al usuario{' '}
            <span className="font-semibold text-gray-800">{estadoModal.usuario.nombre_completo}</span>?
            No podrá iniciar sesión hasta ser reactivado.
          </p>
        )}
      </Modal>
    </>
  )
}
