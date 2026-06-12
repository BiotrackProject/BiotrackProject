# MOCKS_Y_SERVICIOS

## Fuentes de datos mock
- src/data/mockDenuncias.js
- src/data/mockMonitoreos.js
- src/data/mockAcciones.js
- src/data/mockUsuarios.js
- src/data/mockLocations.js
- src/data/publicReports.js

## Utilidad de persistencia
- mockStorage (src/utils/mockStorage.js)
- Prefijo de claves: biotrack_
- Almacenamiento: sessionStorage
- API:
  - get
  - set
  - getOrInit
  - remove
  - clearAll (incluye recarga)

## Servicios

### denunciasService
- Lista, detalle, creación, actualización de estado.
- Key: denuncias

### dashboardService
- KPIs derivados de denuncias/monitoreos/acciones.
- Keys: denuncias, monitoreo_denuncias, acciones, usuarios

### monitoreoService
- Lista/detalle de monitoreo, planes, actualización de estado.
- Keys: monitoreo_denuncias, monitoreo_planes

### accionesService
- Lista/detalle de acciones, cambio de estado, resumen.
- Key: acciones

### usuariosService
- Lista, alta, cambio de rol/estado, perfil.
- Keys: usuarios, perfil

### locationService
- Ubicaciones de reportes/zonas, filtros, parseGPS, geolocalización.
- Source base: mockLocations

## Limitaciones del enfoque mock
- Sin red/reintentos/tokens.
- Sin manejo de conflictos concurrentes.
- IDs generados en frontend.
- Persistencia de sesión (se pierde según lifecycle de storage).
