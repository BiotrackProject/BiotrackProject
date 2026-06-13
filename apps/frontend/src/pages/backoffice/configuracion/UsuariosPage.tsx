// @ts-nocheck
import { useState, useEffect, useMemo } from 'react'
import { Search, UserPlus, Shield } from 'lucide-react'
import BackofficeTopbar from '../../../components/backoffice/BackofficeTopbar'
import StatusBadge from '../../../components/ui/StatusBadge'
import Modal from '../../../components/ui/Modal'
import EmptyState from '../../../components/ui/EmptyState'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import { usuariosService } from '../../../services/usuariosService'
import { ROLES_LIST } from '../../../constants/roles'
import { toast } from '../../../utils/toast'

const COLUMNS = ['Usuario', 'Correo', 'Rol', 'Estado', 'Último acceso', 'Acciones']

function getRolColor(rol) {
  const map = {
    'Administrador': 'bg-primary/10 text-primary border border-primary/20',
    'Analista':      'bg-secondary/40 text-primary border border-secondary/80',
    'Inspector':     'bg-emerald-50 text-emerald-700 border border-emerald-200',
    'Solo lectura':  'bg-gray-100 text-gray-500 border border-gray-200',
  }
  return map[rol] ?? 'bg-gray-100 text-gray-500 border border-gray-200'
}

