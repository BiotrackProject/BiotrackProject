import { useAuth } from '@/hooks/useApi'
import { createContext, useContext, ReactNode } from 'react'

type AuthContext = ReturnType<typeof useAuth>

const Auth0Context = createContext<AuthContext | null>(null)

export function Auth0Provider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  return <Auth0Context.Provider value={auth}>{children}</Auth0Context.Provider>
}

export function useAuth0(): AuthContext {
  const ctx = useContext(Auth0Context)
  if (!ctx) throw new Error('useAuth0 must be used inside Auth0Provider')
  return ctx
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth0()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">Debes iniciar sesión para acceder a esta página</p>
          <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Ir al Login
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
