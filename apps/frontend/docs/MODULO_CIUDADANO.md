# MODULO_CIUDADANO

## Alcance
Flujos públicos para denunciar y dar seguimiento a incidentes ambientales.

## Rutas
- /
- /reporte/nuevo
- /reportes
- /reportes/:id

## Pantallas principales
- LandingPage
- ReportPage
- SearchReportsPage
- ReportDetailPage

## Componentes clave
- ReportHero, ReportForm, ReportSidebar
- ReportSearch
- Secciones landing (HeroSection, ActionCardsSection, StatsSection, etc.)

## Comportamiento actual
- Formulario con validaciones y evidencia.
- Borrador persistido en localStorage.
- Búsqueda pública sobre dataset mock.
- Detalle por ID vía parámetro de ruta.

## Cobertura de tours
- Tours dedicados en páginas de reporte y consulta.

## Estado
- UI funcional.
- Integración de datos real pendiente.
