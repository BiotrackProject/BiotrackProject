/**
 * Location Service — map/geolocation data.
 *
 * Denuncias: datos reales del backend (GET /api/v1/denuncias/mapa).
 * Zonas monitoreadas: aún mock (el módulo de zonas del backend es un stub).
 * Ambas fuentes se normalizan a una forma unificada de marcador para el mapa:
 *   { id, denunciaId, markerType, lat, lng, estado, nivelRiesgo,
 *     descripcion, titulo, subtitulo, codigo? }
 */
import { denunciasService } from './denunciasService'
import { MOCK_ZONE_LOCATIONS, parseGPS } from '../data/mockLocations'

/** Mapea una denuncia geolocalizada del backend a la forma de marcador. */
function denunciaToMarker(d) {
  return {
    id: `den-${d.IDDenuncia}`,
    denunciaId: String(d.IDDenuncia),
    markerType: 'report',
    lat: d.lat,
    lng: d.lng,
    estado: d.Estado,
    nivelRiesgo: d.nivel_urgencia ?? null,
    descripcion: d.Descripcion,
    codigo: d.codigo_seguimiento,
    titulo: d.detalle_ubicacion || `Denuncia ${d.codigo_seguimiento}`,
    subtitulo: d.codigo_seguimiento,
  }
}

/** Normaliza una zona mock a la forma de marcador unificada. */
function zoneToMarker(z) {
  return {
    ...z,
    markerType: 'zone',
    titulo: z.nombre,
    subtitulo: `${z.provincia} · ${z.municipio}`,
  }
}

export const locationService = {
  /** GET /api/v1/denuncias/mapa — denuncias geolocalizadas reales */
  async getReportLocations() {
    const denuncias = await denunciasService.getMapa()
    return denuncias.map(denunciaToMarker)
  },

  /** Zonas monitoreadas (mock, backend pendiente) */
  async getZoneLocations() {
    return MOCK_ZONE_LOCATIONS.map(zoneToMarker)
  },

  /** Marcadores combinados para la vista unificada del mapa */
  async getAllLocations() {
    const [reports, zones] = await Promise.all([
      this.getReportLocations(),
      this.getZoneLocations(),
    ])
    return [...reports, ...zones]
  },

  /**
   * Wraps browser geolocation API with proper error handling.
   * Returns { lat, lng } or throws with a human-readable message.
   */
  async getCurrentUserLocation(): Promise<{ lat: number; lng: number }> {
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

  /** Utility: parse GPS string "lat, lng" → { lat, lng } */
  parseGPS,
}
