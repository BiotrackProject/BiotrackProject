import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, FileWarning, MapPin, CheckCircle, Settings, CheckCheck } from 'lucide-react'
import BackofficeTopbar from '../../components/backoffice/BackofficeTopbar'

const MOCK_NOTIFICACIONES = [
  {
    id: 'n001',
    tipo: 'nueva_denuncia',
    leida: false,
    mensaje: 'Nueva denuncia recibida: #005 — Extracción en Las Terrenas, Samaná',
    fecha: 'Hace 2 horas',
    link: '/admin/denuncias/005',
  },
  {
    id: 'n002',
    tipo: 'cambio_estado',
    leida: false,
    mensaje: 'Denuncia #001 cambió a estado "Corregido"',
    fecha: 'Hace 4 horas',
    link: '/admin/denuncias/001',
  },
  {
    id: 'n003',
    tipo: 'monitoreo',
    leida: false,
    mensaje: 'Zona de Monitoreo #002 marcada como En Corrección — requiere acción',
    fecha: 'Ayer, 3:15 PM',
    link: '/admin/monitoreo/002',
  },
  {
    id: 'n004',
    tipo: 'accion',
    leida: true,
    mensaje: 'Acción correctiva #003 completada por Dr. Luis Sánchez',
    fecha: 'Ayer, 10:00 AM',
    link: '/admin/acciones/003',
  },
  {
    id: 'n005',
    tipo: 'sistema',
    leida: true,
    mensaje: 'Respaldo automático completado exitosamente — 06/06/2026 2:00 AM',
    fecha: '6 jun 2026',
    link: null,
  },
  {
    id: 'n006',
    tipo: 'nueva_denuncia',
    leida: true,
    mensaje: 'Nueva denuncia recibida: #004 — Minería ilegal en Pueblo Viejo, Sánchez Ramírez',
    fecha: '3 jun 2026',
    link: '/admin/denuncias/004',
  },
]

const TIPO_CONFIG = {
  nueva_denuncia: { icon: FileWarning, color: 'bg-primary/10 text-primary' },
  cambio_estado:  { icon: CheckCircle,  color: 'bg-emerald-50 text-emerald-600' },
  monitoreo:      { icon: MapPin,       color: 'bg-teal-50 text-teal-600' },
  accion:         { icon: CheckCircle,  color: 'bg-cyan-50 text-cyan-600' },
  sistema:        { icon: Settings,     color: 'bg-gray-100 text-gray-500' },
}

export default function NotificacionesPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState(MOCK_NOTIFICACIONES)

  const unread = items.filter((n) => !n.leida).length

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, leida: true })))
  }

  function markRead(id) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)))
  }

  function handleClick(item) {
    markRead(item.id)
    if (item.link) navigate(item.link)
  }

  return (
    <>
      <BackofficeTopbar
        title="Notificaciones"
        backTo="/admin/dashboard"
        actions={
          unread > 0 && (
            <button
              data-tour="backoffice-notificaciones-actions"
              onClick={markAllRead}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todas como leídas
            </button>
          )
        }
      />

      <main className="p-8 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div data-tour="backoffice-notificaciones-header" className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">Centro de notificaciones</span>
            </div>
            {unread > 0 && (
              <span className="rounded-full bg-action px-2.5 py-0.5 text-xs font-bold text-white">
                {unread} nueva{unread > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* List */}
          <ul data-tour="backoffice-notificaciones-list" className="divide-y divide-gray-50">
            {items.length === 0 ? (
              <li className="flex flex-col items-center py-16 text-gray-400">
                <Bell className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm">Sin notificaciones</p>
              </li>
            ) : (
              items.map((item) => {
                const cfg = TIPO_CONFIG[item.tipo] ?? TIPO_CONFIG.sistema
                const Icon = cfg.icon
                return (
                  <li
                    key={item.id}
                    onClick={() => handleClick(item)}
                    className={`flex items-start gap-4 px-6 py-4 transition-colors cursor-pointer ${
                      item.leida ? 'hover:bg-gray-50' : 'bg-blue-50/40 hover:bg-blue-50/70'
                    } ${item.link ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cfg.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${item.leida ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                        {item.mensaje}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{item.fecha}</p>
                    </div>
                    {!item.leida && (
                      <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-action" />
                    )}
                  </li>
                )
              })
            )}
          </ul>
        </div>
      </main>
    </>
  )
}
