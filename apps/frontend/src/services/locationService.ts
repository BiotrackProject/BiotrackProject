/**
 * Location Service — map/geolocation data.
 * Replace mock logic with real API calls when backend is ready.
 */
import { MOCK_REPORT_LOCATIONS, MOCK_ZONE_LOCATIONS, parseGPS } from '../data/mockLocations'
import { mockStorage } from '../utils/mockStorage'

const KEY_R = 'report_locations'
const KEY_Z = 'zone_locations'
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

const getReportStore = () => mockStorage.getOrInit(KEY_R, MOCK_REPORT_LOCATIONS.map((l) => ({ ...l })))
const getZoneStore   = () => mockStorage.getOrInit(KEY_Z, MOCK_ZONE_LOCATIONS.map((l) => ({ ...l })))

export const locationService = {
  /** GET /api/map/reports  — all denuncia locations */
  async getReportLocations() {
    await delay()
    return getReportStore()
  },

  /** GET /api/map/zones  — all monitored zone locations */
  async getZoneLocations() {
    await delay()
    return getZoneStore()
  },

  /** GET /api/map/reports/:denunciaId */
  async getReportLocationById(denunciaId) {
    await delay(150)
    return getReportStore().find((l) => l.denunciaId === denunciaId) ?? null
  },

  /** GET /api/map/zones/:denunciaId */
  async getZoneLocationById(denunciaId) {
    await delay(150)
    return getZoneStore().find((z) => z.denunciaId === denunciaId) ?? null
  },

  /** GET /api/map/all  — combined markers for a unified map view */
  async getAllLocations() {
    await delay()
    const reports = getReportStore().map((l) => ({ ...l, markerType: 'report' }))
    const zones   = getZoneStore().map((l) => ({ ...l, markerType: 'zone' }))
    return [...reports, ...zones]
  },

  /** Filter locations by estado and/or nivelRiesgo */
  async filterLocations({ type = 'all', estado = '', nivelRiesgo = '' } = {}) {
    await delay(150)
    let items = []
    if (type === 'report' || type === 'all') items.push(...getReportStore().map((l) => ({ ...l, markerType: 'report' })))
    if (type === 'zone'   || type === 'all') items.push(...getZoneStore().map((l)   => ({ ...l, markerType: 'zone' })))
    if (estado)      items = items.filter((l) => l.estado === estado)
    if (nivelRiesgo) items = items.filter((l) => l.nivelRiesgo === nivelRiesgo)
    return items
  },

  /**
   * GET /api/geolocation/current
   * Wraps browser geolocation API with proper error handling.
   * Returns { lat, lng } or throws with a human-readable message.
   */
  async getCurrentUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Tu navegador no soporta geolocalización'))
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => {
          const messages = {
            1: 'Permiso de ubicación denegado. Actívalo en la configuración del navegador.',
            2: 'No se pudo obtener tu ubicación. Verifica tu conexión GPS.',
            3: 'Tiempo de espera agotado al detectar la ubicación.',
          }
          reject(new Error(messages[err.code] ?? 'Error desconocido de geolocalización'))
        },
        { timeout: 10_000, enableHighAccuracy: true },
      )
    })
  },

  /** Utility: parse GPS string from existing mock data */
  parseGPS,
}
