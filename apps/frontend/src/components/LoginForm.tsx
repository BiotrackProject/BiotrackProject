/**
 * Componente Login
 * Ubicación: apps/frontend/src/components/LoginForm.jsx
 * 
 * Uso: <LoginForm onSuccess={() => navigate('/dashboard')} />
 */

import { useState } from 'react';
import { useAuth } from '@/hooks/useApi';

export function LoginForm({ onSuccess }) {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    // Validación básica
    if (!email || !password) {
      setLocalError('Por favor completa todos los campos');
      return;
    }

    const result = await login({ correo_electronico: email, contrasena: password });

    if (result.success) {
      setEmail('');
      setPassword('');
      onSuccess?.(); // Navegar al dashboard
    } else {
      setLocalError(result.error || 'Error en el login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">
          BioTrack Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {(error || localError) && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error || localError}
            </div>
          )}

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              disabled={loading}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          ¿No tienes cuenta? <a href="/register" className="text-blue-600 hover:underline">Regístrate aquí</a>
        </p>
      </div>
    </div>
  );
}
