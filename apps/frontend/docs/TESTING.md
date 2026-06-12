# PRUEBAS (TESTING)

## Stack
- Vitest
- React Testing Library
- jsdom
- Setup: src/test/setup.js

## Enfoque actual
- Auth flows
- Landing/ciudadano
- Smoke tests de backoffice
- Utils de validación
- Unit tests de alta prioridad en servicios/storage/tour hook

## Tipos presentes
- Render UI
- Interacción (formularios, navegación, filtros)
- Unit tests de servicios con timers/storage mock
- Unit tests de utilidades
- Hook tests con Intro.js mockeado

## Comandos
- npm run test
- npm run test:watch
- npm run test -- src/pages

## Riesgos y brechas de calidad
- Cobertura incompleta en múltiples componentes/páginas.
- Sin suite E2E (Playwright/Cypress) en repo.
- Cobertura de accesibilidad limitada.
- Sin contract tests contra backend real.

## Próximos pasos recomendados
1. Tests de componentes UI reutilizables con foco en accesibilidad.
2. Tests de permisos/rutas cuando se implemente enforcement.
3. Contract tests al integrar APIs reales.
4. E2E de flujos críticos ciudadano + backoffice.
