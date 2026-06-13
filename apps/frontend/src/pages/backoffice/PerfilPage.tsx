// @ts-nocheck
import { useState, useEffect } from 'react'
import { User, Mail, Phone, Building, Shield } from 'lucide-react'
import BackofficeTopbar from '../../components/backoffice/BackofficeTopbar'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { usuariosService } from '../../services/usuariosService'
import { toast } from '../../utils/toast'

function Field({ label, icon: Icon, value, onChange, type = 'text', readOnly = false }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        readOnly={readOnly}
        className={`rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors ${
          readOnly
            ? 'border-gray-100 bg-gray-50 text-gray-500 cursor-default'
            : 'border-gray-200 bg-white text-gray-800 focus:border-primary focus:ring-1 focus:ring-primary/20'
        }`}
      />
    </div>
  )
}

export default function PerfilPage() {
  const [perfil, setPerfil]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({})

  useEffect(() => {
    usuariosService.getPerfil().then((data) => {
      setPerfil(data)
      setForm(data)
      setLoading(false)
    })
  }, [])

  function handleEdit() {
    setForm({ ...perfil })
    setEditing(true)
  }

  function handleCancel() {
    setForm({ ...perfil })
    setEditing(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await usuariosService.updatePerfil(form)
      setPerfil(updated)
      setEditing(false)
      toast.success('Perfil actualizado correctamente')
    } catch {
      toast.error('Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <>
      <BackofficeTopbar title="Mi Perfil" backTo="/admin/dashboard" />
      <LoadingSpinner fullPage />
    </>
  )

  return (
    <>
      <BackofficeTopbar
        title="Mi Perfil"
        backTo="/admin/dashboard"
        actions={
          editing ? (
            <div data-tour="backoffice-perfil-actions" className="flex gap-2">
              <button onClick={handleCancel} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          ) : (
            <button onClick={handleEdit} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
              Editar perfil
            </button>
          )
        }
      />

      <main className="p-8 max-w-2xl flex flex-col gap-5">
        {/* Avatar card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-white text-xl font-black">
            {perfil.nombres?.[0]}{perfil.apellidos?.[0]}
          </div>
          <div>
            <p className="text-lg font-bold text-gray-800">{perfil.nombres} {perfil.apellidos}</p>
            <p className="text-sm text-gray-400">{perfil.rol} · {perfil.departamento}</p>
            <p className="text-xs text-gray-400 mt-0.5">Último acceso: {perfil.ultimoAcceso}</p>
          </div>
        </div>

        {/* Info form */}
        <div data-tour="backoffice-perfil-info" className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <h3 className="text-sm font-bold text-primary">Información personal</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Nombres"
              icon={User}
              value={form.nombres ?? ''}
              onChange={editing ? (v) => setForm((p) => ({ ...p, nombres: v })) : null}
              readOnly={!editing}
            />
            <Field
              label="Apellidos"
              icon={User}
              value={form.apellidos ?? ''}
              onChange={editing ? (v) => setForm((p) => ({ ...p, apellidos: v })) : null}
              readOnly={!editing}
            />
            <Field
              label="Correo electrónico"
              icon={Mail}
              type="email"
              value={form.email ?? ''}
              onChange={editing ? (v) => setForm((p) => ({ ...p, email: v })) : null}
              readOnly={!editing}
            />
            <Field
              label="Teléfono"
              icon={Phone}
              value={form.telefono ?? ''}
              onChange={editing ? (v) => setForm((p) => ({ ...p, telefono: v })) : null}
              readOnly={!editing}
            />
          </div>
        </div>

        {/* Role info (read-only) */}
        <div data-tour="backoffice-perfil-access" className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-primary">Acceso y permisos</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Rol" icon={Shield} value={perfil.rol} readOnly />
            <Field label="Departamento" icon={Building} value={perfil.departamento} readOnly />
          </div>
          <p className="text-xs text-gray-400">Para cambios de rol o departamento, contacta a un administrador.</p>
        </div>
      </main>
    </>
  )
}
