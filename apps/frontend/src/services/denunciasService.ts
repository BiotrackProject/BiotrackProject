import { apiClient } from './api-client'

export type EstadoDenuncia = 'Pendiente' | 'En_Investigacion' | 'Verificada' | 'Resuelta' | 'Desestimada'
export type TipoActividad = 'Extraccion_Rio' | 'Extraccion_Playa' | 'Extraccion_Zona_Protegida' | 'Transporte_Ilegal' | 'Otro'

export interface Denuncia {
  IDDenuncia: number
  codigo_seguimiento: string
  Descripcion: string
  tipo_actividad: TipoActividad
  Estado: EstadoDenuncia
  Fecha_denuncia: string
  hora_aproximada: string | null
  IDUsuario: string | null
  IDZona: string | null
  contacto_cifrado: string | null
  created_at: string
  historial?: HistorialEstado[]
  Evidencia_Denuncia?: Evidencia[]
}

export interface HistorialEstado {
  id: string
  estado_anterior: EstadoDenuncia
  estado_nuevo: EstadoDenuncia
  comentario: string | null
  created_at: string
  Usuario: { nombre_completo: string }
}

export interface Evidencia {
  IDEvidencia: string
  archivo_url: string
  TipoArchivo: string
  fecha_carga: string
}

export interface DenunciasPaginadas {
  data: Denuncia[]
  paginacion: { total: number; pagina: number; por_pagina: number; total_paginas: number }
}

export interface FiltrosDenuncias {
  estado?: EstadoDenuncia
  tipo?: TipoActividad
  q?: string
  pagina?: number
  por_pagina?: number
}

export const ESTADO_LABEL: Record<EstadoDenuncia, string> = {
  Pendiente:        'Pendiente',
  En_Investigacion: 'En Investigación',
  Verificada:       'Verificada',
  Resuelta:         'Resuelta',
  Desestimada:      'Desestimada',
}

export const ESTADO_STYLES: Record<EstadoDenuncia, string> = {
  Pendiente:        'bg-yellow-100 text-yellow-800',
  En_Investigacion: 'bg-blue-100 text-blue-800',
  Verificada:       'bg-purple-100 text-purple-800',
  Resuelta:         'bg-green-100 text-green-800',
  Desestimada:      'bg-gray-100 text-gray-500',
}

export const TIPO_LABEL: Record<TipoActividad, string> = {
  Extraccion_Rio:            'Extracción de río',
  Extraccion_Playa:          'Extracción de playa',
  Extraccion_Zona_Protegida: 'Extracción zona protegida',
  Transporte_Ilegal:         'Transporte ilegal',
  Otro:                      'Otro',
}

export const ESTADOS_DENUNCIA = Object.keys(ESTADO_LABEL) as EstadoDenuncia[]

export const denunciasService = {
  async getAll(filtros: FiltrosDenuncias = {}): Promise<DenunciasPaginadas> {
    const params = new URLSearchParams()
    if (filtros.estado)    params.set('estado', filtros.estado)
    if (filtros.tipo)      params.set('tipo', filtros.tipo)
    if (filtros.q)         params.set('q', filtros.q)
    if (filtros.pagina)    params.set('pagina', String(filtros.pagina))
    if (filtros.por_pagina) params.set('por_pagina', String(filtros.por_pagina))

    const qs = params.toString()
    const res = await apiClient.get<DenunciasPaginadas>(`/api/v1/denuncias${qs ? `?${qs}` : ''}`)
    if (!res.success || !res.data) throw new Error(res.error ?? 'Error al obtener denuncias')
    return res.data
  },

  async getById(id: number | string): Promise<Denuncia> {
    const res = await apiClient.get<Denuncia>(`/api/v1/denuncias/${id}`)
    if (!res.success || !res.data) throw new Error(res.error ?? 'Denuncia no encontrada')
    return res.data
  },

  async cambiarEstado(id: number | string, estado: EstadoDenuncia, comentario?: string) {
    const res = await apiClient.patch<Denuncia>(`/api/v1/denuncias/${id}/estado`, { estado, comentario })
    if (!res.success || !res.data) throw new Error(res.error ?? 'Error al cambiar estado')
    return res.data
  },

  async getSeguimiento(codigo: string) {
    const res = await apiClient.get<Denuncia>(`/api/v1/denuncias/seguimiento/${codigo}`)
    if (!res.success || !res.data) throw new Error(res.error ?? 'Código no encontrado')
    return res.data
  },

  async filter(filtros: FiltrosDenuncias = {}) {
    return this.getAll(filtros)
  },
}
