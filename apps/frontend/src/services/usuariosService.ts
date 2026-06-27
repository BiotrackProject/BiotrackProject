import { apiClient } from './api-client'
import * as authService from './authService'

export interface Usuario {
  IDUsuario: string
  nombre_completo: string
  correo_electronico: string
  telefono: string | null
  cargo: string | null
  institucion: string | null
  Estado: 'Activo' | 'Inactivo'
  Ultimo_acceso: string | null
  Fecha_creacion: string
  rol: { id: string; nombre: string }
}

export interface Rol {
  id: string
  nombre: string
  descripcion: string | null
}

export interface SolicitudRegistro {
  id: string
  nombre_completo: string
  correo_electronico: string
  cargo: string | null
  institucion: string | null
  estado: 'Pendiente_Aprobacion' | 'Aprobada' | 'Rechazada' | 'Pendiente_Info'
  comentario_admin?: string | null
  created_at: string
  updated_at?: string
}

export interface NuevoUsuarioForm {
  nombre_completo: string
  correo_electronico: string
  contrasena: string
  rol_id: string
  cargo?: string
  institucion?: string
  telefono?: string
}

export const usuariosService = {
  async getAll(): Promise<Usuario[]> {
    const res = await apiClient.get<Usuario[]>('/api/v1/admin/usuarios')
    if (!res.success || !res.data) throw new Error(res.error ?? 'Error al obtener usuarios')
    return res.data
  },

  async getById(id: string): Promise<Usuario> {
    const res = await apiClient.get<Usuario>(`/api/v1/admin/usuarios/${id}`)
    if (!res.success || !res.data) throw new Error(res.error ?? 'Usuario no encontrado')
    return res.data
  },

  async create(data: NuevoUsuarioForm): Promise<Usuario> {
    const res = await apiClient.post<Usuario>('/api/v1/admin/usuarios', data)
    if (!res.success || !res.data) throw new Error(res.error ?? 'Error al crear usuario')
    return res.data
  },

  async update(id: string, data: Partial<NuevoUsuarioForm>): Promise<Usuario> {
    const res = await apiClient.patch<Usuario>(`/api/v1/admin/usuarios/${id}`, data)
    if (!res.success || !res.data) throw new Error(res.error ?? 'Error al actualizar')
    return res.data
  },

  async asignarRol(id: string, rol_id: string): Promise<Usuario> {
    const res = await apiClient.patch<Usuario>(`/api/v1/admin/usuarios/${id}/rol`, { rol_id })
    if (!res.success || !res.data) throw new Error(res.error ?? 'Error al asignar rol')
    return res.data
  },

  async desactivar(id: string): Promise<void> {
    const res = await apiClient.patch(`/api/v1/admin/usuarios/${id}/desactivar`, {})
    if (!res.success) throw new Error(res.error ?? 'Error al desactivar usuario')
  },

  async getRoles(): Promise<Rol[]> {
    const res = await apiClient.get<Rol[]>('/api/v1/admin/roles')
    if (!res.success || !res.data) throw new Error(res.error ?? 'Error al obtener roles')
    return res.data
  },

  async getSolicitudes(estado?: string): Promise<SolicitudRegistro[]> {
    const qs = estado ? `?estado=${encodeURIComponent(estado)}` : ''
    const res = await apiClient.get<SolicitudRegistro[]>(`/api/v1/admin/solicitudes${qs}`)
    if (!res.success || !res.data) throw new Error(res.error ?? 'Error al obtener solicitudes')
    return res.data
  },

  async revisarSolicitud(id: string, data: {
    accion: 'Aprobada' | 'Rechazada'
    comentario?: string
    contrasena?: string
    rol_id?: string
  }) {
    const res = await apiClient.patch(`/api/v1/admin/solicitudes/${id}`, data)
    if (!res.success) throw new Error(res.error ?? 'Error al procesar solicitud')
    return res.data
  },

  // Perfil del usuario actual — usa el endpoint de auth
  async getPerfil() {
    const res = await authService.getPerfil()
    if (!res.success || !res.data) throw new Error(res.error ?? 'Error al obtener perfil')
    const p = res.data
    return {
      id: p.IDUsuario,
      nombre_completo: p.nombre_completo,
      correo_electronico: p.correo_electronico,
      telefono: p.telefono,
      cargo: p.cargo,
      institucion: p.institucion,
      rol: p.rol.nombre,
    }
  },

  async updatePerfil(data: { nombre_completo?: string; telefono?: string | null }) {
    const res = await authService.actualizarPerfil(data)
    if (!res.success) throw new Error(res.error ?? 'Error al actualizar perfil')
    return res.data
  },
}
