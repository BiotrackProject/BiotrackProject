# UNIT_TESTS

## Existentes antes de este ciclo
- src/pages/auth/LoginPage.test.jsx
- src/pages/auth/RegisterPage.test.jsx
- src/pages/auth/ForgotPasswordPage.test.jsx
- src/pages/auth/VerifyCodePage.test.jsx
- src/pages/backoffice/BackofficePages.test.jsx
- src/pages/LandingFlow.test.jsx
- src/utils/validation.test.js

## Agregados en este ciclo
- src/services/dashboardService.test.js
- src/services/denunciasService.test.js
- src/services/locationService.test.js
- src/services/usuariosService.test.js
- src/utils/mockStorage.test.js
- src/hooks/useGuidedTour.test.jsx
- src/constants/roles.test.js

## Intención de cobertura
- Lógica de servicios (read/create/update/filter)
- Persistencia local/session
- Geolocalización y parseo GPS
- Efectos del tour y persistencia de visto

## Targets útiles aún pendientes
- src/services/monitoreoService.js
- src/services/accionesService.js
- Integración mapa (interacción con marcadores)
- Detalles backoffice con asserts de transición de estado
- Casos edge adicionales de validación
