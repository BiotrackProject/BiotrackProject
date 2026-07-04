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
  fecha_incidente: string | null
  hora_aproximada: string | null
  detalle_ubicacion: string | null
  gps: string | null
  tipo_extraccion: string | null
  numero_personas: string | null
  cantidad_arena: string | null
  nivel_urgencia: string | null
  IDUsuario: string | null
  IDZona: string | null
  contacto_cifrado: string | null
  created_at: string
  historial?: HistorialEstado[]
  Evidencia_Denuncia?: Evidencia[]
  /** RF-5.1 — Acciones correctivas vinculadas a esta denuncia. */
  acciones?: AccionVinculada[]
}

/** Acción correctiva vinculada, expuesta en el detalle de la denuncia (RF-5.1). */
export interface AccionVinculada {
  IDAccion: string
  titulo: string
  Estado: string
  FechaPlanificacion: string | null
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

/** Item del historial expuesto por la consulta pública de seguimiento. */
export interface SeguimientoEstado {
  id: string
  estado_anterior: EstadoDenuncia
  estado_nuevo: EstadoDenuncia
  comentario: string | null
  created_at: string
}

/**
 * Respuesta de la consulta pública por código de seguimiento (RF-2.6).
 * No incluye datos sensibles (contacto, IDUsuario).
 */
export interface DenunciaSeguimiento {
  IDDenuncia: number
  codigo_seguimiento: string
  Descripcion: string
  tipo_actividad: TipoActividad
  Estado: EstadoDenuncia
  Fecha_denuncia: string
  fecha_incidente: string | null
  hora_aproximada: string | null
  detalle_ubicacion: string | null
  tipo_extraccion: string | null
  numero_personas: string | null
  cantidad_arena: string | null
  nivel_urgencia: string | null
  IDZona: string | null
  gps: string | null
  historial_estado_denuncia: SeguimientoEstado[]
  /** RF-5.2 — Acciones correctivas publicadas vinculadas (sin datos personales). */
  acciones?: AccionPublicaVinculada[]
}

/** Acción correctiva publicada, expuesta en la consulta pública de denuncias. */
export interface AccionPublicaVinculada {
  IDAccion: string
  titulo: string
  Estado: string
  resumen_publico: string | null
  FechaPlanificacion: string | null
  FechaImplementacion: string | null
}

/** Denuncia geolocalizada para el mapa (solo las que tienen coordenadas). */
export interface DenunciaMapa {
  IDDenuncia: number
  codigo_seguimiento: string
  Estado: EstadoDenuncia
  tipo_actividad: TipoActividad
  nivel_urgencia: string | null
  detalle_ubicacion: string | null
  Descripcion: string
  Fecha_denuncia: string
  lat: number
  lng: number
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

export const ESTADO_STYLES: Record<EstadoDenuncia, string> = {
  Pendiente:        'bg-yellow-100 text-yellow-800',
  En_Investigacion: 'bg-blue-100 text-blue-800',
  Verificada:       'bg-purple-100 text-purple-800',
  Resuelta:         'bg-green-100 text-green-800',
  Desestimada:      'bg-gray-100 text-gray-500',
}

export const ESTADOS_DENUNCIA: EstadoDenuncia[] = [
  'Pendiente', 'En_Investigacion', 'Verificada', 'Resuelta', 'Desestimada',
]

export const TIPOS_ACTIVIDAD: TipoActividad[] = [
  'Extraccion_Rio', 'Extraccion_Playa', 'Extraccion_Zona_Protegida', 'Transporte_Ilegal', 'Otro',
]

export interface CrearDenunciaInput {
  Descripcion: string
  tipo_actividad: TipoActividad
  hora_aproximada?: string
  contacto?: string
  IDZona?: string
  fecha_incidente?: string
  detalle_ubicacion?: string
  gps?: string
  tipo_extraccion?: string
  numero_personas?: string
  cantidad_arena?: string
  nivel_urgencia?: string
  /** Archivos de evidencia (fotos, videos, audios, PDF). */
  evidencias?: File[]
}

// ── Validación de evidencias (debe coincidir con los límites del backend) ──────
export const EVIDENCIA_MAX_FILES = 10
export const EVIDENCIA_MAX_SIZE_MB = 25
const EVIDENCIA_MAX_SIZE = EVIDENCIA_MAX_SIZE_MB * 1024 * 1024

/** Tipos permitidos: imágenes, video, audio y PDF (igual que el fileFilter del backend). */
export function esEvidenciaValida(file: File): boolean {
  return (
    file.type.startsWith('image/') ||
    file.type.startsWith('video/') ||
    file.type.startsWith('audio/') ||
    file.type === 'application/pdf'
  )
}

export interface FiltroEvidencias {
  aceptados: File[]
  errores: string[]
}

/**
 * Filtra una tanda de archivos contra las reglas de evidencia (tipo, tamaño y
 * cantidad máxima), devolviendo los aceptados y los mensajes de error.
 */
export function filtrarEvidencias(existentes: File[], nuevos: File[]): FiltroEvidencias {
  const aceptados: File[] = []
  const errores: string[] = []
  for (const file of nuevos) {
    if (!esEvidenciaValida(file)) {
      errores.push(`"${file.name}": tipo de archivo no permitido.`)
    } else if (file.size > EVIDENCIA_MAX_SIZE) {
      errores.push(`"${file.name}": supera el tamaño máximo de ${EVIDENCIA_MAX_SIZE_MB} MB.`)
    } else if (existentes.length + aceptados.length >= EVIDENCIA_MAX_FILES) {
      errores.push(`Máximo ${EVIDENCIA_MAX_FILES} archivos. "${file.name}" no se agregó.`)
    } else {
      aceptados.push(file)
    }
  }
  return { aceptados, errores }
}

export interface CrearDenunciaResult {
  IDDenuncia: number
  codigo_seguimiento: string
  mensaje: string
}

export const denunciasService = {
  async crear(datos: CrearDenunciaInput): Promise<CrearDenunciaResult> {
    const { evidencias, ...campos } = datos

    // Siempre multipart: los campos de texto viajan junto a los archivos adjuntos.
    const formData = new FormData()
    for (const [clave, valor] of Object.entries(campos)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        formData.append(clave, String(valor))
      }
    }
    for (const archivo of evidencias ?? []) {
      formData.append('evidencias', archivo)
    }

    const res = await apiClient.postForm<CrearDenunciaResult>('/api/v1/denuncias', formData)
    if (!res.success || !res.data) throw new Error(res.error ?? 'Error al crear la denuncia')
    return res.data
  },

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

