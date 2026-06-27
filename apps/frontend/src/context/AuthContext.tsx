import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { getPerfil } from '../services/authService'
import { logout as apiLogout } from '../services/authService'

export interface AuthUser {
  id: string
  nombre_completo: string
  rol: string
  debe_cambiar_contrasena?: boolean
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (user: AuthUser) => void
  updateUser: (partial: Partial<AuthUser>) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Al montar: verifica si existe una sesión activa consultando el perfil.
  // El browser envía la cookie bt_session automáticamente si existe.
  useEffect(() => {
    getPerfil()
      .then((res) => {
        if (res.success && res.data) {
          setUser({
            id: res.data.IDUsuario,
            nombre_completo: res.data.nombre_completo,
            rol: res.data.rol.nombre,
            debe_cambiar_contrasena: res.data.debe_cambiar_contrasena ?? false,
          })
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const setAuth = useCallback((newUser: AuthUser) => {
    setUser(newUser)
  }, [])

  const updateUser = useCallback((partial: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev))
  }, [])

  const logout = useCallback(async () => {
    await apiLogout().catch(() => {}) // borra la cookie server-side
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: !!user, isLoading, setAuth, updateUser, logout }),
    [user, isLoading, setAuth, updateUser, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
