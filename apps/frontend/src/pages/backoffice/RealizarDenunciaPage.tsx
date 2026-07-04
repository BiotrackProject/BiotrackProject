// @ts-nocheck
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm, useStore } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UploadCloud, X, CheckCircle } from 'lucide-react'
import BackofficeTopbar from '../../components/backoffice/BackofficeTopbar'
import { denunciasService, filtrarEvidencias, TIPOS_ACTIVIDAD } from '../../services/denunciasService'
import { toast } from '../../utils/toast'

function Label({ children, required }) {
  return (
    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
      {children}
      {required && <span className="text-action ml-0.5">*</span>}
    </label>
  )
}

function Input({ error, ...props }) {
  return (
    <>
      <input
        {...props}
        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition-colors
          ${error ? 'border-action focus:ring-1 focus:ring-action' : 'border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary'}`}
      />
      {error && <p className="mt-1 text-xs text-action">{error}</p>}
    </>
  )
}

function Select({ error, children, ...props }) {
  return (
    <>
      <select
        {...props}
        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-700 outline-none transition-colors bg-white
          ${error ? 'border-action focus:ring-1 focus:ring-action' : 'border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary'}`}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-action">{error}</p>}
    </>
  )
}

function RadioGroup({ label, required, name, options, value, onChange, error }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <div className="flex gap-6">
        {options.map((opt) => {
          const optValue = typeof opt === 'object' ? opt.value : opt
          const optLabel = typeof opt === 'object' ? opt.label : opt
          return (
            <label key={optValue} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
              <input
                type="radio"
                name={name}
                value={optValue}
                checked={value === optValue}
                onChange={() => onChange(optValue)}
                className="accent-primary w-4 h-4"
              />
              {optLabel}
            </label>
          )
        })}
      </div>
      {error && <p className="mt-1 text-xs text-action">{error}</p>}
    </div>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-sm font-bold text-primary mb-5">{title}</h2>
      {children}
    </div>
  )
}

const FILE_TYPES = ['MP3', 'MP4', 'PNG', 'JPG', 'PDF']
const ALLOWED_EXT = ['.mp3', '.mp4', '.png', '.jpg', '.jpeg', '.pdf']

const DEFAULT_VALUES = {
  anonimo: '',
  nombres: '',
  apellidos: '',
  correo: '',
  telefono: '',
  tipoActividad: '',
  fechaIncidente: '',
  hora: '',
  gps: '',
  detalleUbicacion: '',
  tipoExtraccion: '',
  numPersonas: '',
  cantidadArena: '',
  detalleActividad: '',
  consentimiento: false,
}
/** Datos de contacto (cifrados en el backend). Vacío si la denuncia es anónima. */
function buildContacto(v) {
  if (v.anonimo === 'Sí') return undefined
  const partes = [
    [v.nombres, v.apellidos].filter(Boolean).join(' ').trim(),
    v.correo.trim(),
    v.telefono.trim(),
  ].filter(Boolean)
  return partes.length ? partes.join(' · ').slice(0, 500) : undefined
}