  async getMapa(): Promise<DenunciaMapa[]> {
    const res = await apiClient.get<DenunciaMapa[]>('/api/v1/denuncias/mapa')
    if (!res.success || !res.data) throw new Error(res.error ?? 'Error al obtener denuncias del mapa')
    return res.data
  },

  async getById(id: number | string): Promise<Denuncia> {
    const res = await apiClient.get<Denuncia>(`/api/v1/denuncias/${id}`)
    if (!res.success || !res.data) throw new Error(res.error ?? 'Denuncia no encontrada')
    return res.data
  },

  async cambiarEstado(id: number | string, estado: EstadoDenuncia, comentario?: string) {
    // El backend responde { mensaje, denuncia: { IDDenuncia, codigo_seguimiento, Estado } }.
    const res = await apiClient.patch<{ mensaje: string; denuncia: Pick<Denuncia, 'IDDenuncia' | 'codigo_seguimiento' | 'Estado'> }>(
      `/api/v1/denuncias/${id}/estado`,
      { estado, comentario },
    )
    if (!res.success || !res.data) throw new Error(res.error ?? 'Error al cambiar estado')
    return res.data.denuncia
  },

  async getSeguimiento(codigo: string): Promise<DenunciaSeguimiento> {
    const res = await apiClient.get<DenunciaSeguimiento>(`/api/v1/denuncias/seguimiento/${encodeURIComponent(codigo)}`)
    if (!res.success || !res.data) throw new Error(res.error ?? 'Código no encontrado')
    return res.data
  },

  async filter(filtros: FiltrosDenuncias = {}) {
    return this.getAll(filtros)
  },
}
