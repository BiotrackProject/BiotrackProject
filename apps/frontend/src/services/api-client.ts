/**
 * Servicio HTTP reutilizable para conectar con la API
 * Ubicación: apps/frontend/src/services/api-client.ts
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
}

/**
 * Función genérica para hacer requests a la API
 */
async function request<T>(
  endpoint: string,
  options: RequestInit & { headers?: Record<string, string> } = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = localStorage.getItem('access_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Agregar token JWT si existe
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Si el status es 401, el token expiró
    if (response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || 'Error en la solicitud',
      };
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * MÉTODOS HTTP ESPECÍFICOS
 */

export const apiClient = {
  // GET
  get: <T,>(endpoint: string) =>
    request<T>(endpoint, { method: 'GET' }),

  // POST
  post: <T,>(endpoint: string, body: any) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // PATCH
  patch: <T,>(endpoint: string, body: any) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  // PUT
  put: <T,>(endpoint: string, body: any) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  // DELETE
  delete: <T,>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};

/**
 * FUNCIONES ESPECÍFICAS DE ENDPOINTS
 */

// ==================== AUTENTICACIÓN ====================

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    nombre: string;
  };
}

export async function login(credentials: LoginPayload) {
  const response = await apiClient.post<LoginResponse>(
    '/api/v1/auth/login',
    credentials
  );

  if (response.success && response.data) {
    // Guardar token y usuario
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }

  return response;
}

export async function logout() {
  await apiClient.post('/api/v1/auth/logout', {});
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
}

// ==================== DENUNCIAS ====================

export interface Denuncia {
  id: string;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  latitud: number;
  longitud: number;
  estado: 'pendiente' | 'en_investigacion' | 'resuelta';
  fotos?: string[];
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface CrearDenunciaPayload {
  titulo: string;
  descripcion: string;
  ubicacion: string;
  latitud: number;
  longitud: number;
}

// Crear denuncia
export async function crearDenuncia(data: CrearDenunciaPayload) {
  return apiClient.post<Denuncia>('/api/v1/denuncias', data);
}

// Obtener todas las denuncias
export async function obtenerDenuncias() {
  return apiClient.get<Denuncia[]>('/api/v1/denuncias');
}

// Obtener una denuncia específica
export async function obtenerDenuncia(id: string) {
  return apiClient.get<Denuncia>(`/api/v1/denuncias/${id}`);
}

// Actualizar denuncia
export async function actualizarDenuncia(
  id: string,
  data: Partial<CrearDenunciaPayload>
) {
  return apiClient.patch<Denuncia>(`/api/v1/denuncias/${id}`, data);
}

// Eliminar denuncia
export async function eliminarDenuncia(id: string) {
  return apiClient.delete(`/api/v1/denuncias/${id}`);
}

// ==================== USUARIO ====================

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: string;
}

// Obtener perfil del usuario actual
export async function obtenerPerfil() {
  return apiClient.get<Usuario>('/api/v1/auth/perfil');
}

// Actualizar perfil
export async function actualizarPerfil(data: Partial<Usuario>) {
  return apiClient.patch<Usuario>('/api/v1/auth/perfil', data);
}

// ==================== INDICADORES ====================

export interface Indicador {
  id: string;
  nombre: string;
  valor: number;
  unidad: string;
  fecha: string;
}

export async function obtenerIndicadores() {
  return apiClient.get<Indicador[]>('/api/v1/indicadores');
}

// ==================== ZONAS / TELEMETRÍA ====================

export interface Zona {
  id: string;
  nombre: string;
  latitud: number;
  longitud: number;
  radio: number;
  nivel_alerta: 'bajo' | 'medio' | 'alto';
}

export async function obtenerZonas() {
  return apiClient.get<Zona[]>('/api/v1/zonas');
}
