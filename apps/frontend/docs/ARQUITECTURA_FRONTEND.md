# ARQUITECTURA_FRONTEND

## Arquitectura general
- SPA con React + React Router.
- Módulos orientados a rutas con librería de componentes compartidos.
- Capa mock-first para trabajar frontend sin backend.
- Tailwind CSS para sistema visual y responsive.

## Arquitectura de rutas
- Públicas:
  - /
  - /reporte/nuevo
  - /reportes
  - /reportes/:id
- Auth:
  - /login
  - /registro
  - /recuperar-cuenta
  - /recuperar-cuenta/verificar
- Backoffice: /admin/* con layout anidado.

## Capas
- pages: composición por pantalla/ruta
- components: piezas reutilizables
- services: operaciones de dominio y persistencia mockStorage
- data: datasets mock y catálogo de pasos de tour
- constants: estados, roles, configuración mapa
- hooks: comportamiento reusable
- utils: validación, storage, toast

## Estado y persistencia
- Estado local con useState/useMemo/useEffect.
- sessionStorage (mockStorage) para datos operativos.
- localStorage para tours vistos y borradores.
- No hay store global tipo Redux/Zustand.

## Async y errores
- Servicios simulan asincronía con Promises + delay.
- Pantallas usan loading/fallbacks.
- Estrategia global de error boundary no está completa.

## Brechas arquitectónicas
- Permisos por rol no aplicados en rutas/componentes.
- Cliente API real aún pendiente.
- Coexiste acceso directo a mocks y acceso vía servicios.
