# IMPLEMENTACIONES

Este documento lista funcionalidades implementadas por módulo y su estado actual.

## Módulo Ciudadano

### Landing y navegación inicial
- Módulo: Ciudadano
- Qué se implementó: Landing con hero, propósito, tarjetas de acción, estadísticas, noticias, ayuda, navbar y footer.
- Por qué: ofrecer punto de entrada y contexto para usuarios públicos.
- Beneficio: acceso rápido a reportar y consultar.
- Pantallas principales: /, LandingPage y secciones landing.
- Estado: Completado

### Flujo de reporte ciudadano
- Módulo: Ciudadano
- Qué se implementó: ReportPage con formulario estructurado, validaciones, carga de evidencias, guardado de borrador en localStorage y estado de éxito con ID de seguimiento.
- Por qué: permitir reportar actividad sospechosa de extracción.
- Beneficio: denuncia guiada con datos mínimos de calidad.
- Pantallas principales: /reporte/nuevo, ReportForm, ReportSidebar.
- Estado: Parcial (envío real a backend pendiente)

### Flujo de consulta de reportes
- Módulo: Ciudadano
- Qué se implementó: SearchReportsPage y ReportSearch con búsqueda y navegación a detalle.
- Por qué: permitir seguimiento por parte de ciudadanía.
- Beneficio: trazabilidad de casos por ID/ubicación.
- Pantallas principales: /reportes, /reportes/:id.
- Estado: Parcial (dataset público mock)

### Recorridos guiados ciudadano
- Módulo: Ciudadano
- Qué se implementó: tours Intro.js automáticos y manuales en reporte y búsqueda.
- Por qué: mejorar onboarding y adopción.
- Beneficio: guía contextual para primer uso.
- Estado: Completado

## Módulo de Autenticación

### Login, registro, recuperación y verificación
- Módulo: Autenticación
- Qué se implementó: 4 pantallas con validación UI y navegación entre pasos.
- Por qué: cubrir acceso y recuperación de cuenta.
- Beneficio: flujo consistente con feedback de validación.
- Pantallas: /login, /registro, /recuperar-cuenta, /recuperar-cuenta/verificar.
- Estado: Parcial (integración API pendiente)

## Módulo Backoffice

### Shell administrativo y navegación
- Módulo: Backoffice
- Qué se implementó: BackofficeLayout, sidebar, topbar, menú móvil, toast container, botón de ayuda contextual.
- Por qué: base común para operación administrativa.
- Beneficio: experiencia consistente y responsive.
- Estado: Completado

### Panel de control (Dashboard)
- Módulo: Backoffice
- Qué se implementó: KPIs desde dashboardService, tarjetas gráficas (Recharts), acceso rápido al mapa.
- Estado: Parcial (series gráficas mock)

### Denuncias
- Módulo: Backoffice
- Qué se implementó: lista con búsqueda/filtros/paginación, export CSV, detalle con cambio de estado y export.
- Estado: Parcial (persistencia de estado en detalle con implementacion provisional)

### Monitoreo
- Módulo: Backoffice
- Qué se implementó: lista, detalle, planificación, CRUD de planes vía servicio, modal de mapa de ruta.
- Estado: Parcial (algunos modales son provisionales)

### Acciones correctivas
- Módulo: Backoffice
- Qué se implementó: lista, filtros, cambio de estado, detalle y export.
- Estado: Parcial (mock)

### Mapa y geolocalización
- Módulo: Backoffice
- Qué se implementó: mapa interactivo con filtros, leyenda, selección de marcador y geolocalización.
- Estado: Parcial (datos mock)

### Usuarios y configuración del sistema
- Módulo: Backoffice Config
- Qué se implementó: UI de usuarios (alta, cambio de rol/estado) y panel de sistema.
- Estado: Parcial (sin persistencia real backend)

### Perfil y notificaciones
- Módulo: Backoffice
- Qué se implementó: vista/edición de perfil y centro de notificaciones.
- Estado: Parcial (notificaciones estáticas)

## Servicios y utilidades compartidas

### Capa de servicios mock
- Qué se implementó: servicios por dominio con mockStorage en sessionStorage y bus de toast local.
- Estado: Completado (como arquitectura mock)
