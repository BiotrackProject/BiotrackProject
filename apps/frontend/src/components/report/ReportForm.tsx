import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UploadCloud, CheckCircle } from 'lucide-react'

const EMPTY = {
  location: '', activityType: '', datetime: '',
  urgency: '', description: '', evidence: null,
  name: '', contact: '',
}

// ── helpers ──────────────────────────────────────────────────────────────────
const isValidContact = (val) => {
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phone = /^(809|829|849)[- ]?\d{3}[- ]?\d{4}$/
  return email.test(val) || phone.test(val)
}

type FormValues = typeof EMPTY

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
  const { t } = useTranslation()
  const [form, setForm]     = useState(EMPTY)
  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const [sent, setSent]     = useState(false)
  const [trackingId, setTrackingId] = useState('')

  const ACTIVITY_TYPES = [
    { value: 'heavyMachinery', label: t('reportForm.activityTypes.heavyMachinery') },
    { value: 'manual', label: t('reportForm.activityTypes.manual') },
    { value: 'illegalTransport', label: t('reportForm.activityTypes.illegalTransport') },
    { value: 'dumping', label: t('reportForm.activityTypes.dumping') },
    { value: 'other', label: t('reportForm.activityTypes.other') },
  ]

  const URGENCY_LEVELS = [
    { value: 'low', label: t('reportForm.urgencyLevels.low') },
    { value: 'medium', label: t('reportForm.urgencyLevels.medium') },
    { value: 'high', label: t('reportForm.urgencyLevels.high') },
    { value: 'immediate', label: t('reportForm.urgencyLevels.immediate') },
  ]

  const validate = (form: FormValues): Record<string, string> => {
    const e: Record<string, string> = {}
    if (!form.location.trim() || form.location.trim().length < 5)
      e.location = t('reportForm.validation.locationMin')
    if (!form.activityType)
      e.activityType = t('reportForm.validation.activityRequired')
    if (!form.datetime)
      e.datetime = t('reportForm.validation.datetimeRequired')
    else if (new Date(form.datetime) > new Date())
      e.datetime = t('reportForm.validation.datetimeFuture')
    if (!form.urgency)
      e.urgency = t('reportForm.validation.urgencyRequired')
    if (!form.description.trim() || form.description.trim().length < 20)
      e.description = t('reportForm.validation.descriptionMin')
    if (form.contact.trim() && !isValidContact(form.contact.trim()))
      e.contact = t('reportForm.validation.contactInvalid')
    return e
  }

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    // TODO: POST /api/reports when backend is ready
    setTrackingId(`BR-${Date.now().toString().slice(-6)}`)
    setSent(true)
  }

  const saveDraft = () => {
    // TODO: POST /api/reports/draft when backend is ready
    localStorage.setItem('biotrack_report_draft', JSON.stringify(form))
    alert(t('reportForm.draftSaved'))
  }

  if (sent) {
    return (
      <div className="rounded-2xl bg-white px-6 py-12 shadow-sm sm:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle className="h-14 w-14 text-green-500" />
          <h2 className="text-2xl font-black text-primary">{t('reportForm.successTitle')}</h2>
          <p className="max-w-sm text-sm text-gray-500">
            {t('reportForm.successMsg')}
          </p>
          <p className="rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-primary">
            {t('reportForm.trackingLabel', { id: trackingId })}
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-xl rounded-xl border border-gray-100 bg-surface p-5">
          <p className="text-sm font-bold text-primary">{t('reportForm.nextStepsTitle')}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
            <li>{t('reportForm.nextStep1')}</li>
            <li>{t('reportForm.nextStep2')}</li>
            <li>{t('reportForm.nextStep3')}</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href={`/reportes?q=${encodeURIComponent(trackingId)}`}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
          >
            {t('reportForm.checkStatus')}
          </a>
          <button
            type="button"
            onClick={() => { setSent(false); setForm(EMPTY); setErrors({}); setTrackingId('') }}
            className="rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary hover:text-white"
          >
            {t('reportForm.newReport')}
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
          {t('reportForm.infoTitle')}
        </h2>

        {/* Row 1 */}
        <div className="grid gap-6 md:grid-cols-2">
          <Field
            label={t('reportForm.locationLabel')}
            error={errors.location}
            hint={t('reportForm.locationHint')}
          >
            <input
              type="text"
              placeholder={t('reportForm.locationPlaceholder')}
              value={form.location}
              onChange={set('location')}
              className={inputCls(errors.location)}
            />
          </Field>

          <Field label={t('reportForm.activityLabel')} error={errors.activityType}>
            <select
              value={form.activityType}
              onChange={set('activityType')}
              className={inputCls(errors.activityType)}
            >
              <option value="">{t('reportForm.selectDefault')}</option>
              {ACTIVITY_TYPES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
            {!errors.activityType && (
              <p className="text-xs text-gray-400">
                {t('reportForm.activityHint')}
              </p>
            )}
          </Field>
        </div>

        {/* Row 2 */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Field
            label={t('reportForm.datetimeLabel')}
            error={errors.datetime}
            hint={t('reportForm.datetimeHint')}
          >
            <input
              type="datetime-local"
              value={form.datetime}
              onChange={set('datetime')}
              className={inputCls(errors.datetime)}
            />
          </Field>

          <Field label={t('reportForm.urgencyLabel')} error={errors.urgency}>
            <div className="flex flex-wrap gap-x-5 gap-y-3 pt-1">
              {URGENCY_LEVELS.map((level) => (
                <label key={level.value} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="urgency"
                    value={level.value}
                    checked={form.urgency === level.value}
                    onChange={set('urgency')}
                    className="accent-primary"
                  />
                  {level.label}
                </label>
              ))}
            </div>
            {!errors.urgency && (
              <p className="text-xs text-gray-400">
                {t('reportForm.urgencyHint')}
              </p>
            )}
          </Field>
        </div>

        {/* Map */}
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-gray-700">{t('reportForm.mapLabel')}</p>
          <div className="overflow-hidden rounded-xl border-2 border-dashed border-blue-200 bg-blue-50">
            <iframe
              title="Mapa República Dominicana"
              className="h-52 w-full border-0"
              loading="lazy"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-72.0%2C17.4%2C-68.3%2C20.1&layer=mapnik"
            />
          </div>
          <p className="mt-1 text-center text-xs">
            <a
              href="https://www.openstreetmap.org/#map=9/18.7/70.1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {t('reportForm.mapLinkText')}
            </a>
          </p>
        </div>

        {/* Description */}
        <div className="mt-6">
          <Field label={t('reportForm.descriptionLabel')} error={errors.description}>
            <textarea
              rows={4}
              placeholder={t('reportForm.descriptionPlaceholder')}
              value={form.description}
              onChange={set('description')}
              className={`resize-none ${inputCls(errors.description)}`}
            />
          </Field>
        </div>

        {/* Row: Evidence */}
        <div className="mt-6 border-t border-gray-100 pt-6">
          <Field label={t('reportForm.evidenceLabel')}>
            <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-surface px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100">
              <UploadCloud className="h-4 w-4" />
              {form.evidence ? form.evidence.name : t('reportForm.evidenceAttach')}
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) =>
                  setForm((f) => ({ ...f, evidence: e.target.files[0] ?? null }))
                }
              />
            </label>
            <p className="text-xs text-gray-400">{t('reportForm.evidenceHint')}</p>
          </Field>
        </div>
      </div>

      {/* ── Contacto ────────────────────────────────────────────────────── */}
      <div className="mt-6 rounded-2xl bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-xl font-black text-primary">{t('reportForm.contactTitle')}</h2>

        <div className="grid gap-6 md:grid-cols-2">
          <Field label={t('reportForm.nameLabel')}>
            <input
              type="text"
              placeholder={t('reportForm.namePlaceholder')}
              value={form.name}
              onChange={set('name')}
              className={inputCls(false)}
            />
          </Field>

          <Field label={t('reportForm.contactLabel')} error={errors.contact}>
            <input
              type="text"
              placeholder={t('reportForm.contactPlaceholder')}
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
            {t('reportForm.saveDraft')}
          </button>
          <button
            type="submit"
            className="rounded-lg bg-action px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
          >
            {t('reportForm.submit')}
          </button>
        </div>
        <p className="text-xs text-gray-400">
          {t('reportForm.disclaimer')}
        </p>
      </div>
    </form>
  )
}
