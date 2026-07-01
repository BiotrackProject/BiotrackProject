import { apiClient } from './api-client'

export interface DashboardStats {
  totalDenuncias: number
  por_estado: {
    Pendiente: number
    En_Investigacion: number
    Verificada: number
    Resuelta: number
    Desestimada: number
  }
  totalAcciones: number
  por_estado_accion: {
    Planificada: number
    En_Ejecucion: number
    Completada: number
    Cancelada: number
  }
  totalUsuarios: number
  usuariosActivos: number
  solicitudesPendientes: number
}

export interface ImpactoRow {
  tipo_actividad: string
  total: number
}

export interface FrecuenciaRow {
  mes: string
  año: number
  total: number
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const res = await apiClient.get<DashboardStats>('/api/v1/indicadores/resumen')
    if (!res.success || !res.data) throw new Error(res.error ?? 'Error al obtener estadísticas')
    return res.data
  },

  async getImpacto(): Promise<ImpactoRow[]> {
    const res = await apiClient.get<ImpactoRow[]>('/api/v1/indicadores/impacto')
    if (!res.success || !res.data) throw new Error(res.error ?? 'Error al obtener impacto')
    return res.data
  },

  async getFrecuencia(): Promise<FrecuenciaRow[]> {
    const res = await apiClient.get<FrecuenciaRow[]>('/api/v1/indicadores/frecuencia')
    if (!res.success || !res.data) throw new Error(res.error ?? 'Error al obtener frecuencia')
    return res.data
  },
}
