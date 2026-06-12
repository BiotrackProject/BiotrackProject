# PANEL DE CONTROL (DASHBOARD)

## Ruta
- /admin/dashboard

## Objetivo
Ofrecer vista operativa consolidada para priorizar la gestión diaria.

## Fuente de datos
- dashboardService.getStats
- KPIs derivados de denuncias, monitoreos y acciones (mock)

## Bloques
- KPIs principales
- Tarjetas de gráficos (Recharts)
- Acceso rápido al mapa y módulos operativos

## Limitaciones actuales
- Series gráficas mock/no analíticas reales.
- Warnings de Recharts en tests pueden aparecer sin romper suite.

## Estado
- Funcional para operación mock.
- Integración analítica real pendiente.
