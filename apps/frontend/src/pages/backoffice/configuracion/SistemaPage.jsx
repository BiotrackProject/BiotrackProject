import { useState } from 'react'
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
        title="Configuración del Sistema"
        actions={
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <Save className="h-4 w-4" />
            {saved ? '¡Guardado!' : 'Guardar cambios'}
          </button>
        }
      />

      <main className="flex max-w-3xl flex-col gap-4 p-4 sm:gap-5 sm:p-6 lg:p-8">

        {/* General */}
        <div data-tour="backoffice-sistema-general" className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <SectionTitle icon={Globe} title="General" />
          <FieldRow label="Nombre del sistema">
            <input
              value={general.nombreSistema}
              onChange={(e) => setGeneral((p) => ({ ...p, nombreSistema: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 sm:w-48"
            />
          </FieldRow>
          <FieldRow label="Zona horaria">
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
          <FieldRow label="Tamaño máximo de evidencia" description="Por archivo adjunto en denuncias">
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
          <SectionTitle icon={Bell} title="Notificaciones" />
          <Toggle
            checked={notif.emailNuevaDenuncia}
            onChange={(v) => setNotif((p) => ({ ...p, emailNuevaDenuncia: v }))}
            label="Email al recibir nueva denuncia"
            description="Notifica a los analistas cuando llega una nueva denuncia"
          />
          <Toggle
            checked={notif.emailCambioEstado}
            onChange={(v) => setNotif((p) => ({ ...p, emailCambioEstado: v }))}
            label="Email al cambiar estado"
            description="Notifica al denunciante cuando su caso cambia de estado"
          />
          <Toggle
            checked={notif.emailResumenSemanal}
            onChange={(v) => setNotif((p) => ({ ...p, emailResumenSemanal: v }))}
            label="Resumen semanal por correo"
            description="Informe ejecutivo enviado los lunes a administradores"
          />
          <Toggle
            checked={notif.smsAlertas}
            onChange={(v) => setNotif((p) => ({ ...p, smsAlertas: v }))}
            label="Alertas críticas por SMS"
            description="Solo para casos marcados como Crítico"
          />
        </div>

        {/* Seguridad */}
        <div data-tour="backoffice-sistema-seguridad" className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <SectionTitle icon={Shield} title="Seguridad" />
          <Toggle
            checked={seguridad.dobleAutenticacion}
            onChange={(v) => setSeguridad((p) => ({ ...p, dobleAutenticacion: v }))}
            label="Doble autenticación (2FA)"
            description="Requerida para todos los administradores"
          />
          <Toggle
            checked={seguridad.ipWhitelist}
            onChange={(v) => setSeguridad((p) => ({ ...p, ipWhitelist: v }))}
            label="Lista blanca de IPs"
            description="Restringe el acceso solo a IPs autorizadas"
          />
          <FieldRow label="Expiración de sesión inactiva">
            <select
              value={seguridad.sesionInactividad}
              onChange={(e) => setSeguridad((p) => ({ ...p, sesionInactividad: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary sm:w-36"
            >
              {[['15', '15 minutos'], ['30', '30 minutos'], ['60', '1 hora'], ['120', '2 horas']].map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </FieldRow>
        </div>

        {/* Datos */}
        <div data-tour="backoffice-sistema-datos" className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <SectionTitle icon={Database} title="Datos y Respaldo" />
          <FieldRow label="Exportar todos los registros" description="Genera un CSV con todas las denuncias, monitoreos y acciones">
            <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Exportar
            </button>
          </FieldRow>
          <FieldRow label="Respaldo automático" description="Se ejecuta cada noche a las 2:00 AM">
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
              Activo
            </span>
          </FieldRow>
        </div>
      </main>
    </>
  )
}
