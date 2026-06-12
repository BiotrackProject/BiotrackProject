/**
 * Ejemplo App.jsx - Estructura principal de tu aplicación
 * Ubicación: apps/frontend/src/App.jsx
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Auth0Provider, ProtectedRoute } from '@/providers/Auth0Provider';
import { LoginForm } from '@/components/LoginForm';
import { DenunciaForm } from '@/components/DenunciaForm';
import { DenunciasList } from '@/components/DenunciasList';
import { useAuth0 } from '@/providers/Auth0Provider';

// Dashboard principal
function Dashboard() {
  const { user, logout } = useAuth0();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">BioTrack</h1>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <span className="text-gray-700">Bienvenido, {user.nombre}</span>
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/login';
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          {/* Login - Público */}
          <Route
            path="/login"
            element={<LoginForm onSuccess={() => window.location.href = '/dashboard'} />}
          />

          {/* Dashboard - Protegido */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Crear denuncia - Protegido */}
          <Route
            path="/denuncias/crear"
            element={
              <ProtectedRoute>
                <div className="space-y-6">
                  <DenunciaForm onSuccess={() => alert('Denuncia creada exitosamente')} />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Ver denuncias - Protegido */}
          <Route
            path="/denuncias"
            element={
              <ProtectedRoute>
                <DenunciasList />
              </ProtectedRoute>
            }
          />

          {/* Redireccionar a dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}

// App con Provider
export default function App() {
  return (
    <Router>
      <Auth0Provider>
        <Routes>
          <Route path="/login" element={<LoginForm onSuccess={() => window.location.href = '/dashboard'} />} />
          <Route path="/*" element={<Dashboard />} />
        </Routes>
      </Auth0Provider>
    </Router>
  );
}
