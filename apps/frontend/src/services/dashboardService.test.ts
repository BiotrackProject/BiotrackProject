import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { dashboardService } from './dashboardService'
import { mockStorage } from '../utils/mockStorage'

describe('dashboardService', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('computes stats from persisted mock stores', async () => {
    mockStorage.set('denuncias', [
      { id: '001', estado: 'Nueva' },
      { id: '002', estado: 'En revisión' },
      { id: '003', estado: 'Declinada' },
    ])
    mockStorage.set('monitoreo_denuncias', [
      { id: 'm1', estado: 'En Monitoreo' },
      { id: 'm2', estado: 'Monitorear' },
    ])
    mockStorage.set('acciones', [
      { id: 'a1', estado: 'En Corrección' },
      { id: 'a2', estado: 'Corregido' },
      { id: 'a3', estado: 'Pendiente' },
    ])
    mockStorage.set('usuarios', [
      { id: 'u1', estado: 'Activo' },
      { id: 'u2', estado: 'Inactivo' },
      { id: 'u3', estado: 'Activo' },
    ])

    const pending = dashboardService.getStats()
    await vi.runAllTimersAsync()
    const stats = await pending

    expect(stats).toEqual({
      totalDenuncias: 3,
      denunciasActivas: 2,
      enRevision: 1,
      zonasMonitoreadas: 1,
      accionesEnCorreccion: 1,
      accionesCorregidas: 1,
      usuariosActivos: 2,
    })
  })

  it('falls back to seeded data when storage is empty', async () => {
    const pending = dashboardService.getStats()
    await vi.runAllTimersAsync()
    const stats = await pending

    expect(stats.totalDenuncias).toBeGreaterThan(0)
    expect(stats.denunciasActivas).toBeGreaterThanOrEqual(0)
    expect(stats.usuariosActivos).toBeGreaterThanOrEqual(0)
  })
})
