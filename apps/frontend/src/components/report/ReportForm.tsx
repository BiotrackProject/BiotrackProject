import React, { useState } from 'react'
import { UploadCloud, CheckCircle, X } from 'lucide-react'
import { denunciasService, filtrarEvidencias, EVIDENCIA_MAX_FILES, EVIDENCIA_MAX_SIZE_MB, TIPOS_ACTIVIDAD, TIPO_LABEL } from '../../services/denunciasService'
import { toast } from '../../utils/toast'
import LocationPickerMap from '../map/LocationPickerMap'

const URGENCY_LEVELS = ['Baja', 'Media', 'Alta', 'Riesgo inmediato']

const EMPTY = {
  location: '', activityType: '', datetime: '',
  urgency: '', description: '', evidence: [] as File[],
  name: '', contact: '', gps: '',
}

// ── helpers ──────────────────────────────────────────────────────────────────
const isValidContact = (val) => {
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phone = /^(809|829|849)[- ]?\d{3}[- ]?\d{4}$/
  return email.test(val) || phone.test(val)
}

type FormValues = typeof EMPTY

const validate = (form: FormValues): Record<string, string> => {
  const e: Record<string, string> = {}
  if (!form.location.trim() || form.location.trim().length < 5)
    e.location = 'Describe la ubicación con al menos 5 caracteres.'
  if (!form.activityType)
    e.activityType = 'Selecciona el tipo de actividad.'
  if (!form.datetime)
    e.datetime = 'Indica la fecha y hora aproximada.'
  else if (new Date(form.datetime) > new Date())
    e.datetime = 'La fecha y hora no pueden ser futuras.'
  if (!form.urgency)
    e.urgency = 'Selecciona el nivel de urgencia.'
  if (!form.description.trim() || form.description.trim().length < 20)
    e.description = 'La descripción debe tener al menos 20 caracteres.'
  if (form.contact.trim() && !isValidContact(form.contact.trim()))
    e.contact = 'Ingresa un correo o teléfono válido (Ej. 809-000-0000).'
  return e
}

// ── sub-components ────────────────────────────────────────────────────────────
function Field({ label, error, hint = '', children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-action">{error}</p>}
    </div>
  )
}

const inputCls = (err) =>
  `w-full rounded-xl border px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors ${
    err
      ? 'border-action focus:ring-1 focus:ring-action'
      : 'border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary'
  }`

