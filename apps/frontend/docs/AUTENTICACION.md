# AUTENTICACION

## Rutas
- /login
- /registro
- /recuperar-cuenta
- /recuperar-cuenta/verificar

## Pantallas
- LoginPage
- RegisterPage
- ForgotPasswordPage
- VerifyCodePage

## Comportamiento actual
- Validación de campos y feedback de errores.
- Navegación entre pasos implementada.
- Simulación asíncrona con placeholders (sin API real).

## Integración API pendiente
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/forgot-password
- POST /api/auth/verify-code

## Seguridad
- No hay ciclo real de token/sesión backend.
- No hay estrategia de refresh token implementada.

## Estado
- Flujo visual y UX implementado.
- Contrato backend pendiente.
