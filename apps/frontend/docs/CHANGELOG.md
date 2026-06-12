# CHANGELOG

Resumen de hitos principales actualmente presentes en el repositorio.

## Base actual
- App React + Vite con rutas lazy para módulos ciudadano, auth y backoffice.
- UI en Tailwind con componentes compartidos y layouts responsive.

## Hitos funcionales

### 1. Expansión de rutas
- Rutas públicas, auth y backoffice con estructura anidada.

### 2. Sistema de tours (Intro.js)
- Hook useGuidedTour.
- Definiciones centralizadas en tourSteps.
- Tours de backoffice por sección/ruta.
- Botón flotante de ayuda para relanzar.
- Persistencia de "visto" en localStorage.

### 3. Crecimiento del backoffice
- Dashboard con KPIs + gráficos + acceso a mapa.
- Denuncias: listado, detalle y registro.
- Monitoreo: listado, detalle y planificación.
- Acciones correctivas: listado, detalle y estado.
- Perfil, notificaciones, usuarios y sistema.

### 4. Mapa y geolocalización
- Componentes reutilizables BioTrackMap y LocationPickerMap.
- Constantes geográficas y colores por estado/riesgo.
- locationService con wrapper de geolocalización del navegador.

### 5. Arquitectura mock
- Servicios mock en sessionStorage: dashboard, denuncias, monitoreo, acciones, usuarios, location.
- mockStorage y helper de reseteo.
- Bus local de toast y contenedor visual.

### 6. Mejoras UX/UI
- Transiciones más específicas y consistentes.
- Mejor feedback de foco/activo en componentes clave.
- Ajustes responsive en configuración backoffice.

### 7. Expansión de pruebas
- Pruebas auth existentes mantenidas.
- Suite smoke de páginas backoffice.
- Suite de flujo landing/ciudadano.
- Nuevas unit tests en servicios/utils/hook.
