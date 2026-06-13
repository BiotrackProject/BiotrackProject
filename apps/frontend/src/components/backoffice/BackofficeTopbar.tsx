import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, User, ChevronLeft, LogOut, UserCircle } from 'lucide-react'

import { ReactNode } from 'react'

interface BackofficeTopbarProps {
  title: string
  backTo?: string
  actions?: ReactNode
}

export default function BackofficeTopbar({ title, backTo, actions }: BackofficeTopbarProps) {
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-[#e7ebf1] bg-white/95 px-4 py-3 shadow-[0_4px_20px_rgba(15,23,42,0.04)] backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        {backTo && (
          <button
            onClick={() => navigate(backTo)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-[transform,background-color,color] duration-150 ease-out hover:bg-primary/20 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        <span className={`truncate font-extrabold text-primary ${backTo ? 'text-[clamp(1rem,2.3vw,1.15rem)]' : 'text-[clamp(.95rem,2.1vw,1.05rem)]'}`}>
          {title}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {actions}

        {/* Notifications */}
        <button
          onClick={() => navigate('/admin/notificaciones')}
          aria-label="Abrir notificaciones"
          data-tour="backoffice-notifications"
          className="relative rounded-full p-2 transition-[transform,background-color,color] duration-150 ease-out hover:bg-gray-100 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          title="Notificaciones"
        >
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-action" />
        </button>

        {/* User avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            aria-label="Abrir menú de usuario"
            aria-haspopup="menu"
            aria-expanded={userMenuOpen}
            data-tour="backoffice-profile-btn"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary transition-[transform,background-color,box-shadow] duration-150 ease-out hover:bg-primary/80 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <User className="h-4 w-4 text-white" />
          </button>

          {userMenuOpen && (
            <div role="menu" className="absolute right-0 top-11 z-30 w-44 origin-top-right animate-[modalIn_180ms_cubic-bezier(0.23,1,0.32,1)] overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
              <button
                onClick={() => { setUserMenuOpen(false); navigate('/admin/perfil') }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 transition-[transform,background-color,color] duration-150 ease-out hover:bg-gray-50 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
              >
                <UserCircle className="h-4 w-4 text-gray-400" />
                Mi perfil
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => { setUserMenuOpen(false); navigate('/login') }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-action transition-[transform,background-color,color] duration-150 ease-out hover:bg-red-50 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/35"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
