import { apiClient } from './api-client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export type EstadoAccion = 'Planificada' | 'En_Ejecucion' | 'Completada' | 'Cancelada'

export interface EvidenciaAccion {
  IDEvidencia: string
  archivo_url: string
  TipoArchivo: string
  tamano_bytes: number | null
  fecha_carga: string
}

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
  Usuario?: { nombre_completo: string } | null
  _count?: { accion_denuncia: number }
  accion_denuncia?: Array<{
    Denuncia: { IDDenuncia: number; codigo_seguimiento: string; Estado: string; tipo_actividad: string }
  }>
  accion_zona?: Array<{ IDZona: string }>
  Evidencia_Accion?: EvidenciaAccion[]
}

/** Reporte público de una acción correctiva (RF-5.2), sin datos personales. */
export interface AccionPublica {
  IDAccion: string
  titulo: string
  resumen_publico: string | null
  Estado: EstadoAccion
  FechaPlanificacion: string | null
  FechaImplementacion: string | null
  visibilidad: 'Publico' | 'Restringido'
  institucion: string | null
  denuncias: Array<{ codigo_seguimiento: string; tipo_actividad: string; Estado: string }>
  zonas: string[]
}

export interface CrearAccionInput {
  titulo: string
  descripcion_accion?: string
  FechaPlanificacion?: string
  FechaImplementacion?: string
  resumen_publico?: string
  Presupuesto?: number
  denunciaIds?: number[]
  zonaIds?: string[]
  evidencias?: File[]
}

// Límites de evidencias de acciones (deben coincidir con el backend, RF-5.1).
export const EVIDENCIA_ACCION_MAX_FILES = 5
export const EVIDENCIA_ACCION_MAX_SIZE_MB = 10
const EVIDENCIA_ACCION_MAX_SIZE = EVIDENCIA_ACCION_MAX_SIZE_MB * 1024 * 1024
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

/** Tipos permitidos para evidencias de acciones: PDF, JPG, PNG, DOCX. */
export function esEvidenciaAccionValida(file: File): boolean {
  return (
    file.type === 'image/jpeg' ||
    file.type === 'image/png' ||
    file.type === 'application/pdf' ||
    file.type === DOCX_MIME
  )
}

export function filtrarEvidenciasAccion(existentes: File[], nuevos: File[]): { aceptados: File[]; errores: string[] } {
  const aceptados: File[] = []
  const errores: string[] = []
  for (const file of nuevos) {
    if (!esEvidenciaAccionValida(file)) {
      errores.push(`"${file.name}": tipo no permitido (solo PDF, JPG, PNG, DOCX).`)
    } else if (file.size > EVIDENCIA_ACCION_MAX_SIZE) {
      errores.push(`"${file.name}": supera ${EVIDENCIA_ACCION_MAX_SIZE_MB} MB.`)
    } else if (existentes.length + aceptados.length >= EVIDENCIA_ACCION_MAX_FILES) {
      errores.push(`Máximo ${EVIDENCIA_ACCION_MAX_FILES} archivos. "${file.name}" no se agregó.`)
    } else {
      aceptados.push(file)
    }
  }
  return { aceptados, errores }
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

  async crear(data: CrearAccionInput): Promise<Accion> {
    const { evidencias, denunciaIds, zonaIds, Presupuesto, ...campos } = data

    // Siempre multipart: los campos de texto viajan junto a los archivos adjuntos.
    const formData = new FormData()
    for (const [clave, valor] of Object.entries(campos)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        formData.append(clave, String(valor))
      }
    }
    if (Presupuesto !== undefined) formData.append('Presupuesto', String(Presupuesto))
    if (denunciaIds && denunciaIds.length > 0) formData.append('denunciaIds', JSON.stringify(denunciaIds))
    if (zonaIds && zonaIds.length > 0) formData.append('zonaIds', JSON.stringify(zonaIds))
    for (const archivo of evidencias ?? []) {
      formData.append('evidencias', archivo)
    }

    const res = await apiClient.postForm<Accion>('/api/v1/acciones', formData)
    if (!res.success || !res.data) throw new Error(res.error ?? 'Error al crear acción')
    return res.data
  },

  async actualizar(id: string, data: Partial<Accion>) {
    const res = await apiClient.put<Accion>(`/api/v1/acciones/${id}`, data)
    if (!res.success || !res.data) throw new Error(res.error ?? 'Error al actualizar')
    return res.data
  },

  /** RF-5.2 — Reporte público (sin autenticación). */
  async getPublica(id: string): Promise<AccionPublica> {
    const res = await apiClient.get<AccionPublica>(`/api/v1/acciones/publicas/${id}`)
    if (!res.success || !res.data) throw new Error(res.error ?? 'Reporte no disponible')
    return res.data
  },

  /** RF-5.2 — Publicar / despublicar. */
  async publicar(id: string, resumen_publico: string) {
    const res = await apiClient.post<Accion>(`/api/v1/acciones/${id}/publicar`, { resumen_publico })
    if (!res.success || !res.data) throw new Error(res.error ?? 'Error al publicar')
    return res.data
  },

  async despublicar(id: string) {
    const res = await apiClient.delete<Accion>(`/api/v1/acciones/${id}/publicar`)
    if (!res.success || !res.data) throw new Error(res.error ?? 'Error al despublicar')
    return res.data
  },

  /** RF-5.3 — Descarga el reporte exportado (PDF/XLSX) como blob. */
  async exportar(id: string, formato: 'PDF' | 'XLSX', incluirEvidencias = false): Promise<void> {
    const token = localStorage.getItem('biotrack_token')
    const params = new URLSearchParams({ formato, incluir_evidencias: String(incluirEvidencias) })
    const res = await fetch(`${API_BASE_URL}/api/v1/acciones/${id}/exportar?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) throw new Error('Error al exportar el reporte')

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const ext = formato.toLowerCase()
    const a = document.createElement('a')
    a.href = url
    a.download = `accion-${id.slice(-8)}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  },

  async filter(filtros: { query?: string; estado?: string } = {}) {
    return this.getAll({ q: filtros.query, estado: filtros.estado as EstadoAccion })
  },
}
