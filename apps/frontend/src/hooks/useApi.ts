/**
 * Custom Hooks para usar la API en componentes React
 * Ubicación: apps/frontend/src/hooks/useApi.ts
 */

import { useState, useCallback, useEffect } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  crearDenuncia as apiCrearDenuncia,
  obtenerDenuncias as apiObtenerDenuncias,
  obtenerDenuncia as apiObtenerDenuncia,
  actualizarDenuncia as apiActualizarDenuncia,
  obtenerPerfil as apiObtenerPerfil,
  LoginPayload,
  CrearDenunciaPayload,
  Denuncia,
  Usuario,
} from '@/services/api-client';

/**
 * Hook para manejar loading, data y errores
 */
interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// ==================== AUTH HOOK ====================

export function useAuth() {
  const [user, setUser] = useState<Usuario | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener perfil al montar
  useEffect(() => {
    if (!user && localStorage.getItem('access_token')) {
      obtenerPerfil();
    }
  }, []);

  const handleLogin = useCallback(async (credentials: LoginPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiLogin(credentials);

      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.error || 'Error en el login';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setLoading(true);
    try {
      await apiLogout();
      setUser(null);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cerrar sesión';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const obtenerPerfil = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiObtenerPerfil();
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (err) {
      console.error('Error al obtener perfil:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    login: handleLogin,
    logout: handleLogout,
    refetch: obtenerPerfil,
    isAuthenticated: !!user && !!localStorage.getItem('access_token'),
  };
}

// ==================== DENUNCIAS HOOK ====================

export function useDenuncias() {
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener todas las denuncias
  const obtenerDenuncias = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiObtenerDenuncias();

      if (response.success && response.data) {
        setDenuncias(response.data);
      } else {
        setError(response.error || 'Error al obtener denuncias');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear denuncia
  const crear = useCallback(async (data: CrearDenunciaPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCrearDenuncia(data);

      if (response.success && response.data) {
        // Agregar la nueva denuncia a la lista
        setDenuncias((prev) => [response.data as Denuncia, ...prev]);
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.error || 'Error al crear denuncia';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar denuncia
  const actualizar = useCallback(
    async (id: string, data: Partial<CrearDenunciaPayload>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiActualizarDenuncia(id, data);

        if (response.success && response.data) {
          // Actualizar en la lista
          setDenuncias((prev) =>
            prev.map((d) => (d.id === id ? response.data as Denuncia : d))
          );
          return { success: true, data: response.data };
        } else {
          const errorMsg = response.error || 'Error al actualizar denuncia';
          setError(errorMsg);
          return { success: false, error: errorMsg };
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Cargar denuncias al montar el componente
  useEffect(() => {
    obtenerDenuncias();
  }, [obtenerDenuncias]);

  return {
    denuncias,
    loading,
    error,
    obtenerDenuncias,
    crear,
    actualizar,
  };
}

// ==================== DENUNCIA INDIVIDUAL HOOK ====================

export function useDenuncia(id: string | null) {
  const [denuncia, setDenuncia] = useState<Denuncia | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtener = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiObtenerDenuncia(id);

      if (response.success && response.data) {
        setDenuncia(response.data);
      } else {
        setError(response.error || 'Error al obtener denuncia');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    obtener();
  }, [id, obtener]);

  return { denuncia, loading, error, refetch: obtener };
}

// ==================== FORM HELPER HOOK ====================

/**
 * Hook para facilitar el manejo de formularios
 */
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<any>
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const fieldValue = type === 'number' ? parseFloat(value) : value;

      setValues((prev) => ({
        ...prev,
        [name]: fieldValue,
      }));

      // Limpiar error de este campo
      if (errors[name as keyof T]) {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    },
    [errors]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      try {
        await onSubmit(values);
        setSubmitSuccess(true);
        setValues(initialValues); // Resetear formulario
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al enviar';
        setSubmitError(message);
      } finally {
        setLoading(false);
      }
    },
    [values, onSubmit, initialValues]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setSubmitError(null);
    setSubmitSuccess(false);
  }, [initialValues]);

  return {
    values,
    errors,
    loading,
    submitError,
    submitSuccess,
    handleChange,
    handleSubmit,
    reset,
    setFieldValue: (name: keyof T, value: any) =>
      setValues((prev) => ({ ...prev, [name]: value })),
  };
}
