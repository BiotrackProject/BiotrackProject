import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import ToastContainer from '../ui/ToastContainer'
import HelpTourButton from '../tour/HelpTourButton'
import { useGuidedTour } from '../../hooks/useGuidedTour'
import { getBackofficeTourSteps } from '../../data/tourSteps'

function getTourSection(pathname) {
  if (pathname.endsWith('/dashboard')) return 'dashboard'
  if (pathname.endsWith('/denuncias/nueva')) return 'denuncias-nueva'
  if (/\/denuncias\/[^/]+$/.test(pathname)) return 'denuncias-detalle'
  if (pathname.endsWith('/denuncias')) return 'denuncias'
  if (/\/monitoreo\/[^/]+\/planificar$/.test(pathname)) return 'monitoreo-planificar'
  if (/\/monitoreo\/[^/]+$/.test(pathname)) return 'monitoreo-detalle'
  if (pathname.endsWith('/monitoreo')) return 'monitoreo'
  if (/\/acciones\/[^/]+$/.test(pathname)) return 'acciones-detalle'
  if (pathname.endsWith('/acciones')) return 'acciones'
  if (pathname.endsWith('/configuracion/usuarios')) return 'usuarios'
  if (pathname.endsWith('/configuracion/solicitudes')) return 'solicitudes'
  if (pathname.endsWith('/configuracion/sistema')) return 'sistema'
  if (pathname.endsWith('/perfil')) return 'perfil'
  if (pathname.endsWith('/notificaciones')) return 'notificaciones'
  if (pathname.endsWith('/mapa')) return 'mapa'
  return null
}

export default function BackofficeLayout() {
  const { t } = useTranslation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()
  const section = getTourSection(location.pathname)
  const tourKey = section ? `backoffice-${section}` : 'backoffice'
  const { startTour, startAutoTour } = useGuidedTour(tourKey)
  const steps = section ? getBackofficeTourSteps(t, section) : null

  useEffect(() => {
    if (!steps || section === 'mapa') return
    const cleanup = startAutoTour(steps, 800)
    return cleanup
  }, [section, steps, startAutoTour])

  return (
    <div className="flex h-screen overflow-hidden bg-[linear-gradient(180deg,#eef2f7_0%,#f4f6f9_100%)]">
      <button
        onClick={() => setMobileNavOpen(true)}
        aria-label={t('sidebar.expand')}
        className="fixed left-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-white text-primary shadow-sm transition-colors hover:bg-primary/5 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Sidebar mobileOpen={mobileNavOpen} setMobileOpen={setMobileNavOpen} />
      <div className="flex-1 overflow-y-auto min-w-0 flex flex-col">
        <Outlet />
      </div>
      <ToastContainer />

      {/* Floating help button — visible across all backoffice pages */}
      <HelpTourButton
        dataTour="backoffice-help-btn"
        onStart={() => steps && startTour(steps)}
        label={t('tour.helpBtn')}
      />
    </div>
  )
}
