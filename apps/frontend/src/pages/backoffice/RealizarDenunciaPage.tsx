// @ts-nocheck
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm, useStore } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UploadCloud, X, CheckCircle } from 'lucide-react'
import BackofficeTopbar from '../../components/backoffice/BackofficeTopbar'
import { denunciasService, filtrarEvidencias, TIPOS_ACTIVIDAD, TIPO_LABEL } from '../../services/denunciasService'
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
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
            <input
              type="radio"
              name={name}
              value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="accent-primary w-4 h-4"
            />
            {opt}
          </label>
        ))}
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
      toast.error(err instanceof Error ? err.message : 'Error al crear la denuncia')
    },
  })

  const form = useForm({
    defaultValues: DEFAULT_VALUES,
    validators: {
      onSubmit: ({ value }) => {
        const fields = {}
        const anon = value.anonimo === 'Sí'
        if (!value.anonimo) fields.anonimo = 'Requerido'
        if (!anon && !value.nombres.trim()) fields.nombres = 'Requerido'
        if (!anon && !value.apellidos.trim()) fields.apellidos = 'Requerido'
        if (!value.tipoActividad) fields.tipoActividad = 'Requerido'
        if (!value.fechaIncidente) fields.fechaIncidente = 'Requerido'
        if (!value.detalleUbicacion.trim()) fields.detalleUbicacion = 'Requerido'
        if (!value.tipoExtraccion) fields.tipoExtraccion = 'Requerido'
        if (!value.numPersonas) fields.numPersonas = 'Requerido'
        if (!value.cantidadArena.trim()) fields.cantidadArena = 'Requerido'
        if (!value.detalleActividad.trim()) fields.detalleActividad = 'Requerido'
        if (!value.consentimiento) fields.consentimiento = 'Debes aceptar la declaración para continuar'
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
          <h2 className="text-xl font-bold text-primary">Denuncia creada exitosamente</h2>
          <p className="text-sm text-gray-500">La denuncia ha sido registrada en el sistema.</p>
          {codigoSeguimiento && (
            <p className="text-sm text-gray-500">
              Código de seguimiento:{' '}
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
                    label="Deseas Permanecer Anónimo/a"
                    required
                    name="anonimo"
                    options={['Sí', 'No']}
                    value={field.state.value}
                    onChange={(v) => field.handleChange(v)}
                    error={field.state.meta.errors[0]}
                  />
                )}
              </form.Field>
            </div>
            <div>
              <Label required={!isAnon}>Nombres</Label>
              <form.Field name="nombres">
                {(field) => (
                  <Input
                    placeholder="Nombres"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={isAnon}
                    error={field.state.meta.errors[0]}
                  />
                )}
              </form.Field>
            </div>
            <div>
              <Label required={!isAnon}>Apellidos</Label>
              <form.Field name="apellidos">
                {(field) => (
                  <Input
                    placeholder="Apellidos"
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
              <Label>Correo Electrónico</Label>
              <form.Field name="correo">
                {(field) => (
                  <Input
                    type="email"
                    placeholder="Correo Electrónico"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={isAnon}
                  />
                )}
              </form.Field>
            </div>
            <div>
              <Label>Teléfono de contacto</Label>
              <form.Field name="telefono">
                {(field) => (
                  <Input
                    type="tel"
                    placeholder="(000)-000-000"
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
              <Label required>Fecha del incidente</Label>
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
              <Label>Hora aproximada</Label>
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
              <Label>Coordenadas GPS</Label>
              <form.Field name="gps">
                {(field) => (
                  <Input
                    placeholder="Ejemplo: 18.7357, -70.1627"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </form.Field>
            </div>
            <div className="col-span-3">
              <Label required>Detalle de la ubicación</Label>
              <form.Field name="detalleUbicacion">
                {(field) => (
                  <>
                    <textarea
                      rows={3}
                      placeholder="Describir la zona afectada..."
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
              <Label required>Tipo de actividad</Label>
              <form.Field name="tipoActividad">
                {(field) => (
                  <Select
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={field.state.meta.errors[0]}
                  >
                    <option value="">Seleccione el tipo de actividad</option>
                    {TIPOS_ACTIVIDAD.map((tipo) => <option key={tipo} value={tipo}>{TIPO_LABEL[tipo]}</option>)}
                  </Select>
                )}
              </form.Field>
            </div>
            <form.Field name="tipoExtraccion">
              {(field) => (
                <RadioGroup
                  label="Tipo de extracción observada"
                  required
                  name="tipoExtraccion"
                  options={['Manual', 'Maquinaria pesada']}
                  value={field.state.value}
                  onChange={(v) => field.handleChange(v)}
                  error={field.state.meta.errors[0]}
                />
              )}
            </form.Field>
            <form.Field name="numPersonas">
              {(field) => (
                <RadioGroup
                  label="Número de personas involucradas"
                  required
                  name="numPersonas"
                  options={['1-5', 'Más de 6 personas']}
                  value={field.state.value}
                  onChange={(v) => field.handleChange(v)}
                  error={field.state.meta.errors[0]}
                />
              )}
            </form.Field>
            <div>
              <Label required>Cantidad estimada de arena extraída</Label>
              <form.Field name="cantidadArena">
                {(field) => (
                  <Input
                    placeholder='Ejemplo: "Un camión lleno"'
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={field.state.meta.errors[0]}
                  />
                )}
              </form.Field>
            </div>
            <div className="col-span-3">
              <Label required>Detalle de la actividad realizada</Label>
              <form.Field name="detalleActividad">
                {(field) => (
                  <>
                    <textarea
                      rows={3}
                      placeholder="Describir la actividad observada..."
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
                      Declaro que la información proporcionada es verídica y doy mi consentimiento para que sea utilizada en investigaciones relacionadas.
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
                  {isSubmitting || mutation.isPending ? 'Creando...' : 'Crear Denuncia'}
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
