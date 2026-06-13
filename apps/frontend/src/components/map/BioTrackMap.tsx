/**
 * BioTrackMap — reusable Leaflet map component.
 *
 * Props:
 *  - locations: Array of location objects (markerType, lat, lng, estado, nivelRiesgo, etc.)
 *  - colorBy: 'status' | 'risk'  (which field drives marker colour)
 *  - onMarkerClick: (location) => void  (called when a marker is clicked)
 *  - center: [lat, lng]   (default: DR_CENTER)
 *  - zoom: number         (default: DR_ZOOM)
 *  - height: string       (CSS height, default: '100%')
 *  - showLegend: bool     (default: true)
 *  - interactive: bool    (default: true — set false for embedded/small maps)
 *  - selectedLocation: location object to highlight
 *
 * Leaflet icon fix: uses divIcon circles to avoid broken PNG import issues in Vite.
 */
import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, ZoomControl } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import {
  DR_CENTER, DR_ZOOM,
  TILE_URL, TILE_ATTRIBUTION,
  STATUS_MARKER_COLORS, RISK_MARKER_COLORS, DEFAULT_MARKER_COLOR,
} from '../../constants/mapConfig'

// ── Marker colour helpers ──────────────────────────────────────────────────────

function getColor(location, colorBy) {
  if (colorBy === 'risk') return RISK_MARKER_COLORS[location.nivelRiesgo] ?? DEFAULT_MARKER_COLOR
  return STATUS_MARKER_COLORS[location.estado] ?? DEFAULT_MARKER_COLOR
}

// ── Recenter helper (used when center prop changes) ───────────────────────────

function MapController({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView(center, zoom ?? map.getZoom())
  }, [center, zoom, map])
  return null
}

// ── Legend ─────────────────────────────────────────────────────────────────────

const STATUS_LEGEND = [
  { label: 'Nueva',         color: STATUS_MARKER_COLORS['Nueva'] },
  { label: 'En revisión',   color: STATUS_MARKER_COLORS['En revisión'] },
  { label: 'Monitorear',    color: STATUS_MARKER_COLORS['Monitorear'] },
  { label: 'En Monitoreo',  color: STATUS_MARKER_COLORS['En Monitoreo'] },
  { label: 'En Corrección', color: STATUS_MARKER_COLORS['En Corrección'] },
  { label: 'Corregido',     color: STATUS_MARKER_COLORS['Corregido'] },
  { label: 'Declinada',     color: STATUS_MARKER_COLORS['Declinada'] },
]

const RISK_LEGEND = [
  { label: 'Bajo',    color: RISK_MARKER_COLORS['Bajo'] },
  { label: 'Medio',   color: RISK_MARKER_COLORS['Medio'] },
  { label: 'Alto',    color: RISK_MARKER_COLORS['Alto'] },
  { label: 'Crítico', color: RISK_MARKER_COLORS['Crítico'] },
]

function Legend({ colorBy }) {
  const items = colorBy === 'risk' ? RISK_LEGEND : STATUS_LEGEND
  return (
    <div className="absolute bottom-6 left-3 z-[1000] rounded-xl bg-white/95 shadow-lg px-3 py-2.5 text-xs pointer-events-none">
      <p className="font-bold text-gray-700 mb-2 text-[11px] uppercase tracking-wide">
        {colorBy === 'risk' ? 'Nivel de riesgo' : 'Estado'}
      </p>
      <div className="flex flex-col gap-1.5">
        {items.map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-full border border-white shadow-sm" style={{ background: color }} />
            <span className="text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function BioTrackMap({
  locations = [],
  colorBy = 'status',
  onMarkerClick,
  center = DR_CENTER,
  zoom = DR_ZOOM,
  height = '100%',
  showLegend = true,
  interactive = true,
}) {
  const navigate = useNavigate()

  function handleClick(loc) {
    if (onMarkerClick) onMarkerClick(loc)
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-200" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        scrollWheelZoom={interactive}
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        {interactive && <ZoomControl position="topright" />}
        <MapController center={center} zoom={zoom} />

        {locations.map((loc) => {
          const color = getColor(loc, colorBy)
          return (
            <CircleMarker
              key={loc.id}
              center={[loc.lat, loc.lng]}
              radius={10}
              pathOptions={{
                color: '#fff',
                weight: 2,
                fillColor: color,
                fillOpacity: 0.92,
              }}
              eventHandlers={{ click: () => handleClick(loc) }}
            >
              <Popup>
                <div className="min-w-[200px] text-sm">
                  <p className="font-bold text-gray-800 mb-1">{loc.provincia}</p>
                  <p className="text-gray-500 text-xs mb-2">{loc.municipio}{loc.sector ? ` · ${loc.sector}` : ''}</p>
                  <p className="text-gray-700 text-xs leading-snug mb-3 line-clamp-2">{loc.descripcion}</p>
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: STATUS_MARKER_COLORS[loc.estado] ?? DEFAULT_MARKER_COLOR }}>
                      {loc.estado}
                    </span>
                    {loc.nivelRiesgo && (
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: RISK_MARKER_COLORS[loc.nivelRiesgo] ?? DEFAULT_MARKER_COLOR }}>
                        Riesgo {loc.nivelRiesgo}
                      </span>
                    )}
                  </div>
                  {loc.denunciaId && (
                    <button
                      onClick={() => navigate(loc.markerType === 'zone' ? `/admin/monitoreo/${loc.denunciaId}` : `/admin/denuncias/${loc.denunciaId}`)}
                      className="w-full rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
                    >
                      Ver detalle →
                    </button>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>

      {showLegend && interactive && (
        <Legend colorBy={colorBy} />
      )}

      {locations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-[999] pointer-events-none">
          <div className="rounded-xl bg-white px-5 py-4 shadow text-center">
            <p className="text-sm font-semibold text-gray-600">Sin marcadores para mostrar</p>
            <p className="text-xs text-gray-400 mt-1">Ajusta los filtros para ver resultados</p>
          </div>
        </div>
      )}
    </div>
  )
}
