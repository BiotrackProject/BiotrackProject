# API_FUTURA

Este documento resume contratos API futuros inferidos desde TODOs/placeholders del frontend.

## Autenticación
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/forgot-password
- POST /api/auth/verify-code

## Reportes ciudadanos
- POST /api/reports
- POST /api/reports/draft (opcional si se sincroniza borrador)
- GET /api/reports/public
- GET /api/reports/:id

## Backoffice: denuncias y operación
- GET /api/admin/denuncias
- GET /api/admin/denuncias/:id
- PATCH /api/admin/denuncias/:id/status
- GET /api/admin/monitoreo
- GET /api/admin/monitoreo/:id
- PATCH /api/admin/monitoreo/:id/status
- GET /api/admin/acciones
- GET /api/admin/acciones/:id
- PATCH /api/admin/acciones/:id/status

## Usuarios y configuración
- GET /api/admin/usuarios
- POST /api/admin/usuarios
- PATCH /api/admin/usuarios/:id/rol
- PATCH /api/admin/usuarios/:id/estado
- GET /api/admin/perfil
- PATCH /api/admin/perfil
- PUT /api/sistema/config

## Dashboard y mapas
- GET /api/admin/dashboard/kpis
- GET /api/admin/dashboard/charts
- GET /api/admin/locations

## Nota
- Estos endpoints no están activos en el frontend actual.
- Son una guía de transición desde la arquitectura mock hacia backend real.
