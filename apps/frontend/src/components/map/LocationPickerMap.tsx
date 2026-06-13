/**
 * LocationPickerMap — compact Leaflet map for selecting a lat/lng point.
 *
 * Props:
 *  - lat, lng: current selected coordinates (or null)
 *  - onChange: ({ lat, lng }) => void  — called when user clicks to pick a point
 *  - height: CSS string (default 320px)
 *  - readonly: bool — disables click-to-pick, just shows the current pin
 *  - province: optional string — used to set a helpful label near the pin
 */
import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents, useMap, ZoomControl } from 'react-leaflet'
import { MapPin } from 'lucide-react'
import { DR_CENTER, DR_ZOOM, TILE_URL, TILE_ATTRIBUTION } from '../../constants/mapConfig'

function ClickHandler({ onChange }) {
  useMapEvents({
    click(e) {
      if (onChange) onChange({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

function FlyTo({ lat, lng }) {
  const map = useMap()
  useEffect(() => {
    if (lat && lng) map.flyTo([lat, lng], 13, { duration: 1 })
  }, [lat, lng, map])
  return null
}

interface LocationPickerMapProps {
  lat: number | null
  lng: number | null
  onChange?: (point: { lat: number; lng: number } | null) => void
  height?: string
  readonly?: boolean
  province?: string
}

export default function LocationPickerMap({
  lat,
  lng,
  onChange,
  height = '320px',
  readonly = false,
  province,
}: LocationPickerMapProps) {
  const hasPin = lat != null && lng != null

  return (
    <div className="flex flex-col gap-2">
      <div
        className="relative rounded-xl overflow-hidden border border-gray-200"
        style={{ height }}
      >
        <MapContainer
          center={hasPin ? [lat, lng] : DR_CENTER}
          zoom={hasPin ? 13 : DR_ZOOM}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <ZoomControl position="topright" />
          {!readonly && <ClickHandler onChange={onChange} />}
          {hasPin && <FlyTo lat={lat} lng={lng} />}

          {hasPin && (
            <CircleMarker
              center={[lat, lng]}
              radius={10}
              pathOptions={{ color: '#fff', weight: 2.5, fillColor: '#1e40af', fillOpacity: 0.95 }}
            >
              <Popup>
                {province ?? 'Punto seleccionado'}<br />
                <span className="text-xs text-gray-500">{lat.toFixed(5)}, {lng.toFixed(5)}</span>
              </Popup>
            </CircleMarker>
          )}
        </MapContainer>

        {!readonly && (
          <div className="absolute top-2 left-2 z-[1000] rounded-lg bg-white/90 px-2.5 py-1.5 text-xs font-medium text-gray-600 pointer-events-none shadow">
            Haz clic en el mapa para ubicar la zona
          </div>
        )}
      </div>

      {hasPin && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="font-mono">{lat.toFixed(5)}, {lng.toFixed(5)}</span>
          {!readonly && onChange && (
            <button onClick={() => onChange(null)} className="ml-auto text-action hover:underline">
              Quitar pin
            </button>
          )}
        </div>
      )}
    </div>
  )
}
