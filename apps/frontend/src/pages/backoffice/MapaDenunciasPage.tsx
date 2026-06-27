import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SlidersHorizontal, Layers, Search, Navigation } from 'lucide-react'
import BackofficeTopbar from '../../components/backoffice/BackofficeTopbar'
import BioTrackMap from '../../components/map/BioTrackMap'
import StatusBadge from '../../components/ui/StatusBadge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { locationService } from '../../services/locationService'
import { toast } from '../../utils/toast'
import { ESTADOS_DENUNCIA, ESTADO_LABEL } from '../../services/denunciasService'
import { DR_CENTER } from '../../constants/mapConfig'

const VIEW_TYPES = [
  { value: 'all',    label: 'Todos' },
  { value: 'report', label: 'Denuncias' },
  { value: 'zone',   label: 'Zonas monitoreadas' },
]

const COLOR_MODES = [
  { value: 'status', label: 'Por estado' },
  { value: 'risk',   label: 'Por urgencia' },
]

/** Niveles de urgencia reales (nivel_urgencia del backend). */
const URGENCIA_NIVELES = ['Baja', 'Media', 'Alta', 'Riesgo inmediato']

export default function MapaDenunciasPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const VIEW_TYPES = [
    { value: 'all',    label: t('mapa.viewAll') },
    { value: 'report', label: t('mapa.viewReports') },
    { value: 'zone',   label: t('mapa.viewZones') },
  ]

  const COLOR_MODES = [
    { value: 'status', label: t('mapa.byStatus') },
    { value: 'risk',   label: t('mapa.byRisk') },
  ]

  const [locations, setLocations] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  const [viewType, setViewType]     = useState('all')
  const [colorBy, setColorBy]       = useState('status')
  const [filterEstado, setFilterEstado]   = useState('')
  const [filterRiesgo, setFilterRiesgo]   = useState('')
  const [searchQuery, setSearchQuery]     = useState('')
  const [selectedLocation, setSelectedLocation] = useState(null)

  const [mapCenter, setMapCenter] = useState(DR_CENTER)
  const [locating, setLocating]   = useState(false)

  useEffect(() => {
    locationService.getAllLocations()
      .then(setLocations)
      .catch(() => setError(t('mapa.loadError')))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let items = locations

    if (viewType !== 'all') items = items.filter((l) => l.markerType === viewType)
    if (filterEstado)       items = items.filter((l) => l.estado === filterEstado)
    if (filterRiesgo)       items = items.filter((l) => l.nivelRiesgo === filterRiesgo)

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      items = items.filter((l) =>
        l.titulo?.toLowerCase().includes(q) ||
        l.subtitulo?.toLowerCase().includes(q) ||
        l.descripcion?.toLowerCase().includes(q) ||
        l.codigo?.toLowerCase().includes(q) ||
        l.denunciaId?.includes(q)
      )
    }

    return items
  }, [locations, viewType, filterEstado, filterRiesgo, searchQuery])

  async function handleMyLocation() {
    setLocating(true)
    try {
      const { lat, lng } = await locationService.getCurrentUserLocation()
      setMapCenter([lat, lng])
      toast.success(t('mapa.locationDetected'))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLocating(false)
    }
  }

  function handleMarkerClick(loc) {
    setSelectedLocation(loc)
  }

  function clearFilters() {
    setFilterEstado('')
    setFilterRiesgo('')
    setSearchQuery('')
    setViewType('all')
  }

  const hasActiveFilters = filterEstado || filterRiesgo || searchQuery || viewType !== 'all'

  if (loading) return (
    <>
      <BackofficeTopbar title={t('mapa.title')} />
      <LoadingSpinner fullPage />
    </>
  )

  if (error) return (
    <>
      <BackofficeTopbar title={t('mapa.title')} />
      <main className="p-8">
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center">
          <p className="text-sm font-semibold text-red-700">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-3 rounded-lg bg-action px-4 py-2 text-sm font-semibold text-white">
            {t('mapa.retry')}
          </button>
        </div>
      </main>
    </>
  )

  return (
    <>
      <BackofficeTopbar title={t('mapa.title')} />

      <main className="flex h-[calc(100vh-65px)] overflow-hidden">

        {/* Sidebar panel */}
        <aside data-tour="backoffice-mapa-filters" className="w-72 shrink-0 flex flex-col border-r border-gray-100 bg-white overflow-y-auto">
          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <input
                type="text"
                aria-label="Buscar marcadores"
                placeholder="Buscar código, ubicación, descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-100 flex flex-col gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {t('mapa.filters')}
              {hasActiveFilters && (
                <button onClick={clearFilters} className="ml-auto text-action hover:underline font-semibold">
                  {t('mapa.clear')}
                </button>
              )}
            </div>

            {/* View type */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1.5">Tipo</p>
              <div className="flex flex-col gap-1">
                {VIEW_TYPES.map((v) => (
                  <button
                    key={v.value}
                    onClick={() => setViewType(v.value)}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${viewType === v.value ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Estado */}
            <div>
              <label htmlFor="filter-estado" className="text-xs font-semibold text-gray-600 mb-1.5 block">Estado</label>
              <select
                id="filter-estado"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary text-gray-700"
              >
                <option value="">Todos los estados</option>
                {ESTADOS_DENUNCIA.map((e) => <option key={e} value={e}>{ESTADO_LABEL[e]}</option>)}
              </select>
            </div>

            {/* Urgencia */}
            <div>
              <label htmlFor="filter-urgencia" className="text-xs font-semibold text-gray-600 mb-1.5 block">Nivel de urgencia</label>
              <select
                id="filter-urgencia"
                value={filterRiesgo}
                onChange={(e) => setFilterRiesgo(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary text-gray-700"
              >
                <option value="">Todos los niveles</option>
                {URGENCIA_NIVELES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Color mode */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                Colorear por
              </p>
              <div className="flex gap-2">
                {COLOR_MODES.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setColorBy(m.value)}
                    className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${colorBy === m.value ? 'bg-primary text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results list */}
          <div className="p-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400">
              {t('mapa.markersVisible', { count: filtered.length })}
            </p>
          </div>

          <div data-tour="backoffice-mapa-list" className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-10 px-4 text-center text-gray-400">
                <p className="text-sm">{t('mapa.noResults')}</p>
                <p className="text-xs mt-1">{t('mapa.adjustFilters')}</p>
              </div>
            ) : (
              filtered.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => {
                    setSelectedLocation(loc)
                    setMapCenter([loc.lat, loc.lng])
                  }}
                  className={`w-full text-left px-4 py-3 transition-colors hover:bg-blue-50/50 ${selectedLocation?.id === loc.id ? 'bg-blue-50 border-l-2 border-primary' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-primary truncate">{loc.titulo}</p>
                      <p className="text-xs text-gray-500 truncate">{loc.subtitulo}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 truncate">{loc.descripcion}</p>
                    </div>
                    <StatusBadge status={loc.estado} className="shrink-0 text-[10px] px-2 py-0.5" />
                  </div>
                </button>
              ))
            )}
          </div>

          {/* My location button */}
          <div className="p-3 border-t border-gray-100">
            <button
              onClick={handleMyLocation}
              disabled={locating}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <Navigation className={`h-3.5 w-3.5 ${locating ? 'animate-spin' : ''}`} />
              {locating ? t('mapa.detecting') : t('mapa.myLocation')}
            </button>
          </div>
        </aside>

        {/* Map area */}
        <div data-tour="backoffice-mapa-canvas" className="flex-1 relative">
          <BioTrackMap
            locations={filtered}
            colorBy={colorBy}
            onMarkerClick={handleMarkerClick}
            center={mapCenter}
            height="100%"
            showLegend
          />

          {/* Selected location detail card */}
          {selectedLocation && (
            <div className="absolute top-4 right-4 z-[1000] w-64 rounded-2xl bg-white shadow-xl p-4 border border-gray-100">
              <button
                onClick={() => setSelectedLocation(null)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xs px-1"
              >
                ✕
              </button>
              <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">
                {selectedLocation.markerType === 'zone' ? t('mapa.zoneLabel') : t('mapa.reportLabel')}
              </p>
              <p className="text-sm font-semibold text-gray-800 mb-0.5">{selectedLocation.titulo}</p>
              <p className="text-xs text-gray-500 mb-2">{selectedLocation.subtitulo}</p>
              <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-2">{selectedLocation.descripcion}</p>
              <div className="flex gap-2 mb-3">
                <StatusBadge status={selectedLocation.estado} />
                {selectedLocation.nivelRiesgo && (
                  <span className="text-xs font-semibold text-gray-500">Urgencia: {selectedLocation.nivelRiesgo}</span>
                )}
              </div>
              <button
                onClick={() => navigate(
                  selectedLocation.markerType === 'zone'
                    ? `/admin/monitoreo/${selectedLocation.denunciaId}`
                    : `/admin/denuncias/${selectedLocation.denunciaId}`
                )}
                className="w-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                {t('mapa.viewFullDetail')}
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
