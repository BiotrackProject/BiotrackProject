// Monitoreo muestra denuncias activas (backend de zonas pendiente de implementación completa).
import { denunciasService } from './denunciasService'
import type { Denuncia, EstadoDenuncia } from './denunciasService'

export const monitoreoService = {
  async getDenuncias(): Promise<Denuncia[]> {
    const res = await denunciasService.getAll({ por_pagina: 100 })
    return res.data.filter(d =>
      d.Estado === 'Pendiente' || d.Estado === 'En_Investigacion' || d.Estado === 'Verificada'
    )
  },

  async getDenunciaById(id: number | string): Promise<Denuncia> {
    return denunciasService.getById(id)
  },

  async updateEstado(id: number | string, nuevoEstado: EstadoDenuncia) {
    return denunciasService.cambiarEstado(id, nuevoEstado)
  },

  async filter({ query = '', estado = '' } = {}) {
    const res = await denunciasService.getAll({ q: query || undefined, por_pagina: 100 })
    let data = res.data
    if (estado) data = data.filter(d => d.Estado === estado)
    return data
  },

  // Planes de monitoreo — backend de zonas pendiente
  async getPlanesByDenuncia(_denunciaId: number | string) { return [] },
  async createPlan(_data: unknown) { return null },
  async removePlan(_id: string) { return null },
}