const EMPTY_FORM = { nombres: '', apellidos: '', email: '', telefono: '', departamento: '', rol: 'Analista' }

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading]   = useState(true)
  const [query, setQuery]       = useState('')
  const [saving, setSaving]     = useState(false)

  // Edit role modal
  const [editModal, setEditModal] = useState({ open: false, usuario: null, nuevoRol: '' })

  // Toggle estado modal
  const [estadoModal, setEstadoModal] = useState({ open: false, usuario: null })

  // Nuevo usuario modal
  const [nuevoModal, setNuevoModal] = useState(false)
  const [nuevoForm, setNuevoForm]   = useState(EMPTY_FORM)
  const [nuevoErrors, setNuevoErrors] = useState<Record<string, string | null>>({})

  useEffect(() => {
    usuariosService.getAll().then((data) => {
      setUsuarios(data)
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    if (!q) return usuarios
    return usuarios.filter((u) =>
      u.nombres.toLowerCase().includes(q) ||
      u.apellidos.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.rol.toLowerCase().includes(q)
    )
  }, [usuarios, query])

  async function handleSaveRol() {
    setSaving(true)
    const updated = await usuariosService.updateRol(editModal.usuario.id, editModal.nuevoRol)
    setUsuarios((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    setSaving(false)
    setEditModal({ open: false, usuario: null, nuevoRol: '' })
    toast.success(`Rol de ${updated.nombres} actualizado a "${updated.rol}"`)
  }

  async function handleToggleEstado() {
    const { usuario } = estadoModal
    const nuevoEstado = usuario.estado === 'Activo' ? 'Inactivo' : 'Activo'
    setSaving(true)
    const updated = await usuariosService.updateEstado(usuario.id, nuevoEstado)
    setUsuarios((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    setSaving(false)
    setEstadoModal({ open: false, usuario: null })
    toast.success(`Usuario ${updated.nombres} ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'}`)
  }

  function validateNuevo() {
    const errs = {}
    if (!nuevoForm.nombres.trim()) errs.nombres = 'Requerido'
    if (!nuevoForm.apellidos.trim()) errs.apellidos = 'Requerido'
    if (!nuevoForm.email.trim() || !nuevoForm.email.includes('@')) errs.email = 'Email inválido'
    setNuevoErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleCrearUsuario() {
    if (!validateNuevo()) return
    setSaving(true)
    const created = await usuariosService.create(nuevoForm)
    setUsuarios((prev) => [...prev, created])
    setSaving(false)
    setNuevoModal(false)
    setNuevoForm(EMPTY_FORM)
    setNuevoErrors({})
    toast.success(`Usuario ${created.nombres} ${created.apellidos} creado correctamente`)
  }

  function fieldCls(err) {
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

          {/* Mobile list */}
          {loading ? (
            <LoadingSpinner fullPage />
          ) : (
            <>
            <div data-tour="backoffice-usuarios-list" className="divide-y divide-gray-100 lg:hidden">
              {filtered.length === 0 ? (
                <EmptyState title="Sin usuarios" description="No se encontraron usuarios con ese criterio." />
              ) : filtered.map((u) => (
                <article key={u.id} className="space-y-3 px-4 py-4 sm:px-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800">{u.nombres} {u.apellidos}</p>
                      <p className="truncate text-xs text-gray-400">{u.email}</p>
                    </div>
                    <StatusBadge status={u.estado} className="shrink-0" />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 font-semibold ${getRolColor(u.rol)}`}>{u.rol}</span>
                    <span className="text-gray-400">{u.departamento}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setEditModal({ open: true, usuario: u, nuevoRol: u.rol })}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                    >
                      <Shield className="h-3.5 w-3.5" />
                      Cambiar rol
                    </button>
                    <button
                      onClick={() => setEstadoModal({ open: true, usuario: u })}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        u.estado === 'Activo' ? 'bg-red-50 text-action hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      }`}
                    >
                      {u.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                    </button>
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
                  <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                          {u.nombres[0]}{u.apellidos[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{u.nombres} {u.apellidos}</p>
                          <p className="text-xs text-gray-400">{u.departamento}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{u.email}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getRolColor(u.rol)}`}>{u.rol}</span>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={u.estado} /></td>
                    <td className="px-5 py-4 text-xs text-gray-400">{u.ultimoAcceso}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          title="Editar rol"
                          onClick={() => setEditModal({ open: true, usuario: u, nuevoRol: u.rol })}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                        <button
                          title={u.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                          onClick={() => setEstadoModal({ open: true, usuario: u })}
                          className={`flex h-8 items-center justify-center rounded-lg px-3 text-xs font-semibold transition-colors ${
                            u.estado === 'Activo' ? 'bg-red-50 text-action hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          {u.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                        </button>
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
        onClose={() => { setNuevoModal(false); setNuevoForm(EMPTY_FORM); setNuevoErrors({}) }}
        title="Nuevo Usuario"
        confirmLabel="Crear usuario"
        onConfirm={handleCrearUsuario}
        loading={saving}
      >
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Nombres *</label>
              <input value={nuevoForm.nombres} onChange={(e) => setNuevoForm((p) => ({ ...p, nombres: e.target.value }))} className={fieldCls(nuevoErrors.nombres)} placeholder="Juan" />
              {nuevoErrors.nombres && <p className="text-xs text-action">{nuevoErrors.nombres}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Apellidos *</label>
              <input value={nuevoForm.apellidos} onChange={(e) => setNuevoForm((p) => ({ ...p, apellidos: e.target.value }))} className={fieldCls(nuevoErrors.apellidos)} placeholder="Pérez" />
              {nuevoErrors.apellidos && <p className="text-xs text-action">{nuevoErrors.apellidos}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Correo electrónico *</label>
            <input type="email" value={nuevoForm.email} onChange={(e) => setNuevoForm((p) => ({ ...p, email: e.target.value }))} className={fieldCls(nuevoErrors.email)} placeholder="usuario@medioambiente.gob.do" />
            {nuevoErrors.email && <p className="text-xs text-action">{nuevoErrors.email}</p>}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Teléfono</label>
              <input value={nuevoForm.telefono} onChange={(e) => setNuevoForm((p) => ({ ...p, telefono: e.target.value }))} className={fieldCls(false)} placeholder="809-000-0000" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Departamento</label>
              <input value={nuevoForm.departamento} onChange={(e) => setNuevoForm((p) => ({ ...p, departamento: e.target.value }))} className={fieldCls(false)} placeholder="Análisis Ambiental" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Rol</label>
            <select value={nuevoForm.rol} onChange={(e) => setNuevoForm((p) => ({ ...p, rol: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20">
              {ROLES_LIST.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        open={editModal.open}
        onClose={() => setEditModal({ open: false, usuario: null, nuevoRol: '' })}
        title="Cambiar Rol de Usuario"
        confirmLabel="Guardar cambios"
        onConfirm={handleSaveRol}
        loading={saving}
      >
        {editModal.usuario && (
          <div className="flex flex-col gap-4">
            <p>Cambiando rol de <span className="font-semibold text-gray-800">{editModal.usuario.nombres} {editModal.usuario.apellidos}</span></p>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Nuevo rol</label>
              <select value={editModal.nuevoRol} onChange={(e) => setEditModal((prev) => ({ ...prev, nuevoRol: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20">
                {ROLES_LIST.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        )}
      </Modal>

      {/* Toggle Estado Modal */}
      <Modal
        open={estadoModal.open}
        onClose={() => setEstadoModal({ open: false, usuario: null })}
        title={estadoModal.usuario?.estado === 'Activo' ? 'Desactivar usuario' : 'Activar usuario'}
        variant={estadoModal.usuario?.estado === 'Activo' ? 'danger' : 'default'}
        confirmLabel={estadoModal.usuario?.estado === 'Activo' ? 'Sí, desactivar' : 'Sí, activar'}
        onConfirm={handleToggleEstado}
        loading={saving}
      >
        {estadoModal.usuario && (
          <p>
            ¿Confirmas {estadoModal.usuario.estado === 'Activo' ? 'desactivar' : 'activar'} al usuario{' '}
            <span className="font-semibold text-gray-800">{estadoModal.usuario.nombres} {estadoModal.usuario.apellidos}</span>?
            {estadoModal.usuario.estado === 'Activo' && ' No podrá iniciar sesión hasta ser reactivado.'}
          </p>
        )}
      </Modal>
    </>
  )
}
