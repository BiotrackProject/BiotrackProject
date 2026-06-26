import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { locationService } from './locationService'
import { denunciasService } from './denunciasService'

vi.mock('./denunciasService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./denunciasService')>()
  return { ...actual, denunciasService: { getMapa: vi.fn() } }
})

const mockDenuncia = {
  IDDenuncia: 42,
  codigo_seguimiento: 'ABCD1234',
  Estado: 'Pendiente' as const,
  tipo_actividad: 'Extraccion_Playa' as const,
  nivel_urgencia: 'Alta',
  detalle_ubicacion: 'Playa de Bayahibe, cerca del muelle',
  Descripcion: 'Extracción de arena en la playa',
  Fecha_denuncia: '2026-06-20T00:00:00.000Z',
  lat: 18.4274,
  lng: -68.9724,
}

describe('locationService', () => {
  const originalGeo = navigator.geolocation

  beforeEach(() => {
    vi.mocked(denunciasService.getMapa).mockResolvedValue([mockDenuncia])
  })

  afterEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: originalGeo,
    })
  })

  it('combines report and zone markers with markerType', async () => {
    const all = await locationService.getAllLocations()

    expect(all.length).toBeGreaterThan(0)
    expect(all.some((i) => i.markerType === 'report')).toBe(true)
    expect(all.some((i) => i.markerType === 'zone')).toBe(true)
  })

  it('maps a backend denuncia to a unified report marker', async () => {
    const reports = await locationService.getReportLocations()

    expect(reports).toHaveLength(1)
    expect(reports[0]).toMatchObject({
      denunciaId: '42',
      markerType: 'report',
      lat: 18.4274,
      lng: -68.9724,
      estado: 'Pendiente',
      nivelRiesgo: 'Alta',
      titulo: 'Playa de Bayahibe, cerca del muelle',
      subtitulo: 'ABCD1234',
      codigo: 'ABCD1234',
    })
  })

  it('normalizes zone markers with titulo and subtitulo', async () => {
    const zones = await locationService.getZoneLocations()

    expect(zones.length).toBeGreaterThan(0)
    expect(zones.every((z) => z.markerType === 'zone')).toBe(true)
    expect(zones.every((z) => typeof z.titulo === 'string' && typeof z.subtitulo === 'string')).toBe(true)
  })

  it('parses GPS strings to coordinate objects', () => {
    expect(locationService.parseGPS('18.4274, -68.9724')).toEqual({ lat: 18.4274, lng: -68.9724 })
    expect(locationService.parseGPS('invalid')).toBeNull()
    expect(locationService.parseGPS('')).toBeNull()
  })

  it('returns current user location when geolocation succeeds', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((success) => success({ coords: { latitude: 18.5, longitude: -69.9 } })),
      },
    })

    await expect(locationService.getCurrentUserLocation()).resolves.toEqual({ lat: 18.5, lng: -69.9 })
  })

  it('returns readable error when permission is denied', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((_, error) => error({ code: 1 })),
      },
    })

    await expect(locationService.getCurrentUserLocation()).rejects.toThrow('Permiso de ubicación denegado')
  })
})
