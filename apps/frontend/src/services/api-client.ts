/**
 * Servicio HTTP reutilizable para conectar con la API.
 * Autenticación via cookie HttpOnly (bt_session) — sin token en localStorage.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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

async function request<T>(
  endpoint: string,
  options: RequestInit & { headers?: Record<string, string> } = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string> | undefined),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // envía la cookie bt_session automáticamente
    });

    const data = await response.json();

    // 401 fuera de endpoints de auth = cookie expirada → redirigir al login.
    // Endpoints de auth devuelven 401 como parte de flujos normales (creds incorrectas,
    // código OTP incorrecto, etc.) — no hay que redirigir en esos casos.
    if (response.status === 401 && !endpoint.includes('/api/v1/auth/')) {
      window.location.href = '/login';
      return { success: false, error: 'Sesión expirada.' };
    }

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || 'Error en la solicitud',
      };
    }

    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return { success: false, error: message };
  }
}

export const apiClient = {
  get: <T,>(endpoint: string) =>
    request<T>(endpoint, { method: 'GET' }),

  post: <T,>(endpoint: string, body: any) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),

  postForm: <T,>(endpoint: string, formData: FormData) =>
    request<T>(endpoint, { method: 'POST', body: formData }),

  patch: <T,>(endpoint: string, body: any) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),

  put: <T,>(endpoint: string, body: any) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),

  delete: <T,>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};

// ── Tipos legacy expuestos para compatibilidad con hooks/componentes viejos ───

export interface LoginPayload {
  correo_electronico: string;
  contrasena: string;
}

export interface LoginResponse {
  access_token: string;
  user: { id: string; email: string; nombre: string };
}

export async function login(credentials: LoginPayload) {
  return apiClient.post<LoginResponse>('/api/v1/auth/login', credentials);
}

export async function logout() {
  return apiClient.post('/api/v1/auth/logout', {});
}

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

export async function crearDenuncia(data: CrearDenunciaPayload) {
  return apiClient.post<Denuncia>('/api/v1/denuncias', data);
}

export async function obtenerDenuncias() {
  return apiClient.get<Denuncia[]>('/api/v1/denuncias');
}

export async function obtenerDenuncia(id: string) {
  return apiClient.get<Denuncia>(`/api/v1/denuncias/${id}`);
}

export async function actualizarDenuncia(id: string, data: Partial<CrearDenunciaPayload>) {
  return apiClient.patch<Denuncia>(`/api/v1/denuncias/${id}`, data);
}

export async function eliminarDenuncia(id: string) {
  return apiClient.delete(`/api/v1/denuncias/${id}`);
}

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: string;
}

export async function obtenerPerfil() {
  return apiClient.get<Usuario>('/api/v1/auth/perfil');
}

export async function actualizarPerfil(data: Partial<Usuario>) {
  return apiClient.patch<Usuario>('/api/v1/auth/perfil', data);
}

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
