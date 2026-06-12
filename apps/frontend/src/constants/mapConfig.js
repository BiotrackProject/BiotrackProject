/** Geographic defaults for the Dominican Republic */
export const DR_CENTER = [18.7357, -70.1627]
export const DR_ZOOM   = 8
export const DR_BOUNDS = [[17.4, -72.0], [20.1, -68.2]]

/** OpenStreetMap tile layer — free, no API key needed */
export const TILE_URL         = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

/** Marker colours by denuncia status */
export const STATUS_MARKER_COLORS = {
  'Nueva':         '#22C55E',
  'En revisión':   '#F59E0B',
  'Monitorear':    '#F97316',
  'En Monitoreo':  '#14B8A6',
  'En Corrección': '#06B6D4',
  'Declinada':     '#9CA3AF',
  'Corregido':     '#10B981',
  'Pendiente':     '#F59E0B',
}

/** Marker colours by risk level */
export const RISK_MARKER_COLORS = {
  'Bajo':    '#22C55E',
  'Medio':   '#F59E0B',
  'Alto':    '#F97316',
  'Crítico': '#EF4444',
}

export const DEFAULT_MARKER_COLOR = '#6B7280'
