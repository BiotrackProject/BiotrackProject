# Documentación BIOTRACK

Esta carpeta contiene documentación basada en la implementación actual del frontend de BIOTRACK.

## Resumen del Proyecto
BIOTRACK es un frontend en React + Vite para:
- Denuncia ciudadana y consulta de reportes (módulo público)
- Gestión administrativa (módulo backoffice)
- Recorridos guiados con Intro.js
- Visualización geográfica con Leaflet
- Servicios y datos mock mientras la API backend está pendiente

## Módulos Principales
- Módulo ciudadano: landing, crear reporte, consultar reportes, detalle de reporte
- Módulo de autenticación: login, solicitud de registro, recuperación, verificación de código
- Módulo backoffice: dashboard, denuncias, monitoreo, acciones correctivas, mapa, usuarios, sistema, perfil, notificaciones
- Base compartida: componentes UI, servicios mock, constantes de estado/roles y utilidades

## Estructura General Actual
- src/pages: pantallas de ruta
- src/components: componentes reutilizables
- src/routes: mapa de rutas y carga lazy
- src/services: capa de servicios mock (sessionStorage)
- src/data: datasets mock y pasos de tours
- src/constants: roles, estados y configuración de mapa
- src/hooks: hooks personalizados
- src/utils: validación, toast bus, mock storage
- src/test: setup de pruebas

## Tecnologías
- React 19
- React Router DOM 7
- Vite 8
- Tailwind CSS 4
- Intro.js
- Leaflet + react-leaflet
- Recharts
- Vitest + React Testing Library + jsdom

## Cómo Ejecutar
1. Instalar dependencias:
   - npm install
2. Iniciar desarrollo:
   - npm run dev
3. Compilar producción:
   - npm run build
4. Ejecutar pruebas:
   - npm run test
5. Ejecutar pruebas en watch:
   - npm run test:watch

## Nota de Alcance
- Esta documentación describe únicamente lo que existe en código.
- Secciones marcadas como Pendiente, Parcial o Placeholder corresponden a TODOs y features aún no integradas con backend.
