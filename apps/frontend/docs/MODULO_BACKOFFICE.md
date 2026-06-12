# MODULO_BACKOFFICE

## Alcance
Módulo administrativo para denuncias, monitoreo, acciones, usuarios, configuración y operación diaria.

## Grupo de rutas
- Base: /admin
- Layout: BackofficeLayout

## Pantallas
- dashboard
- denuncias, denuncias/:id, denuncias/nueva
- monitoreo, monitoreo/:id, monitoreo/:id/planificar
- acciones, acciones/:id
- mapa
- notificaciones
- perfil
- configuracion/usuarios
- configuracion/sistema

## Componentes compartidos
- BackofficeLayout, Sidebar, BackofficeTopbar
- HelpTourButton
- ToastContainer

## Estado funcional
- Navegación y shells implementados.
- Listas, detalles y cambios de estado en módulos clave.
- Operación mayormente sobre servicios mock.

## Áreas parciales
- Permisos no aplicados de forma estricta.
- Algunas acciones de detalle siguen en estado provisional.
- Notificaciones estáticas.

## Estado
- Operable para flujos frontend.
- Integración backend y enforcement de permisos pendiente.
