// @ts-nocheck
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { MapPin, CheckCircle } from 'lucide-react'
import BackofficeTopbar from '../../components/backoffice/BackofficeTopbar'
import LocationPickerMap from '../../components/map/LocationPickerMap'
import Modal from '../../components/ui/Modal'
import { monitoreoService } from '../../services/monitoreoService'
import { usuariosService, type Usuario } from '../../services/usuariosService'
import { toast } from '../../utils/toast'

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
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const [submitted, setSubmitted]   = useState(false)
  const [mapOpen, setMapOpen]       = useState(false)
  const [saving, setSaving]         = useState(false)
  const [mapPin, setMapPin]         = useState(null)
  const [usuarios, setUsuarios]     = useState<Usuario[]>([])

  // Value is the API value (Spanish); label is what's shown to the user
  const FRECUENCIAS = [
    { value: 'Diario',    label: t('planificar.freqDaily') },
    { value: 'Semanal',   label: t('planificar.freqWeekly') },
    { value: 'Quincenal', label: t('planificar.freqBiweekly') },
    { value: 'Mensual',   label: t('planificar.freqMonthly') },
  ]
  const DIAS = [
    { value: 'Lun', label: t('planificar.dayMon') },
    { value: 'Mar', label: t('planificar.dayTue') },
    { value: 'Mié', label: t('planificar.dayWed') },
    { value: 'Jue', label: t('planificar.dayThu') },
    { value: 'Vie', label: t('planificar.dayFri') },
    { value: 'Sáb', label: t('planificar.daySat') },
    { value: 'Dom', label: t('planificar.daySun') },
  ]
  const MEDIOS = [
    { value: 'Drones',    label: t('planificar.meanDrones') },
    { value: 'Motor',     label: t('planificar.meanMotor') },
    { value: 'Auto',      label: t('planificar.meanAuto') },
    { value: 'Camioneta', label: t('planificar.meanTruck') },
  ]

  useEffect(() => {
    usuariosService.getAll()
      .then((lista) => setUsuarios(lista.filter((u) => u.Estado === 'Activo')))
      .catch(() => {})
  }, [])

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
    if (!form.nombre.trim()) e.nombre = t('planificar.required')
    if (!form.fechaInicio) e.fechaInicio = t('planificar.required')
    if (!form.frecuencia) e.frecuencia = t('planificar.required')
    if (!form.responsable) e.responsable = t('planificar.required')
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
      toast.success(t('planificar.createSuccess'))
      setSubmitted(true)
    } catch {
      toast.error(t('planificar.createError'))
    } finally {
      setSaving(false)
    }
  }

  if (submitted) {
    return (
      <>
        <BackofficeTopbar title={t('planificar.title')} backTo={`/admin/monitoreo/${id}`} />
        <main className="flex flex-col items-center justify-center p-16 gap-4">
          <CheckCircle className="h-16 w-16 text-emerald-500" />
          <h2 className="text-xl font-bold text-primary">{t('planificar.successTitle')}</h2>
          <p className="text-sm text-gray-500">{t('planificar.successMsg')}</p>
          <button onClick={() => navigate(`/admin/monitoreo/${id}`)} className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
            {t('planificar.viewMonitoreo')}
          </button>
        </main>
      </>
    )
  }

  return (
    <>
      <BackofficeTopbar title={t('planificar.title')} backTo={`/admin/monitoreo/${id}`} />

      <main className="p-8">
        <div data-tour="backoffice-plan-form" className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-gray-700 mb-6">{t('planificar.formTitle')}</h2>

          <div className="grid grid-cols-3 gap-5 mb-5">
            <div>
              <Label>{t('planificar.nameLabel')}</Label>
              <Input placeholder={t('planificar.namePlaceholder')} value={form.nombre} onChange={(e) => set('nombre', e.target.value)} error={errors.nombre} />
            </div>
            <div>
              <Label required>{t('planificar.startDateLabel')}</Label>
              <Input type="date" value={form.fechaInicio} onChange={(e) => set('fechaInicio', e.target.value)} error={errors.fechaInicio} />
            </div>
            <div>
              <Label>{t('planificar.startTimeLabel')}</Label>
              <Input type="time" value={form.horaInicio} onChange={(e) => set('horaInicio', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5 mb-5">
            <div>
              <Label required>{t('planificar.frequencyLabel')}</Label>
              <select
                value={form.frecuencia}
                onChange={(e) => set('frecuencia', e.target.value)}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-700 outline-none bg-white transition-colors ${errors.frecuencia ? 'border-action' : 'border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary'}`}
              >
                <option value="">{t('planificar.frequencyPlaceholder')}</option>
                {FRECUENCIAS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
              {errors.frecuencia && <p className="mt-1 text-xs text-action">{errors.frecuencia}</p>}
            </div>

            <div>
              <Label>{t('planificar.daysLabel')}</Label>
              <div className="flex flex-wrap gap-x-3 gap-y-2 mt-1">
                {DIAS.map((d) => (
                  <label key={d.value} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600">
                    <input type="checkbox" checked={form.diasSemanales.includes(d.value)} onChange={() => toggleArray('diasSemanales', d.value)} className="accent-primary w-4 h-4" />
                    {d.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>{t('planificar.meansLabel')}</Label>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-1">
                {MEDIOS.map((m) => (
                  <label key={m.value} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600">
                    <input type="checkbox" checked={form.medios.includes(m.value)} onChange={() => toggleArray('medios', m.value)} className="accent-primary w-4 h-4" />
                    {m.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5 mb-8">
            <div className="col-span-2">
              <Label required>{t('planificar.responsibleLabel')}</Label>
              <select
                value={form.responsable}
                onChange={(e) => set('responsable', e.target.value)}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-700 outline-none bg-white transition-colors ${errors.responsable ? 'border-action' : 'border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary'}`}
              >
                <option value="">{t('planificar.responsiblePlaceholder')}</option>
                {usuarios.map((u) => (
                  <option key={u.IDUsuario} value={u.IDUsuario}>
                    {u.nombre_completo}{u.cargo ? ` — ${u.cargo}` : ''}
                  </option>
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
                {t('planificar.defineRouteBtn')}
              </button>
            </div>
          </div>

          {mapPin && (
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm text-primary border border-primary/20">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{t('planificar.pinDefined')} <span className="font-mono text-xs">{mapPin.lat.toFixed(4)}, {mapPin.lng.toFixed(4)}</span></span>
              <button onClick={() => setMapPin(null)} className="ml-auto text-xs text-action hover:underline">{t('planificar.removePin')}</button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button onClick={() => navigate(`/admin/monitoreo/${id}`)} className="rounded-lg border border-gray-300 bg-white px-8 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              {t('planificar.backBtn')}
            </button>
            <button onClick={handleSubmit} disabled={saving} className="rounded-lg bg-primary px-8 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {saving ? t('planificar.creating') : t('planificar.createBtn')}
            </button>
          </div>
        </div>
      </main>

      <Modal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        title={t('planificar.mapModalTitle')}
        confirmLabel={mapPin ? t('planificar.mapConfirm') : t('planificar.mapClose')}
        onConfirm={() => setMapOpen(false)}
      >
        <p className="text-xs text-gray-500 mb-3">
          {t('planificar.mapInstruction')}
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
