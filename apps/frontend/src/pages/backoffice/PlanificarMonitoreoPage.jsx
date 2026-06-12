import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MapPin, CheckCircle } from 'lucide-react'
import BackofficeTopbar from '../../components/backoffice/BackofficeTopbar'
import LocationPickerMap from '../../components/map/LocationPickerMap'
import Modal from '../../components/ui/Modal'
import { monitoreoService } from '../../services/monitoreoService'
import { toast } from '../../utils/toast'
import { PROVINCIAS_MUNICIPIOS } from '../../data/mockDenuncias'

const PROVINCIAS = Object.keys(PROVINCIAS_MUNICIPIOS).sort()
const FRECUENCIAS = ['Diario', 'Semanal', 'Quincenal', 'Mensual']
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MEDIOS = ['Drones', 'Motor', 'Auto', 'Camioneta']

function Label({ children, required }) {
  return (
    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
      {children}{required && <span className="text-action ml-0.5">*</span>}
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

export default function PlanificarMonitoreoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [mapOpen, setMapOpen]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [mapPin, setMapPin]       = useState(null)   // { lat, lng } | null

  const [form, setForm] = useState({
    nombre: '',
    fechaInicio: '',
    horaInicio: '',
    frecuencia: '',
    diasSemanales: [],
    medios: [],
    responsable: '',
  })
  const [errors, setErrors] = useState({})

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }))
  }

  function toggleArray(field, val) {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter((v) => v !== val) : [...f[field], val],
    }))
  }

  function validate() {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (!form.fechaInicio) e.fechaInicio = 'Requerido'
    if (!form.frecuencia) e.frecuencia = 'Requerido'
    if (!form.responsable) e.responsable = 'Requerido'
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      await monitoreoService.createPlan({
        denunciaId: id,
        nombre: form.nombre,
        fechaInicio: form.fechaInicio,
        horaInicio: form.horaInicio,
        frecuencia: form.frecuencia,
        diasSemanales: form.diasSemanales,
        medios: form.medios,
        responsable: form.responsable,
        gps: mapPin ? `${mapPin.lat.toFixed(5)}, ${mapPin.lng.toFixed(5)}` : null,
      })
      toast.success('Plan de monitoreo creado correctamente')
      setSubmitted(true)
    } catch {
      toast.error('Error al crear el plan de monitoreo. Inténtalo de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  if (submitted) {
    return (
      <>
        <BackofficeTopbar title="Planificación de Monitoreo" backTo={`/admin/monitoreo/${id}`} />
        <main className="flex flex-col items-center justify-center p-16 gap-4">
          <CheckCircle className="h-16 w-16 text-emerald-500" />
          <h2 className="text-xl font-bold text-primary">Monitoreo creado exitosamente</h2>
          <p className="text-sm text-gray-500">El plan de monitoreo ha sido registrado.</p>
          <button onClick={() => navigate(`/admin/monitoreo/${id}`)} className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
            Ver Monitoreo
          </button>
        </main>
      </>
    )
  }

  return (
    <>
      <BackofficeTopbar title="Planificación de Monitoreo" backTo={`/admin/monitoreo/${id}`} />

      <main className="p-8">
        <div data-tour="backoffice-plan-form" className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-gray-700 mb-6">Planificación del monitoreo</h2>

          <div className="grid grid-cols-3 gap-5 mb-5">
            {/* Row 1 */}
            <div>
              <Label>Nombre del monitoreo</Label>
              <Input placeholder="Nombre del monitoreo" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} error={errors.nombre} />
            </div>
            <div>
              <Label required>Fecha de inicio de monitoreo</Label>
              <Input type="date" value={form.fechaInicio} onChange={(e) => set('fechaInicio', e.target.value)} error={errors.fechaInicio} />
            </div>
            <div>
              <Label>Hora de inicio de monitoreo</Label>
              <Input type="time" value={form.horaInicio} onChange={(e) => set('horaInicio', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5 mb-5">
            {/* Row 2 */}
            <div>
              <Label required>Frecuencia de monitoreo</Label>
              <select
                value={form.frecuencia}
                onChange={(e) => set('frecuencia', e.target.value)}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-700 outline-none bg-white transition-colors ${errors.frecuencia ? 'border-action' : 'border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary'}`}
              >
                <option value="">Seleccione una frecuencia</option>
                {FRECUENCIAS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
              {errors.frecuencia && <p className="mt-1 text-xs text-action">{errors.frecuencia}</p>}
            </div>

            <div>
              <Label>Días de monitoreo semanal</Label>
              <div className="flex flex-wrap gap-x-3 gap-y-2 mt-1">
                {DIAS.map((d) => (
                  <label key={d} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600">
                    <input type="checkbox" checked={form.diasSemanales.includes(d)} onChange={() => toggleArray('diasSemanales', d)} className="accent-primary w-4 h-4" />
                    {d}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>Medios o herramientas</Label>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-1">
                {MEDIOS.map((m) => (
                  <label key={m} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600">
                    <input type="checkbox" checked={form.medios.includes(m)} onChange={() => toggleArray('medios', m)} className="accent-primary w-4 h-4" />
                    {m}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5 mb-8">
            {/* Row 3 */}
            <div className="col-span-2">
              <Label required>Responsable del monitoreo</Label>
              <select
                value={form.responsable}
                onChange={(e) => set('responsable', e.target.value)}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-700 outline-none bg-white transition-colors ${errors.responsable ? 'border-action' : 'border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary'}`}
              >
                <option value="">Seleccione un Municipio</option>
                {PROVINCIAS.flatMap((p) => PROVINCIAS_MUNICIPIOS[p]).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              {errors.responsable && <p className="mt-1 text-xs text-action">{errors.responsable}</p>}
            </div>

            <div data-tour="backoffice-plan-map" className="flex items-end">
              <button
                onClick={() => setMapOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                <MapPin className="h-4 w-4" />
                Definir Ruta en el Mapa
              </button>
            </div>
          </div>

          {mapPin && (
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm text-primary border border-primary/20">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>Punto en mapa definido: <span className="font-mono text-xs">{mapPin.lat.toFixed(4)}, {mapPin.lng.toFixed(4)}</span></span>
              <button onClick={() => setMapPin(null)} className="ml-auto text-xs text-action hover:underline">Quitar</button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button onClick={() => navigate(`/admin/monitoreo/${id}`)} className="rounded-lg border border-gray-300 bg-white px-8 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Volver atrás
            </button>
            <button onClick={handleSubmit} disabled={saving} className="rounded-lg bg-primary px-8 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {saving ? 'Creando...' : 'Crear Monitoreo'}
            </button>
          </div>
        </div>
      </main>

      {/* Map modal — Leaflet interactive picker */}
      <Modal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        title="Definir Ruta en el Mapa"
        confirmLabel={mapPin ? 'Confirmar ubicación' : 'Cerrar sin seleccionar'}
        onConfirm={() => setMapOpen(false)}
      >
        <p className="text-xs text-gray-500 mb-3">
          Haz clic en el mapa para marcar el punto de inicio de la ruta de monitoreo.
        </p>
        <LocationPickerMap
          lat={mapPin?.lat}
          lng={mapPin?.lng}
          onChange={(point) => setMapPin(point)}
          height="340px"
        />
      </Modal>
    </>
  )
}
