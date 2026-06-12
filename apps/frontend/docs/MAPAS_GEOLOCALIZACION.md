# MAPAS_GEOLOCALIZACION

## Librerías
- leaflet
- react-leaflet

## Componentes

### BioTrackMap
- Renderiza marcadores y, opcionalmente, ruta.
- Soporta marcador activo/click callback.
- Recibe center/zoom y parámetros de interacción.

### LocationPickerMap
- Selector de punto geográfico para planificación.
- Emite coordenadas seleccionadas por callback.

## Pantallas que usan mapa
- /admin/mapa
- /admin/monitoreo/:id/planificar
- Dashboard con acceso rápido al mapa.

## Modelo y semántica
- Campos típicos: id, denunciaId, lat, lng, provincia, municipio, estado, nivelRiesgo.
- markerType:
  - report
  - zone
- Colores de marcador derivados de src/constants/mapConfig.js.

## Geolocalización
- locationService.getCurrentUserLocation envuelve navigator.geolocation.
- Respuesta exitosa: { lat, lng }.
- Errores con mensajes legibles para UI.

## Restricciones actuales
- Datos de ubicación mock.
- Sin sync backend de edición geográfica.
- Sin estrategia de clustering/tile fallback implementada.
