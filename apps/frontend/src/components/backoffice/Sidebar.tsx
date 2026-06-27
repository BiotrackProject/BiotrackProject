import React, { useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  FileWarning,
  MapPin,
  Map,
  ClipboardCheck,
  Settings,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react'
import imagotipoBlanco from '../../assets/images/imagotipo negativo.svg'
import isotipoNegativo from '../../assets/images/isotiponegativo.png'

function Tooltip({ children }) {
  return (
    <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-[100] rounded-md bg-gray-900/90 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg whitespace-nowrap transition-opacity duration-150 group-hover:opacity-100">
      {children}
    </span>
  )
}

export default function Sidebar({ mobileOpen = false, setMobileOpen = () => {} }: { mobileOpen?: boolean; setMobileOpen?: React.Dispatch<React.SetStateAction<boolean>> }) {
  const { t } = useTranslation()
  const [open, setOpen]             = useState(true)
  const [configOpen, setConfigOpen] = useState(false)
  const { user } = useAuth()

  const NAV = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: t('sidebar.dashboard') },
    { to: '/admin/denuncias', icon: FileWarning,     label: t('sidebar.denuncias') },
    { to: '/admin/monitoreo', icon: MapPin,          label: t('sidebar.monitoreo') },
    { to: '/admin/acciones',  icon: ClipboardCheck,  label: t('sidebar.acciones') },
    { to: '/admin/mapa',      icon: Map,             label: t('sidebar.mapa') },
  ]

  const CONFIG_LINKS = [
    { to: '/admin/configuracion/usuarios', label: t('sidebar.configUsuarios') },
    { to: '/admin/configuracion/sistema',  label: t('sidebar.configSistema') },
  ]

  const initials = user
    ? user.nombre_completo.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
    : '?'

  useEffect(() => {
    if (!mobileOpen) return
    function onKeyDown(e) {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen, setMobileOpen])

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label={t('sidebar.closeMenu')}
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-primary/40 backdrop-blur-[1px] lg:hidden"
        />
      )}
      <aside
        aria-label={t('sidebar.navLabel')}
        data-tour="backoffice-sidebar"
        className={`fixed inset-y-0 left-0 z-40 flex min-h-screen w-[252px] shrink-0 flex-col bg-primary transition-[transform,width] duration-[280ms] ease-out lg:static lg:z-auto lg:translate-x-0 lg:transition-[width] ${
          open ? 'lg:w-[252px]' : 'lg:w-[76px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} `}
      >
      {/* Header */}
      <div
        className={`flex items-center py-5 mb-2 ${
          open ? 'justify-center px-5 gap-3' : 'flex-col gap-3 px-3'
        }`}
      >
        <Link
          to="/"
          title={t('sidebar.backToPortal')}
          className="shrink-0 opacity-90 hover:opacity-100 transition-opacity"
        >
          {open ? (
            <img src={imagotipoBlanco} alt="BioTrack — ir al portal" className="h-8 w-auto" />
          ) : (
            <img src={isotipoNegativo} alt="BioTrack" className="h-9 w-9 object-contain" />
          )}
        </Link>

        <div className="group relative shrink-0">
          <button
            onClick={() => setOpen(v => !v)}
            aria-label={open ? t('sidebar.collapse') : t('sidebar.expand')}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition-[transform,background-color,color] duration-150 ease-out hover:bg-white/15 hover:text-white active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          {!open && <Tooltip>{t('sidebar.expand')}</Tooltip>}
        </div>
      </div>

      <div className="mx-3 h-px bg-white/10 mb-3" />

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-2 flex-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <div key={to} className="group relative">
            <NavLink
              to={to}
              end
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => {
                const base = `flex items-center gap-3 rounded-xl text-sm font-medium transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.99]`
                const layout = open ? 'px-3 py-2.5' : 'justify-center py-3'

                // Expandido: fondo en la fila. Colapsado: sin fondo en la fila (lo maneja el ícono)
                const state = open
                  ? isActive
                    ? 'bg-white/20 text-white'
                    : 'text-white/60 hover:bg-white/15 hover:text-white'
                  : isActive
                    ? 'text-white'
                    : 'text-white/60 hover:text-white'

                return `${base} ${layout} ${state} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50`
              }}
            >
              {({ isActive }) => (
                <>
                  {/* Ícono: solo tiene fondo cuando está colapsado */}
                  <span
                    className={[
                      'flex shrink-0 items-center justify-center rounded-lg transition-colors',
                      open ? 'h-8 w-8' : 'h-9 w-9',
                      !open && isActive  ? 'bg-white/20'       : '',
                      !open && !isActive ? 'hover:bg-white/15' : '',
                    ].join(' ')}
                  >
                    <Icon className="h-4 w-4" />
                  </span>

                  <span
                    className={`overflow-hidden whitespace-nowrap flex-1 transition-[max-width,opacity] duration-200 ease-out ${
                      open ? 'max-w-[170px] opacity-100' : 'max-w-0 opacity-0'
                    }`}
                  >
                    {label}
                  </span>

                  {open && isActive && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" />
                  )}
                </>
              )}
            </NavLink>
            {!open && <Tooltip>{label}</Tooltip>}
          </div>
        ))}

        {/* Configuración accordion */}
        <div>
          <div className="group relative">
            <button
              onClick={() => open && setConfigOpen(v => !v)}
              aria-expanded={open ? configOpen : false}
              aria-controls="sidebar-config-links"
              className={[
                'flex w-full items-center gap-3 rounded-xl text-sm font-medium transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
                open
                  ? 'px-3 py-2.5 text-white/60 hover:bg-white/15 hover:text-white'
                  : 'justify-center py-3 text-white/60 hover:text-white',
              ].join(' ')}
            >
              <span
                className={[
                  'flex shrink-0 items-center justify-center rounded-lg transition-colors',
                  open ? 'h-8 w-8' : 'h-9 w-9',
                  !open ? 'hover:bg-white/15' : '',
                ].join(' ')}
              >
                <Settings className="h-4 w-4" />
              </span>

              <span
                className={`overflow-hidden whitespace-nowrap flex-1 text-left transition-[max-width,opacity] duration-200 ease-out ${
                  open ? 'max-w-[160px] opacity-100' : 'max-w-0 opacity-0'
                }`}
              >
                {t('sidebar.config')}
              </span>

              {open && (
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                    configOpen ? 'rotate-180' : ''
                  }`}
                />
              )}
            </button>
            {!open && <Tooltip>{t('sidebar.config')}</Tooltip>}
          </div>

          {open && (
            <div
              id="sidebar-config-links"
              className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-out ${
                configOpen ? 'max-h-24' : 'max-h-0'
              }`}
            >
              <div className="ml-14 flex flex-col gap-0.5 py-1">
                {CONFIG_LINKS.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-lg text-xs font-medium transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 ${
                        isActive
                          ? 'bg-white/15 text-white'
                          : 'text-white/40 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Footer: user info */}
      <div className="mx-3 h-px bg-white/10 mt-3" />
      <div className={`py-4 ${open ? 'px-5' : 'px-2'}`}>
        <div
          className={`group relative flex items-center rounded-xl ${
            open ? 'gap-3 px-3 py-2' : 'justify-center py-2'
          }`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
            <span className="text-xs font-bold text-white">{initials}</span>
          </div>
          <div
            className={`overflow-hidden whitespace-nowrap min-w-0 transition-[max-width,opacity] duration-200 ease-out ${
              open ? 'max-w-[140px] opacity-100' : 'max-w-0 opacity-0'
            }`}
          >
            <p className="truncate text-xs font-semibold text-white">{user?.nombre_completo ?? '—'}</p>
            <p className="truncate text-[10px] text-white/40">{user?.rol ?? '—'}</p>
          </div>
          {!open && <Tooltip>{user?.nombre_completo ?? '—'}</Tooltip>}
        </div>
      </div>
      </aside>
    </>
  )
}
