import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { locationService } from './locationService'

describe('locationService', () => {
  const originalGeo = navigator.geolocation

  beforeEach(() => {
    sessionStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: originalGeo,
    })
  })

  it('combines report and zone markers with markerType', async () => {
    const pending = locationService.getAllLocations()
    await vi.runAllTimersAsync()
    const all = await pending

    expect(all.length).toBeGreaterThan(0)
    expect(all.some((i) => i.markerType === 'report')).toBe(true)
    expect(all.some((i) => i.markerType === 'zone')).toBe(true)
  })

  it('filters by type and risk level', async () => {
    const pending = locationService.filterLocations({ type: 'zone', nivelRiesgo: 'Crítico' })
    await vi.runAllTimersAsync()
    const filtered = await pending

    expect(filtered.length).toBeGreaterThan(0)
    expect(filtered.every((i) => i.markerType === 'zone')).toBe(true)
    expect(filtered.every((i) => i.nivelRiesgo === 'Crítico')).toBe(true)
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
