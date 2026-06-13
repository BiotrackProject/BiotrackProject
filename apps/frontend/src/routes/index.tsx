import { Suspense, lazy, ComponentType, ReactElement } from 'react'
import { createBrowserRouter } from 'react-router-dom'

const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'))
const VerifyCodePage = lazy(() => import('../pages/auth/VerifyCodePage'))
const LandingPage = lazy(() => import('../pages/LandingPage'))
const ReportPage = lazy(() => import('../pages/ReportPage'))
const SearchReportsPage = lazy(() => import('../pages/SearchReportsPage'))
const ReportDetailPage = lazy(() => import('../pages/ReportDetailPage'))
const BackofficeLayout = lazy(() => import('../components/backoffice/BackofficeLayout'))
const DashboardPage = lazy(() => import('../pages/backoffice/DashboardPage'))
const DenunciasPage = lazy(() => import('../pages/backoffice/DenunciasPage'))
const RealizarDenunciaPage = lazy(() => import('../pages/backoffice/RealizarDenunciaPage'))
const DetalleDenunciaPage = lazy(() => import('../pages/backoffice/DetalleDenunciaPage'))
const MonitoreoPage = lazy(() => import('../pages/backoffice/MonitoreoPage'))
const DetalleMonitoreoPage = lazy(() => import('../pages/backoffice/DetalleMonitoreoPage'))
const PlanificarMonitoreoPage = lazy(() => import('../pages/backoffice/PlanificarMonitoreoPage'))
const AccionesCorrectivasPage = lazy(() => import('../pages/backoffice/AccionesCorrectivasPage'))
const DetalleAccionPage = lazy(() => import('../pages/backoffice/DetalleAccionPage'))
const UsuariosPage = lazy(() => import('../pages/backoffice/configuracion/UsuariosPage'))
const SistemaPage = lazy(() => import('../pages/backoffice/configuracion/SistemaPage'))
const PerfilPage = lazy(() => import('../pages/backoffice/PerfilPage'))
const NotificacionesPage = lazy(() => import('../pages/backoffice/NotificacionesPage'))
const MapaDenunciasPage = lazy(() => import('../pages/backoffice/MapaDenunciasPage'))

function withSuspense(Component: ComponentType): ReactElement {
  return (
    <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">Cargando...</div>}>
      <Component />
    </Suspense>
  )
}

const router = createBrowserRouter([
  { path: '/',                           element: withSuspense(LandingPage) },
  { path: '/login',                      element: withSuspense(LoginPage) },
  { path: '/registro',                   element: withSuspense(RegisterPage) },
  { path: '/recuperar-cuenta',           element: withSuspense(ForgotPasswordPage) },
  { path: '/recuperar-cuenta/verificar', element: withSuspense(VerifyCodePage) },
  { path: '/reporte/nuevo',              element: withSuspense(ReportPage) },
  { path: '/reportes',                   element: withSuspense(SearchReportsPage) },
  { path: '/reportes/:id',               element: withSuspense(ReportDetailPage) },
  {
    path: '/admin',
    element: withSuspense(BackofficeLayout),
    children: [
      { path: 'dashboard',                    element: withSuspense(DashboardPage) },
      { path: 'denuncias',                    element: withSuspense(DenunciasPage) },
      { path: 'denuncias/nueva',              element: withSuspense(RealizarDenunciaPage) },
      { path: 'denuncias/:id',                element: withSuspense(DetalleDenunciaPage) },
      { path: 'monitoreo',                    element: withSuspense(MonitoreoPage) },
      { path: 'monitoreo/:id',                element: withSuspense(DetalleMonitoreoPage) },
      { path: 'monitoreo/:id/planificar',     element: withSuspense(PlanificarMonitoreoPage) },
      { path: 'acciones',                     element: withSuspense(AccionesCorrectivasPage) },
      { path: 'acciones/:id',                 element: withSuspense(DetalleAccionPage) },
      { path: 'configuracion/usuarios',       element: withSuspense(UsuariosPage) },
      { path: 'configuracion/sistema',        element: withSuspense(SistemaPage) },
      { path: 'perfil',                       element: withSuspense(PerfilPage) },
      { path: 'notificaciones',               element: withSuspense(NotificacionesPage) },
      { path: 'mapa',                         element: withSuspense(MapaDenunciasPage) },
    ],
  },
])

export default router
