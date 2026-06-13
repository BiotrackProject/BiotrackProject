/**
 * Dashboard Service — derives stats from sessionStorage-backed stores.
 * Replace with GET /api/dashboard/stats when backend is ready.
 */
import { mockStorage } from '../utils/mockStorage'
import { MOCK_DENUNCIAS } from '../data/mockDenuncias'
import { MOCK_MONITOREO_DENUNCIAS } from '../data/mockMonitoreos'
import { MOCK_ACCIONES } from '../data/mockAcciones'
import { MOCK_USUARIOS } from '../data/mockUsuarios'

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

export const dashboardService = {
  /** GET /api/dashboard/stats */
  async getStats() {
    await delay()
    const denuncias   = (mockStorage.get('denuncias')            ?? MOCK_DENUNCIAS)   as typeof MOCK_DENUNCIAS
    const monitoreos  = (mockStorage.get('monitoreo_denuncias') ?? MOCK_MONITOREO_DENUNCIAS) as typeof MOCK_MONITOREO_DENUNCIAS
    const acciones    = (mockStorage.get('acciones')            ?? MOCK_ACCIONES)    as typeof MOCK_ACCIONES
    const usuarios    = (mockStorage.get('usuarios')            ?? MOCK_USUARIOS)    as typeof MOCK_USUARIOS

    return {
      totalDenuncias:       denuncias.length,
      denunciasActivas:     denuncias.filter((d) => d.estado !== 'Declinada').length,
      enRevision:           denuncias.filter((d) => d.estado === 'En revisión').length,
      zonasMonitoreadas:    monitoreos.filter((d) => d.estado === 'En Monitoreo').length,
      accionesEnCorreccion: acciones.filter((a) => a.estado === 'En Corrección').length,
      accionesCorregidas:   acciones.filter((a) => a.estado === 'Corregido').length,
      usuariosActivos:      usuarios.filter((u) => u.estado === 'Activo').length,
    }
  },
}
