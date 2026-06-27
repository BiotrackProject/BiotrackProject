import { apiClient } from './api-client'
import type { AuthUser } from '../context/AuthContext'

export interface PerfilCompleto {
  IDUsuario: string
  nombre_completo: string
  correo_electronico: string
  telefono: string | null
  cargo: string | null
  institucion: string | null
  Estado: string
  Fecha_creacion: string
  debe_cambiar_contrasena: boolean
  rol: { id: string; nombre: string }
}

export async function login(correo_electronico: string, contrasena: string) {
  return apiClient.post<{ usuario: AuthUser }>(
    '/api/v1/auth/login',
    { correo_electronico, contrasena }
  )
}

export async function logout() {
  return apiClient.post<{ mensaje: string }>('/api/v1/auth/logout', {})
}

export async function registro(data: {
  nombre_completo: string
  correo_electronico: string
  cargo?: string
  institucion?: string
}) {
  return apiClient.post<{ mensaje: string }>('/api/v1/auth/registro', data)
}

export async function forgotPassword(correo_electronico: string) {
  return apiClient.post<{ mensaje: string }>('/api/v1/auth/forgot-password', {
    correo_electronico,
  })
}

export async function verifyCode(correo_electronico: string, codigo: string) {
  return apiClient.post<{ token: string }>('/api/v1/auth/verify-code', {
    correo_electronico,
    codigo,
  })
}

export async function resetPassword(token: string, contrasena: string) {
  return apiClient.post<{ mensaje: string }>('/api/v1/auth/reset-password', {
    token,
    contrasena,
  })
}

export async function cambiarContrasena(contrasena_actual: string, contrasena_nueva: string) {
  return apiClient.post<{ mensaje: string }>('/api/v1/auth/cambiar-contrasena', {
    contrasena_actual,
    contrasena_nueva,
  })
}

export async function getPerfil() {
  return apiClient.get<PerfilCompleto>('/api/v1/auth/perfil')
}

export async function actualizarPerfil(data: {
  nombre_completo?: string
  telefono?: string | null
}) {
  return apiClient.patch<{ mensaje: string; usuario: PerfilCompleto }>('/api/v1/auth/perfil', data)
}
