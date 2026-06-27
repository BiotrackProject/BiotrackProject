import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { User, Mail, Phone, Building, Shield } from 'lucide-react'
import BackofficeTopbar from '../../components/backoffice/BackofficeTopbar'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { toast } from '../../utils/toast'
import * as authService from '../../services/authService'
import type { PerfilCompleto } from '../../services/authService'

function Field({ label, icon: Icon, value, onChange = null, type = 'text', readOnly = false }: {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  value: string
  onChange?: ((v: string) => void) | null
  type?: string
  readOnly?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </label>
      <input
        type={type}
        value={value ?? ''}
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
  const { t } = useTranslation()
  const [perfil, setPerfil]   = useState<PerfilCompleto | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState<{ nombre_completo: string; telefono: string }>({ nombre_completo: '', telefono: '' })

  useEffect(() => {
    authService.getPerfil().then((res) => {
      if (res.success && res.data) {
        setPerfil(res.data)
        setForm({ nombre_completo: res.data.nombre_completo, telefono: res.data.telefono ?? '' })
      }
      setLoading(false)
    })
  }, [])

  function handleEdit() {
    if (!perfil) return
    setForm({ nombre_completo: perfil.nombre_completo, telefono: perfil.telefono ?? '' })
    setEditing(true)
  }

  function handleCancel() {
    setEditing(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await authService.actualizarPerfil({
        nombre_completo: form.nombre_completo || undefined,
        telefono: form.telefono || null,
      })
      if (res.success && res.data) {
        setPerfil(res.data.usuario as PerfilCompleto)
        setEditing(false)
        toast.success(t('perfil.updateSuccess'))
      } else {
        toast.error(res.error ?? t('perfil.updateError'))
      }
    } catch {
      toast.error(t('perfil.updateError'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <>
      <BackofficeTopbar title={t('perfil.title')} backTo="/admin/dashboard" />
      <LoadingSpinner fullPage />
    </>
  )

  if (!perfil) return (
    <>
      <BackofficeTopbar title={t('perfil.title')} backTo="/admin/dashboard" />
      <main className="p-8"><p className="text-sm text-gray-400">{t('perfil.noProfile')}</p></main>
    </>
  )

  const iniciales = perfil.nombre_completo.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()

  return (
    <>
      <BackofficeTopbar
        title={t('perfil.title')}
        backTo="/admin/dashboard"
        actions={
          editing ? (
            <div data-tour="backoffice-perfil-actions" className="flex gap-2">
              <button onClick={handleCancel} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                {t('perfil.cancelBtn')}
              </button>
              <button onClick={handleSave} disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {saving ? t('perfil.saving') : t('perfil.saveBtn')}
              </button>
            </div>
          ) : (
            <button onClick={handleEdit} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
              {t('perfil.editBtn')}
            </button>
          )
        }
      />

      <main className="p-8 max-w-2xl flex flex-col gap-5">
        <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-white text-xl font-black">
            {iniciales}
          </div>
          <div>
            <p className="text-lg font-bold text-gray-800">{perfil.nombre_completo}</p>
            <p className="text-sm text-gray-400">{perfil.rol.nombre} · {perfil.cargo ?? t('perfil.sinCargo')}</p>
            <p className="text-xs text-gray-400 mt-0.5">{perfil.institucion ?? t('perfil.sinInstitucion')}</p>
          </div>
        </div>

        <div data-tour="backoffice-perfil-info" className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <h3 className="text-sm font-bold text-primary">{t('perfil.personalInfo')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label={t('perfil.nameLabel')}
              icon={User}
              value={editing ? form.nombre_completo : perfil.nombre_completo}
              onChange={editing ? (v: string) => setForm(p => ({ ...p, nombre_completo: v })) : null}
              readOnly={!editing}
            />
            <Field
              label={t('perfil.emailLabel')}
              icon={Mail}
              type="email"
              value={perfil.correo_electronico}
              readOnly
            />
            <Field
              label={t('perfil.phoneLabel')}
              icon={Phone}
              value={editing ? form.telefono : (perfil.telefono ?? '')}
              onChange={editing ? (v: string) => setForm(p => ({ ...p, telefono: v })) : null}
              readOnly={!editing}
            />
            <Field label={t('perfil.cargoLabel')} icon={Building} value={perfil.cargo ?? ''} readOnly />
          </div>
        </div>

        <div data-tour="backoffice-perfil-access" className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-primary">{t('perfil.accessTitle')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('perfil.rolLabel')} icon={Shield} value={perfil.rol.nombre} readOnly />
            <Field label={t('perfil.institucionLabel')} icon={Building} value={perfil.institucion ?? ''} readOnly />
          </div>
          <p className="text-xs text-gray-400">{t('perfil.accessHint')}</p>
        </div>
      </main>
    </>
  )
}