export default function RealizarDenunciaPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)
  const [submitted, setSubmitted] = useState(false)
  const [codigoSeguimiento, setCodigoSeguimiento] = useState('')
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)

  const mutation = useMutation({
    mutationFn: (payload) => denunciasService.crear(payload),
    onSuccess: (result) => {
      // Refrescar el listado de denuncias para que la nueva aparezca
      queryClient.invalidateQueries({ queryKey: ['denuncias'] })
      setCodigoSeguimiento(result.codigo_seguimiento)
      setSubmitted(true)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t('realizarDenuncia.createError'))
    },
  })

  const form = useForm({
    defaultValues: DEFAULT_VALUES,
    validators: {
      onSubmit: ({ value }) => {
        const fields = {}
        const anon = value.anonimo === 'Sí'
        if (!value.anonimo) fields.anonimo = t('realizarDenuncia.required')
        if (!anon && !value.nombres.trim()) fields.nombres = t('realizarDenuncia.required')
        if (!anon && !value.apellidos.trim()) fields.apellidos = t('realizarDenuncia.required')
        if (!value.tipoActividad) fields.tipoActividad = t('realizarDenuncia.required')
        if (!value.fechaIncidente) fields.fechaIncidente = t('realizarDenuncia.required')
        if (!value.detalleUbicacion.trim()) fields.detalleUbicacion = t('realizarDenuncia.required')
        if (!value.tipoExtraccion) fields.tipoExtraccion = t('realizarDenuncia.required')
        if (!value.numPersonas) fields.numPersonas = t('realizarDenuncia.required')
        if (!value.cantidadArena.trim()) fields.cantidadArena = t('realizarDenuncia.required')
        if (!value.detalleActividad.trim()) fields.detalleActividad = t('realizarDenuncia.required')
        if (!value.consentimiento) fields.consentimiento = t('realizarDenuncia.consentError')
        return Object.keys(fields).length ? { fields } : undefined
      },
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({
        Descripcion: value.detalleActividad.trim(),
        tipo_actividad: value.tipoActividad,
        fecha_incidente: value.fechaIncidente || undefined,
        hora_aproximada: value.hora || undefined,
        detalle_ubicacion: value.detalleUbicacion.trim() || undefined,
        gps: value.gps.trim() || undefined,
        tipo_extraccion: value.tipoExtraccion || undefined,
        numero_personas: value.numPersonas || undefined,
        cantidad_arena: value.cantidadArena.trim() || undefined,
        contacto: buildContacto(value),
        evidencias: files,
      })
    },
  })

  const isAnon = useStore(form.store, (s) => s.values.anonimo === 'Sí')

  function addFiles(newFiles) {
    const { aceptados, errores } = filtrarEvidencias(files, Array.from(newFiles))
    if (errores.length) toast.error(errores.join(' '))
    if (aceptados.length) setFiles((prev) => [...prev, ...aceptados])
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, j) => j !== index))
  }

  if (submitted) {
    return (
      <>
        <BackofficeTopbar title={t('realizarDenuncia.title')} backTo="/admin/denuncias" />
        <main className="flex flex-col items-center justify-center p-16 gap-4">
          <CheckCircle className="h-16 w-16 text-emerald-500" />
          <h2 className="text-xl font-bold text-primary">{t('realizarDenuncia.successTitle')}</h2>
          <p className="text-sm text-gray-500">{t('realizarDenuncia.successMsg')}</p>
          {codigoSeguimiento && (
            <p className="text-sm text-gray-500">
              {t('realizarDenuncia.trackingCodeLabel')}{' '}
              <span className="font-bold text-primary">{codigoSeguimiento}</span>
            </p>
          )}
          <button
            onClick={() => navigate('/admin/denuncias')}
            className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            {t('realizarDenuncia.viewDenuncias')}
          </button>
        </main>
      </>
    )
  }

  return (
    <>
      <BackofficeTopbar title={t('realizarDenuncia.title')} backTo="/admin/denuncias" />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        noValidate
      >
        <main className="p-8 flex flex-col gap-5">
        {/* Información del Denunciante */}
        <div data-tour="backoffice-denuncia-form-personal">
          <SectionCard title={t('realizarDenuncia.personalInfo')}>
            <div className="grid grid-cols-3 gap-4">
            <div className="col-span-3">
              <form.Field name="anonimo">
                {(field) => (
                  <RadioGroup
                    label={t('realizarDenuncia.anonymousLabel')}
                    required
                    name="anonimo"
                    options={[
                      { value: 'Sí', label: t('realizarDenuncia.anonymousYes') },
                      { value: 'No', label: t('realizarDenuncia.anonymousNo') },
                    ]}
                    value={field.state.value}
                    onChange={(v) => field.handleChange(v)}
                    error={field.state.meta.errors[0]}
                  />
                )}
              </form.Field>
            </div>
            <div>
              <Label required={!isAnon}>{t('realizarDenuncia.namesLabel')}</Label>
              <form.Field name="nombres">
                {(field) => (
                  <Input
                    placeholder={t('realizarDenuncia.namesLabel')}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={isAnon}
                    error={field.state.meta.errors[0]}
                  />
                )}
              </form.Field>
            </div>
            <div>
              <Label required={!isAnon}>{t('realizarDenuncia.lastNameLabel')}</Label>
              <form.Field name="apellidos">
                {(field) => (
                  <Input
                    placeholder={t('realizarDenuncia.lastNameLabel')}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={isAnon}
                    error={field.state.meta.errors[0]}
                  />
                )}
              </form.Field>
            </div>
            <div />
            <div>
              <Label>{t('realizarDenuncia.emailLabel')}</Label>
              <form.Field name="correo">
                {(field) => (
                  <Input
                    type="email"
                    placeholder={t('realizarDenuncia.emailLabel')}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={isAnon}
                  />
                )}
              </form.Field>
            </div>
            <div>
              <Label>{t('realizarDenuncia.phoneLabel')}</Label>
              <form.Field name="telefono">
                {(field) => (
                  <Input
                    type="tel"
                    placeholder={t('realizarDenuncia.phonePlaceholder')}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={isAnon}
                  />
                )}
              </form.Field>
            </div>
            </div>
          </SectionCard>
        </div>

        {/* Ubicación del Incidente */}
        <div data-tour="backoffice-denuncia-form-location">
          <SectionCard title={t('realizarDenuncia.locationInfo')}>
            <div className="grid grid-cols-3 gap-4">
            <div>
              <Label required>{t('realizarDenuncia.dateLabel')}</Label>
              <form.Field name="fechaIncidente">
                {(field) => (
                  <Input
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={field.state.meta.errors[0]}
                  />
                )}
              </form.Field>
            </div>
            <div>
              <Label>{t('realizarDenuncia.timeLabel')}</Label>
              <form.Field name="hora">
                {(field) => (
                  <Input
                    type="time"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </form.Field>
            </div>
            <div>
              <Label>{t('realizarDenuncia.gpsLabel')}</Label>
              <form.Field name="gps">
                {(field) => (
                  <Input
                    placeholder={t('realizarDenuncia.gpsPlaceholder')}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </form.Field>
            </div>
            <div className="col-span-3">
              <Label required>{t('realizarDenuncia.locationDetailLabel')}</Label>
              <form.Field name="detalleUbicacion">
                {(field) => (
                  <>
                    <textarea
                      rows={3}
                      placeholder={t('realizarDenuncia.locationDetailPlaceholder')}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 outline-none resize-none transition-colors
                        ${field.state.meta.errors[0] ? 'border-action focus:ring-1 focus:ring-action' : 'border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary'}`}
                    />
                    {field.state.meta.errors[0] && <p className="mt-1 text-xs text-action">{field.state.meta.errors[0]}</p>}
                  </>
                )}
              </form.Field>
            </div>
            </div>
          </SectionCard>
        </div>

        {/* Detalles del Incidente */}
        <SectionCard title={t('realizarDenuncia.incidentDetails')}>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-3">
              <Label required>{t('realizarDenuncia.activityTypeLabel')}</Label>
              <form.Field name="tipoActividad">
                {(field) => (
                  <Select
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={field.state.meta.errors[0]}
                  >
                    <option value="">{t('realizarDenuncia.activityTypePlaceholder')}</option>
                    {TIPOS_ACTIVIDAD.map((tipo) => <option key={tipo} value={tipo}>{t(`tipos.${tipo}`, tipo)}</option>)}
                  </Select>
                )}
              </form.Field>
            </div>
            <form.Field name="tipoExtraccion">
              {(field) => (
                <RadioGroup
                  label={t('realizarDenuncia.extractionTypeLabel')}
                  required
                  name="tipoExtraccion"
                  options={[
                    { value: 'Manual', label: t('realizarDenuncia.extractionManual') },
                    { value: 'Maquinaria pesada', label: t('realizarDenuncia.extractionHeavy') },
                  ]}
                  value={field.state.value}
                  onChange={(v) => field.handleChange(v)}
                  error={field.state.meta.errors[0]}
                />
              )}
            </form.Field>
            <form.Field name="numPersonas">
              {(field) => (
                <RadioGroup
                  label={t('realizarDenuncia.peopleLabel')}
                  required
                  name="numPersonas"
                  options={[
                    { value: '1-5', label: t('realizarDenuncia.people1to5') },
                    { value: 'Más de 6 personas', label: t('realizarDenuncia.peopleMore') },
                  ]}
                  value={field.state.value}
                  onChange={(v) => field.handleChange(v)}
                  error={field.state.meta.errors[0]}
                />
              )}
            </form.Field>
            <div>
              <Label required>{t('realizarDenuncia.sandAmountLabel')}</Label>
              <form.Field name="cantidadArena">
                {(field) => (
                  <Input
                    placeholder={t('realizarDenuncia.sandAmountPlaceholder')}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={field.state.meta.errors[0]}
                  />
                )}
              </form.Field>
            </div>
            <div className="col-span-3">
              <Label required>{t('realizarDenuncia.activityDetailLabel')}</Label>
              <form.Field name="detalleActividad">
                {(field) => (
                  <>
                    <textarea
                      rows={3}
                      placeholder={t('realizarDenuncia.activityDetailPlaceholder')}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 outline-none resize-none transition-colors
                        ${field.state.meta.errors[0] ? 'border-action focus:ring-1 focus:ring-action' : 'border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary'}`}
                    />
                    {field.state.meta.errors[0] && <p className="mt-1 text-xs text-action">{field.state.meta.errors[0]}</p>}
                  </>
                )}
              </form.Field>
            </div>
          </div>
        </SectionCard>

        {/* Adjuntar Evidencias */}
        <div data-tour="backoffice-denuncia-form-evidence">
          <SectionCard title={t('realizarDenuncia.evidenceTitle')}>
            <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-colors
              ${dragging ? 'border-primary bg-primary/5' : 'border-gray-200 bg-[#F8F9FB] hover:border-primary/50'}`}
          >
            <UploadCloud className="h-10 w-10 text-primary/70" />
            <p className="text-sm font-medium text-gray-600">{t('realizarDenuncia.evidenceDropText')}</p>
            <p className="text-xs text-gray-400">{t('realizarDenuncia.evidenceAllowed', { types: FILE_TYPES.join(', ') })}</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_EXT.join(',')}
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
            </div>

          {files.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <li key={i} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600">
                  {f.name}
                  <button type="button" onClick={() => removeFile(i)} className="text-gray-400 hover:text-action">
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}

            <div className="mt-5">
            <form.Field name="consentimiento">
              {(field) => (
                <>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.state.value}
                      onChange={(e) => field.handleChange(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-primary shrink-0"
                    />
                    <span className="text-xs text-gray-600 leading-relaxed">
                      {t('realizarDenuncia.consentLabel')}
                    </span>
                  </label>
                  {field.state.meta.errors[0] && <p className="mt-1 text-xs text-action">{field.state.meta.errors[0]}</p>}
                </>
              )}
            </form.Field>
          </div>

            <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/admin/denuncias')}
              className="rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {t('realizarDenuncia.back')}
            </button>
            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <button
                  type="submit"
                  disabled={isSubmitting || mutation.isPending}
                  className="rounded-full bg-action px-8 py-2.5 text-sm font-semibold text-white hover:bg-action/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting || mutation.isPending ? t('realizarDenuncia.creating') : t('realizarDenuncia.createDenuncia')}
                </button>
              )}
            </form.Subscribe>
          </div>
          </SectionCard>
        </div>
        </main>
      </form>
    </>
  )
}
