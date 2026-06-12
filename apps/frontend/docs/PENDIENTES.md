# PENDIENTES

Listado basado en TODOs/placeholders visibles en código.

## Integraciones backend pendientes
- Auth API:
  - POST /api/auth/login
  - POST /api/auth/register
  - POST /api/auth/forgot-password
  - POST /api/auth/verify-code
- Reportes ciudadanos:
  - POST /api/reports
  - POST /api/reports/draft (si se sincroniza borrador)
- Cambio de estado en detalle de denuncia: aun con timeout provisional.
- Guardado de configuración de sistema: TODO (PUT /api/sistema/config).

## Pantallas/comportamientos provisionales
- Detalle de monitoreo:
  - Modal "Análisis de Monitoreo" es ilustrativo
  - Modal "Elaborar Reporte" no genera artefacto backend real
- Notificaciones usa lista local hardcoded.

## Áreas parciales
- Dashboard mezcla KPIs calculados con series gráficas mock.
- Existen permisos por rol en constantes, pero no enforcement real en rutas/componentes.
- En algunas pantallas se mezcla import de mock directo con uso de servicios.

## Deuda técnica
- Cobertura de pruebas aún parcial en varios componentes/páginas.
- Mejoras de accesibilidad pendientes en algunos formularios.
- Diferencias menores de nomenclatura de estados en datos mock.
- Tours Intro.js deben revisarse tras cambios de estructura UI.
