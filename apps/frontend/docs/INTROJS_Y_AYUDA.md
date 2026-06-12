# INTROJS_Y_AYUDA

## Piezas de implementación
- Hook: src/hooks/useGuidedTour.js
- Definiciones: src/data/tourSteps.js
- Trigger: src/components/tour/HelpTourButton.jsx
- Orquestación backoffice: BackofficeLayout

## Comportamiento
- Tour manual y auto-start.
- Persistencia de visto en localStorage.
- Clave de persistencia por área/ruta (backoffice por sección).
- Resolución de steps contra DOM real vía data-tour.

## Personalización backoffice
- Mapeo pathname -> sección de tour.
- Step sets específicos por pantalla.
- Auto-tour desactivado en mapa para evitar conflicto UX.

## Cobertura ciudadano
- Pasos dedicados para reporte y consulta.

## Helpers dev
- __resetTours y __resetTour para reiniciar flags.

## Restricciones
- Dependencia fuerte de selectores data-tour estables.
- Cambios de estructura visual requieren ajustar pasos.
