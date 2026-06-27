// @ts-nocheck
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { UploadCloud, X, CheckCircle } from 'lucide-react'
import BackofficeTopbar from '../../components/backoffice/BackofficeTopbar'
import { PROVINCIAS_MUNICIPIOS } from '../../data/mockDenuncias'

const PROVINCIAS = Object.keys(PROVINCIAS_MUNICIPIOS).sort()

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

export default function RealizarDenunciaPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    fechaIncidente: '',
    hora: '',
    provincia: '',
    municipio: '',
    sector: '',
    gps: '',
    detalleUbicacion: '',
    tipoExtraccion: '',
    numPersonas: '',
    cantidadArena: '',
    detalleActividad: '',
    consentimiento: false,
  })
  const [files, setFiles] = useState([])
  const [errors, setErrors] = useState({})
  const [dragging, setDragging] = useState(false)

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }))
  }

  function addFiles(newFiles) {
    const valid = Array.from(newFiles).filter((f) =>
      ALLOWED_EXT.some((ext) => f.name.toLowerCase().endsWith(ext))
    )
    setFiles((prev) => [...prev, ...valid])
  }

  function validate() {
    const e = {}
    if (!form.nombres.trim()) e.nombres = t('realizarDenuncia.required')
    if (!form.apellidos.trim()) e.apellidos = t('realizarDenuncia.required')
    if (!form.fechaIncidente) e.fechaIncidente = t('realizarDenuncia.required')
    if (!form.provincia) e.provincia = t('realizarDenuncia.required')
    if (!form.municipio) e.municipio = t('realizarDenuncia.required')
    if (!form.sector.trim()) e.sector = t('realizarDenuncia.required')
    if (!form.detalleUbicacion.trim()) e.detalleUbicacion = t('realizarDenuncia.required')
    if (!form.tipoExtraccion) e.tipoExtraccion = t('realizarDenuncia.required')
    if (!form.numPersonas) e.numPersonas = t('realizarDenuncia.required')
    if (!form.cantidadArena.trim()) e.cantidadArena = t('realizarDenuncia.required')
    if (!form.detalleActividad.trim()) e.detalleActividad = t('realizarDenuncia.required')
    if (!form.consentimiento) e.consentimiento = t('realizarDenuncia.consentError')
    return e
  }

  function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    // TODO: POST /api/admin/denuncias
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <>
        <BackofficeTopbar title={t('realizarDenuncia.title')} backTo="/admin/denuncias" />
        <main className="flex flex-col items-center justify-center p-16 gap-4">
          <CheckCircle className="h-16 w-16 text-emerald-500" />
          <h2 className="text-xl font-bold text-primary">{t('realizarDenuncia.successTitle')}</h2>
          <p className="text-sm text-gray-500">{t('realizarDenuncia.successMsg')}</p>
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

      <main className="p-8 flex flex-col gap-5">
        {/* Información del Denunciante */}
        <div data-tour="backoffice-denuncia-form-personal">
          <SectionCard title={t('realizarDenuncia.personalInfo')}>
            <div className="grid grid-cols-3 gap-4">
            <div>
              <Label required>{t('realizarDenuncia.namesLabel')}</Label>
              <Input
                placeholder={t('realizarDenuncia.namesLabel')}
                value={form.nombres}
                onChange={(e) => set('nombres', e.target.value)}

                error={errors.nombres}
              />
            </div>
            <div>
              <Label>{t('realizarDenuncia.lastNameLabel')}</Label>
              <Input
                placeholder={t('realizarDenuncia.lastNameLabel')}
                value={form.apellidos}
                onChange={(e) => set('apellidos', e.target.value)}

                error={errors.apellidos}
              />
            </div>
            <div />
            <div>
              <Label>{t('realizarDenuncia.emailLabel')}</Label>
              <Input
                type="email"
                placeholder={t('realizarDenuncia.emailLabel')}
                value={form.correo}
                onChange={(e) => set('correo', e.target.value)}

              />
            </div>
            <div>
              <Label>{t('realizarDenuncia.phoneLabel')}</Label>
              <Input
                type="tel"
                placeholder={t('realizarDenuncia.phonePlaceholder')}
                value={form.telefono}
                onChange={(e) => set('telefono', e.target.value)}

              />
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
              <Input
                type="date"
                value={form.fechaIncidente}
                onChange={(e) => set('fechaIncidente', e.target.value)}
                error={errors.fechaIncidente}
              />
            </div>
            <div>
              <Label>{t('realizarDenuncia.timeLabel')}</Label>
              <Input
                type="time"
                value={form.hora}
                onChange={(e) => set('hora', e.target.value)}
              />
            </div>
            <div>
              <Label required>{t('realizarDenuncia.provinciaLabel')}</Label>
              <Select
                value={form.provincia}
                onChange={(e) => { set('provincia', e.target.value); set('municipio', '') }}
                error={errors.provincia}
              >
                <option value="">{t('realizarDenuncia.provinciaPlaceholder')}</option>
                {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </div>
            <div>
              <Label required>{t('realizarDenuncia.municipioLabel')}</Label>
              <Select
                value={form.municipio}
                onChange={(e) => set('municipio', e.target.value)}
                disabled={!form.provincia}
                error={errors.municipio}
              >
                <option value="">{t('realizarDenuncia.municipioPlaceholder')}</option>
                {(PROVINCIAS_MUNICIPIOS[form.provincia] ?? []).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label required>{t('realizarDenuncia.sectorLabel')}</Label>
              <Input
                placeholder={t('realizarDenuncia.sectorPlaceholder')}
                value={form.sector}
                onChange={(e) => set('sector', e.target.value)}
                error={errors.sector}
              />
            </div>
            <div>
              <Label>{t('realizarDenuncia.gpsLabel')}</Label>
              <Input
                placeholder={t('realizarDenuncia.gpsPlaceholder')}
                value={form.gps}
                onChange={(e) => set('gps', e.target.value)}
              />
            </div>
            <div className="col-span-3">
              <Label required>{t('realizarDenuncia.locationDetailLabel')}</Label>
              <textarea
                rows={3}
                placeholder={t('realizarDenuncia.locationDetailPlaceholder')}
                value={form.detalleUbicacion}
                onChange={(e) => set('detalleUbicacion', e.target.value)}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 outline-none resize-none transition-colors
                  ${errors.detalleUbicacion ? 'border-action focus:ring-1 focus:ring-action' : 'border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary'}`}
              />
              {errors.detalleUbicacion && <p className="mt-1 text-xs text-action">{errors.detalleUbicacion}</p>}
            </div>
            </div>
          </SectionCard>
        </div>

        {/* Detalles del Incidente */}
        <SectionCard title={t('realizarDenuncia.incidentDetails')}>
          <div className="grid grid-cols-3 gap-6">
            <RadioGroup
              label={t('realizarDenuncia.extractionTypeLabel')}
              required
              name="tipoExtraccion"
              options={[t('realizarDenuncia.extractionManual'), t('realizarDenuncia.extractionHeavy')]}
              value={form.tipoExtraccion}
              onChange={(v) => set('tipoExtraccion', v)}
              error={errors.tipoExtraccion}
            />
            <RadioGroup
              label={t('realizarDenuncia.peopleLabel')}
              required
              name="numPersonas"
              options={[t('realizarDenuncia.people1to5'), t('realizarDenuncia.peopleMore')]}
              value={form.numPersonas}
              onChange={(v) => set('numPersonas', v)}
              error={errors.numPersonas}
            />
            <div>
              <Label required>{t('realizarDenuncia.sandAmountLabel')}</Label>
              <Input
                placeholder={t('realizarDenuncia.sandAmountPlaceholder')}
                value={form.cantidadArena}
                onChange={(e) => set('cantidadArena', e.target.value)}
                error={errors.cantidadArena}
              />
            </div>
            <div className="col-span-3">
              <Label required>{t('realizarDenuncia.activityDetailLabel')}</Label>
              <textarea
                rows={3}
                placeholder={t('realizarDenuncia.locationDetailPlaceholder')}
                value={form.detalleActividad}
                onChange={(e) => set('detalleActividad', e.target.value)}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 outline-none resize-none transition-colors
                  ${errors.detalleActividad ? 'border-action focus:ring-1 focus:ring-action' : 'border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary'}`}
              />
              {errors.detalleActividad && <p className="mt-1 text-xs text-action">{errors.detalleActividad}</p>}
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
                  <button onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-action">
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}

            <div className="mt-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.consentimiento}
                onChange={(e) => set('consentimiento', e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-primary shrink-0"
              />
              <span className="text-xs text-gray-600 leading-relaxed">
                {t('realizarDenuncia.consentLabel')}
              </span>
            </label>
            {errors.consentimiento && <p className="mt-1 text-xs text-action">{errors.consentimiento}</p>}
          </div>

            <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => navigate('/admin/denuncias')}
              className="rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {t('realizarDenuncia.back')}
            </button>
            <button
              onClick={handleSubmit}
              className="rounded-full bg-action px-8 py-2.5 text-sm font-semibold text-white hover:bg-action/90 transition-colors"
            >
              {t('realizarDenuncia.createDenuncia')}
            </button>
          </div>
          </SectionCard>
        </div>
      </main>
    </>
  )
}
