import { apiClient } from './api-client'

export type EstadoAccion = 'Planificada' | 'En_Ejecucion' | 'Completada' | 'Cancelada'

export interface Accion {
  IDAccion: string
  titulo: string
  descripcion_accion: string | null
  Estado: EstadoAccion
  FechaPlanificacion: string | null
  FechaImplementacion: string | null
  visibilidad: 'Publico' | 'Restringido'
  resumen_publico: string | null
  Resultado: string | null
  Presupuesto: string | null
  created_at: string
  responsable: { nombre_completo: string } | null
  _count?: { accion_denuncia: number }
  accion_denuncia?: Array<{
    Denuncia: { IDDenuncia: number; codigo_seguimiento: string; Estado: string; tipo_actividad: string }
  }>
}

export interface AccionesPaginadas {
  data: Accion[]
  paginacion: { total: number; pagina: number; por_pagina: number; total_paginas: number }
}

export const ESTADO_ACCION_LABEL: Record<EstadoAccion, string> = {
  Planificada:  'Planificada',
  En_Ejecucion: 'En Ejecución',
  Completada:   'Completada',
  Cancelada:    'Cancelada',
}

export const ESTADO_ACCION_STYLES: Record<EstadoAccion, string> = {
  Planificada:  'bg-yellow-100 text-yellow-800',
  En_Ejecucion: 'bg-blue-100 text-blue-800',
  Completada:   'bg-green-100 text-green-800',
  Cancelada:    'bg-gray-100 text-gray-500',
}

export const ESTADOS_ACCION = Object.keys(ESTADO_ACCION_LABEL) as EstadoAccion[]

export const accionesService = {
  async getAll(filtros: { q?: string; estado?: EstadoAccion; pagina?: number; por_pagina?: number } = {}): Promise<AccionesPaginadas> {
    const params = new URLSearchParams()
    if (filtros.q)         params.set('q', filtros.q)
    if (filtros.estado)    params.set('estado', filtros.estado)
    if (filtros.pagina)    params.set('pagina', String(filtros.pagina))
    if (filtros.por_pagina) params.set('por_pagina', String(filtros.por_pagina))

    const qs = params.toString()
    const res = await apiClient.get<AccionesPaginadas>(`/api/v1/acciones${qs ? `?${qs}` : ''}`)
    if (!res.success || !res.data) throw new Error(res.error ?? 'Error al obtener acciones')
    return res.data
  },

  async getById(id: string): Promise<Accion> {
    const res = await apiClient.get<Accion>(`/api/v1/acciones/${id}`)
    if (!res.success || !res.data) throw new Error(res.error ?? 'Acción no encontrada')
    return res.data
  },

  async cambiarEstado(id: string, estado: EstadoAccion, Resultado?: string) {
    const res = await apiClient.post<Accion>(`/api/v1/acciones/${id}/estado`, { estado, Resultado })
    if (!res.success || !res.data) throw new Error(res.error ?? 'Error al cambiar estado')
    return res.data
  },

  async crear(data: {
    titulo: string
    descripcion_accion?: string
    FechaPlanificacion?: string
    denunciaIds?: number[]
  }) {
    const res = await apiClient.post<Accion>('/api/v1/acciones', data)
    if (!res.success || !res.data) throw new Error(res.error ?? 'Error al crear acción')
    return res.data
  },

  async actualizar(id: string, data: Partial<Accion>) {
    const res = await apiClient.put<Accion>(`/api/v1/acciones/${id}`, data)
    if (!res.success || !res.data) throw new Error(res.error ?? 'Error al actualizar')
    return res.data
  },

  async filter(filtros: { query?: string; estado?: string } = {}) {
    return this.getAll({ q: filtros.query, estado: filtros.estado as EstadoAccion })
  },
}
