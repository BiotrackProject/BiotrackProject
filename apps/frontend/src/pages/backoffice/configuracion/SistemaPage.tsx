// @ts-nocheck
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Save, Bell, Shield, Globe, Database } from 'lucide-react'
import BackofficeTopbar from '../../../components/backoffice/BackofficeTopbar'

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="mb-5 flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h3 className="text-sm font-bold text-primary uppercase tracking-wide">{title}</h3>
    </div>
  )
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-50 py-3 last:border-0 sm:items-center">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${checked ? 'bg-primary' : 'bg-gray-200'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  )
}

function FieldRow({ label, description, children }) {
  return (
    <div className="flex flex-col items-start gap-2 border-b border-gray-50 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div className="w-full sm:w-auto sm:shrink-0">{children}</div>
    </div>
  )
}

export default function SistemaPage() {
  const { t } = useTranslation()
  const [saved, setSaved] = useState(false)

  const [notif, setNotif] = useState({
    emailNuevaDenuncia: true,
    emailCambioEstado: true,
    emailResumenSemanal: false,
    smsAlertas: false,
  })

  const [seguridad, setSeguridad] = useState({
    dobleAutenticacion: false,
    sesionInactividad: '30',
    ipWhitelist: false,
  })

  const [general, setGeneral] = useState({
    nombreSistema: 'BIOTRACK',
    timezone: 'America/Santo_Domingo',
    idioma: 'es',
    maxEvidenciaMB: '50',
  })

  async function handleSave() {
    // TODO: PUT /api/sistema/config
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <>
      <BackofficeTopbar
        title={t('sistema.title')}
        actions={
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <Save className="h-4 w-4" />
            {saved ? t('sistema.saved') : t('sistema.save')}
          </button>
        }
      />

      <main className="flex max-w-3xl flex-col gap-4 p-4 sm:gap-5 sm:p-6 lg:p-8">

        {/* General */}
        <div data-tour="backoffice-sistema-general" className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <SectionTitle icon={Globe} title={t('sistema.generalTitle')} />
          <FieldRow label={t('sistema.systemName')}>
            <input
              value={general.nombreSistema}
              onChange={(e) => setGeneral((p) => ({ ...p, nombreSistema: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 sm:w-48"
            />
          </FieldRow>
          <FieldRow label={t('sistema.timezone')}>
            <select
              value={general.timezone}
              onChange={(e) => setGeneral((p) => ({ ...p, timezone: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary sm:w-48"
            >
              <option value="America/Santo_Domingo">Santo Domingo (UTC-4)</option>
              <option value="America/New_York">New York (UTC-5)</option>
              <option value="UTC">UTC</option>
            </select>
          </FieldRow>
          <FieldRow label={t('sistema.maxEvidence')} description={t('sistema.maxEvidenceDesc')}>
            <select
              value={general.maxEvidenciaMB}
              onChange={(e) => setGeneral((p) => ({ ...p, maxEvidenciaMB: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary sm:w-32"
            >
              {['10', '25', '50', '100'].map((v) => (
                <option key={v} value={v}>{v} MB</option>
              ))}
            </select>
          </FieldRow>
        </div>

        {/* Notificaciones */}
        <div data-tour="backoffice-sistema-notificaciones" className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <SectionTitle icon={Bell} title={t('sistema.notifTitle')} />
          <Toggle
            checked={notif.emailNuevaDenuncia}
            onChange={(v) => setNotif((p) => ({ ...p, emailNuevaDenuncia: v }))}
            label={t('sistema.notifNewDenuncia')}
            description={t('sistema.notifNewDenunciaDesc')}
          />
          <Toggle
            checked={notif.emailCambioEstado}
            onChange={(v) => setNotif((p) => ({ ...p, emailCambioEstado: v }))}
            label={t('sistema.notifStatusChange')}
            description={t('sistema.notifStatusChangeDesc')}
          />
          <Toggle
            checked={notif.emailResumenSemanal}
            onChange={(v) => setNotif((p) => ({ ...p, emailResumenSemanal: v }))}
            label={t('sistema.notifWeekly')}
            description={t('sistema.notifWeeklyDesc')}
          />
          <Toggle
            checked={notif.smsAlertas}
            onChange={(v) => setNotif((p) => ({ ...p, smsAlertas: v }))}
            label={t('sistema.notifSms')}
            description={t('sistema.notifSmsDesc')}
          />
        </div>

        {/* Seguridad */}
        <div data-tour="backoffice-sistema-seguridad" className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <SectionTitle icon={Shield} title={t('sistema.securityTitle')} />
          <Toggle
            checked={seguridad.dobleAutenticacion}
            onChange={(v) => setSeguridad((p) => ({ ...p, dobleAutenticacion: v }))}
            label={t('sistema.security2fa')}
            description={t('sistema.security2faDesc')}
          />
          <Toggle
            checked={seguridad.ipWhitelist}
            onChange={(v) => setSeguridad((p) => ({ ...p, ipWhitelist: v }))}
            label={t('sistema.securityIp')}
            description={t('sistema.securityIpDesc')}
          />
          <FieldRow label={t('sistema.securitySession')}>
            <select
              value={seguridad.sesionInactividad}
              onChange={(e) => setSeguridad((p) => ({ ...p, sesionInactividad: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary sm:w-36"
            >
              {[['15', t('sistema.session15min')], ['30', t('sistema.session30min')], ['60', t('sistema.session1hour')], ['120', t('sistema.session2hours')]].map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </FieldRow>
        </div>

        {/* Datos */}
        <div data-tour="backoffice-sistema-datos" className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <SectionTitle icon={Database} title={t('sistema.dataTitle')} />
          <FieldRow label={t('sistema.dataExport')} description={t('sistema.dataExportDesc')}>
            <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              {t('sistema.dataExportBtn')}
            </button>
          </FieldRow>
          <FieldRow label={t('sistema.dataBackup')} description={t('sistema.dataBackupDesc')}>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
              {t('sistema.dataBackupStatus')}
            </span>
          </FieldRow>
        </div>
      </main>
    </>
  )
}