// ── main component ────────────────────────────────────────────────────────────
export default function ReportForm() {
  const [form, setForm]     = useState(EMPTY)
  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const [sent, setSent]     = useState(false)
  const [trackingId, setTrackingId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const removeEvidence = (index) =>
    setForm((f) => ({ ...f, evidence: f.evidence.filter((_, j) => j !== index) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }

    // datetime-local "2026-06-15T14:30" -> fecha (YYYY-MM-DD) + hora (HH:MM)
    const [fecha, hora] = form.datetime.split('T')
    const contacto = [form.name.trim(), form.contact.trim()].filter(Boolean).join(' · ').slice(0, 500)

    setSubmitting(true)
    try {
      const result = await denunciasService.crear({
        Descripcion: form.description.trim(),
        tipo_actividad: form.activityType as typeof TIPOS_ACTIVIDAD[number],
        fecha_incidente: fecha || undefined,
        hora_aproximada: hora || undefined,
        detalle_ubicacion: form.location.trim() || undefined,
        gps: form.gps || undefined,
        nivel_urgencia: form.urgency || undefined,
        contacto: contacto || undefined,
        evidencias: form.evidence,
      })
      setTrackingId(result.codigo_seguimiento)
      setSent(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo enviar el reporte')
    } finally {
      setSubmitting(false)
    }
  }

  const saveDraft = () => {
    // TODO: POST /api/reports/draft when backend is ready
    localStorage.setItem('biotrack_report_draft', JSON.stringify(form))
    alert('Borrador guardado localmente.')
  }

  if (sent) {
    return (
      <div className="rounded-2xl bg-white px-6 py-12 shadow-sm sm:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle className="h-14 w-14 text-green-500" />
          <h2 className="text-2xl font-black text-primary">¡Reporte enviado!</h2>
          <p className="max-w-sm text-sm text-gray-500">
            Tu reporte fue recibido. Puede pasar al estado "En verificación" en
            las próximas horas.
          </p>
          <p className="rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-primary">
            ID de seguimiento: {trackingId}
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-xl rounded-xl border border-gray-100 bg-surface p-5">
          <p className="text-sm font-bold text-primary">¿Qué sigue ahora?</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
            <li>Tu denuncia entra a revisión inicial por el equipo técnico.</li>
            <li>Podrás consultar su estado con el ID en la sección de búsqueda de reportes.</li>
            <li>Si dejaste contacto, podrás recibir notificaciones de avance.</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href={`/reportes?q=${encodeURIComponent(trackingId)}`}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Consultar estado
          </a>
          <button
            type="button"
            onClick={() => { setSent(false); setForm(EMPTY); setErrors({}); setTrackingId('') }}
            className="rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary hover:text-white"
          >
            Registrar otro reporte
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ── Información del reporte ─────────────────────────────────────── */}
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-xl font-black text-primary">
          Información del reporte
        </h2>

        {/* Row 1 */}
        <div className="grid gap-6 md:grid-cols-2">
          <Field
            label="Ubicación"
            error={errors.location}
            hint="Puedes escribir una referencia o seleccionar un punto en el mapa."
          >
            <input
              type="text"
              placeholder="Ej. Río Ozama, tramo cercano a..."
              value={form.location}
              onChange={set('location')}
              className={inputCls(errors.location)}
            />
          </Field>

          <Field label="Tipo de actividad observada" error={errors.activityType}>
            <select
              value={form.activityType}
              onChange={set('activityType')}
              className={inputCls(errors.activityType)}
            >
              <option value="">Seleccionar</option>
              {TIPOS_ACTIVIDAD.map((t) => (
                <option key={t} value={t}>{TIPO_LABEL[t]}</option>
              ))}
            </select>
            {!errors.activityType && (
              <p className="text-xs text-gray-400">
                Elige la opción más cercana a lo observado.
              </p>
            )}
          </Field>
        </div>

        {/* Row 2 */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Field
            label="Fecha y hora aproximada"
            error={errors.datetime}
            hint="Si no estás seguro, selecciona un aproximado."
          >
            <input
              type="datetime-local"
              value={form.datetime}
              onChange={set('datetime')}
              className={inputCls(errors.datetime)}
            />
          </Field>

          <Field label="Nivel de urgencia" error={errors.urgency}>
            <div className="flex flex-wrap gap-x-5 gap-y-3 pt-1">
              {URGENCY_LEVELS.map((level) => (
                <label key={level} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="urgency"
                    value={level}
                    checked={form.urgency === level}
                    onChange={set('urgency')}
                    className="accent-primary"
                  />
                  {level}
                </label>
              ))}
            </div>
            {!errors.urgency && (
              <p className="text-xs text-gray-400">
                Esto ayuda a priorizar el seguimiento institucional.
              </p>
            )}
          </Field>
        </div>

        {/* Map */}
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-gray-700">Ubicación en mapa</p>
          <LocationPickerMap
            lat={form.gps ? Number(form.gps.split(',')[0]) : null}
            lng={form.gps ? Number(form.gps.split(',')[1]) : null}
            height="13rem"
            onChange={(point) =>
              setForm((f) => ({
                ...f,
                gps: point ? `${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}` : '',
              }))
            }
          />
        </div>

        {/* Description */}
        <div className="mt-6">
          <Field label="Descripción breve" error={errors.description}>
            <textarea
              rows={4}
              placeholder="Describe lo que observaste: maquinaria, cantidad de camiones, personas, dirección de movimiento, etc."
              value={form.description}
              onChange={set('description')}
              className={`resize-none ${inputCls(errors.description)}`}
            />
          </Field>
        </div>

        {/* Row: Evidence */}
        <div className="mt-6 border-t border-gray-100 pt-6">
          <Field label="Evidencia (opcional)">
            <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-surface px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100">
              <UploadCloud className="h-4 w-4" />
              Adjuntar archivos
              <input
                type="file"
                accept="image/*,video/*,audio/*,application/pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  const { aceptados, errores } = filtrarEvidencias(form.evidence, Array.from(e.target.files ?? []))
                  if (errores.length) toast.error(errores.join(' '))
                  if (aceptados.length) setForm((f) => ({ ...f, evidence: [...f.evidence, ...aceptados] }))
                  e.target.value = ''
                }}
              />
            </label>
            <p className="text-xs text-gray-400">
              Imágenes, video, audio o PDF. Máx. {EVIDENCIA_MAX_FILES} archivos, {EVIDENCIA_MAX_SIZE_MB} MB c/u.
            </p>
            {form.evidence.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-2">
                {form.evidence.map((file, i) => (
                  <li key={i} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600">
                    {file.name}
                    <button
                      type="button"
                      onClick={() => removeEvidence(i)}
                      className="text-gray-400 hover:text-action"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Field>
        </div>
      </div>

      {/* ── Contacto ────────────────────────────────────────────────────── */}
      <div className="mt-6 rounded-2xl bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-xl font-black text-primary">Contacto</h2>

        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Nombre">
            <input
              type="text"
              placeholder="Tu nombre"
              value={form.name}
              onChange={set('name')}
              className={inputCls(false)}
            />
          </Field>

          <Field label="Teléfono o correo (opcional)" error={errors.contact}>
            <input
              type="text"
              placeholder="Ej. 809-000-0000 o correo@dominio.com"
              value={form.contact}
              onChange={set('contact')}
              className={inputCls(errors.contact)}
            />
          </Field>
        </div>
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={saveDraft}
            className="rounded-lg border border-primary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            Guardar borrador
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-action px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Enviando...' : 'Enviar reporte'}
          </button>
        </div>
        <p className="text-xs text-gray-400">
          Al enviar, aceptas que la información sea utilizada con fines de
          verificación y seguimiento institucional.
        </p>
      </div>
    </form>
  )
}
