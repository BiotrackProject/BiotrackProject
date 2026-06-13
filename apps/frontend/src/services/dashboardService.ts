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

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const res = await apiClient.get<DashboardStats>('/api/v1/indicadores/resumen')
    if (!res.success || !res.data) throw new Error(res.error ?? 'Error al obtener estadísticas')
    return res.data
  },
}
