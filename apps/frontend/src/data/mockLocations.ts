/**
 * Structured location data for map markers.
 * Each record links to a denuncia or monitoreo zone.
 * Parse the existing GPS string fields or use coordinates below.
 *
 * Coordinate reference: Dominican Republic
 * lat range: 17.4 – 20.1  |  lng range: -72.0 – -68.2
 */

export const MOCK_REPORT_LOCATIONS = [
  {
    id: 'loc-001',
    denunciaId: '001',
    lat: 18.4274,
    lng: -68.9724,
    provincia: 'La Romana',
    municipio: 'San Rafael del Yuma',
    sector: 'Bayahibe',
    descripcion: 'Extracción de Arena de playa en Bayahibe y zona de arrecife',
    nivelRiesgo: 'Alto',
    estado: 'Nueva',
    tipoExtraccion: 'Manual',
  },
  {
    id: 'loc-002',
    denunciaId: '002',
    lat: 19.6372,
    lng: -70.1461,
    provincia: 'María Trinidad Sánchez',
    municipio: 'Río San Juan',
    sector: 'Los Charamicos',
    descripcion: 'Arena Extraída ilegalmente en zona de manglar de Río San Juan',
    nivelRiesgo: 'Crítico',
    estado: 'En revisión',
    tipoExtraccion: 'Maquinaria pesada',
  },
  {
    id: 'loc-003',
    denunciaId: '003',
    lat: 18.5601,
    lng: -68.3725,
    provincia: 'La Altagracia',
    municipio: 'Higüey',
    sector: 'Punta Cana',
    descripcion: 'Extracción ilegal de arena para construcción en Punta Cana',
    nivelRiesgo: 'Alto',
    estado: 'Monitorear',
    tipoExtraccion: 'Maquinaria pesada',
  },
  {
    id: 'loc-004',
    denunciaId: '004',
    lat: 18.8000,
    lng: -70.1500,
    provincia: 'Sánchez Ramírez',
    municipio: 'Cotuí',
    sector: 'Pueblo Viejo',
    descripcion: 'Minería ilegal en zona de Pueblo Viejo',
    nivelRiesgo: 'Crítico',
    estado: 'Declinada',
    tipoExtraccion: 'Manual',
  },
]

export const MOCK_ZONE_LOCATIONS = [
  {
    id: 'zone-001',
    denunciaId: '001',
    lat: 18.4350,
    lng: -68.9600,
    provincia: 'La Romana',
    municipio: 'San Rafael del Yuma',
    nombre: 'Zona Costera Bayahibe',
    nivelRiesgo: 'Alto',
    estado: 'Monitorear',
    descripcion: 'Zona costera afectada por extracción de arena en arrecife',
  },
  {
    id: 'zone-002',
    denunciaId: '002',
    lat: 19.6100,
    lng: -70.1700,
    provincia: 'María Trinidad Sánchez',
    municipio: 'Río San Juan',
    nombre: 'Manglar Río San Juan',
    nivelRiesgo: 'Crítico',
    estado: 'En Monitoreo',
    descripcion: 'Zona de manglar bajo monitoreo continuo',
  },
  {
    id: 'zone-003',
    denunciaId: '004',
    lat: 18.7900,
    lng: -70.1600,
    provincia: 'Sánchez Ramírez',
    municipio: 'Cotuí',
    nombre: 'Zona Minera Pueblo Viejo',
    nivelRiesgo: 'Crítico',
    estado: 'En Corrección',
    descripcion: 'Zona minera ilegal bajo proceso correctivo',
  },
  {
    id: 'zone-004',
    denunciaId: '005',
    lat: 19.3058,
    lng: -69.5400,
    provincia: 'Samaná',
    municipio: 'Las Terrenas',
    nombre: 'Playa Las Terrenas',
    nivelRiesgo: 'Medio',
    estado: 'En Corrección',
    descripcion: 'Extracción en zona de conservación de playa',
  },
  {
    id: 'zone-005',
    denunciaId: '006',
    lat: 18.4512,
    lng: -70.7340,
    provincia: 'Azua',
    municipio: 'Azua',
    nombre: 'Zona Protegida Azua',
    nivelRiesgo: 'Medio',
    estado: 'Monitorear',
    descripcion: 'Área protegida con extracción nocturna detectada',
  },
]

/** Helper: parse GPS string "lat, lng" → { lat, lng } */
export function parseGPS(gpsString) {
  if (!gpsString) return null
  const parts = gpsString.split(',').map((s) => parseFloat(s.trim()))
  if (parts.length !== 2 || parts.some(isNaN)) return null
  return { lat: parts[0], lng: parts[1] }
}
