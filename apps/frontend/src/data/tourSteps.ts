/**
 * Tour step definitions for all BIOTRACK areas.
 * Each step uses a [data-tour="..."] selector so the tour is
 * decoupled from fragile CSS class names.
 *
 * Step shape:
 *   element:  '[data-tour="xyz"]'  — CSS selector (or null for floating step)
 *   title:    'Título del paso'    — bold header inside the tooltip
 *   intro:    'Explicación...'     — body text
 *   position: 'bottom'|'top'|'right'|'left'  (optional, Intro.js auto-detects)
 */

// ── Landing page ──────────────────────────────────────────────────────────────
export const LANDING_TOUR_STEPS = [
  {
    element:  '[data-tour="landing-navbar"]',
    title:    'Bienvenido a BIOTRACK',
    intro:    'Este es el menú de navegación principal. Desde aquí puedes registrar una denuncia, consultar reportes o acceder al sistema institucional.',
    position: 'bottom',
  },
  {
    element:  '[data-tour="landing-hero"]',
    title:    'Portal Ambiental',
    intro:    'BIOTRACK es el sistema oficial de monitoreo y denuncia de extracción ilegal de arena en la República Dominicana. Tu participación protege el medioambiente.',
    position: 'bottom',
  },
  {
    element:  '[data-tour="landing-purpose"]',
    title:    'Nuestra Misión',
    intro:    'Conoce los objetivos de BIOTRACK: misión, visión y responsabilidad social con el medioambiente dominicano.',
    position: 'top',
  },
  {
    element:  '[data-tour="landing-action-cards"]',
    title:    '¿Qué puedes hacer?',
    intro:    'Desde estas tarjetas puedes <strong>registrar una nueva denuncia</strong> sobre actividad sospechosa o <strong>consultar el estado</strong> de reportes existentes.',
    position: 'top',
  },
  {
    element:  '[data-tour="landing-stats"]',
    title:    'Estadísticas del sistema',
    intro:    'Datos actualizados sobre el impacto de la extracción ilegal de arena: zonas afectadas, volúmenes detectados y comunidades impactadas.',
    position: 'top',
  },
  {
    element:  '[data-tour="landing-news"]',
    title:    'Noticias ambientales',
    intro:    'Mantente informado con las últimas noticias y alertas sobre el medioambiente en el país.',
    position: 'top',
  },
  {
    element:  '[data-tour="landing-help"]',
    title:    '¿Necesitas ayuda?',
    intro:    'Si tienes dudas sobre cómo realizar una denuncia o usar el sistema, contáctanos directamente. Estamos para ayudarte.',
    position: 'top',
  },
  {
    element:  '[data-tour="landing-tour-btn"]',
    title:    'Repetir este recorrido',
    intro:    'Puedes volver a ver este recorrido en cualquier momento haciendo clic en el botón de ayuda <strong>?</strong>.',
    position: 'left',
  },
]

// ── Citizen-facing pages ──────────────────────────────────────────────────────
export const CITIZEN_TOUR_STEPS = [
  {
    element:  '[data-tour="citizen-navbar"]',
    title:    'Navegación ciudadana',
    intro:    'Usa la barra de navegación para acceder a las secciones disponibles: registrar denuncias, consultar reportes y más.',
    position: 'bottom',
  },
  {
    element:  '[data-tour="citizen-report-intro"]',
    title:    'Registrar una denuncia',
    intro:    'Desde esta sección puedes reportar actividades ilegales de extracción de arena. Tu identidad puede mantenerse anónima si lo prefieres.',
    position: 'bottom',
  },
  {
    element:  '[data-tour="citizen-report-form"]',
    title:    'Formulario de denuncia',
    intro:    'Completa los datos del incidente: ubicación, fecha, tipo de extracción y evidencias. Cuanta más información brindes, más efectiva será la intervención.',
    position: 'left',
  },
  {
    element:  '[data-tour="citizen-report-sidebar"]',
    title:    'Guía de campos',
    intro:    'Esta guía lateral te indica qué información es importante incluir en cada sección de la denuncia.',
    position: 'left',
  },
  {
    element:  '[data-tour="citizen-tour-btn"]',
    title:    'Listo para comenzar',
    intro:    'Puedes ver este recorrido de nuevo cuando lo necesites. Si tienes dudas, haz clic en el botón <strong>?</strong> en cualquier momento.',
    position: 'left',
  },
]

// Steps for the search/consult page
export const CITIZEN_SEARCH_TOUR_STEPS = [
  {
    element:  '[data-tour="citizen-navbar"]',
    title:    'Consulta de reportes',
    intro:    'Desde este portal ciudadano puedes buscar y consultar el estado de reportes ambientales registrados.',
    position: 'bottom',
  },
  {
    element:  '[data-tour="citizen-search-area"]',
    title:    'Buscar reportes',
    intro:    'Ingresa el código de seguimiento que recibiste al registrar tu denuncia para consultar su estado y progreso.',
    position: 'bottom',
  },
  {
    element:  '[data-tour="citizen-tour-btn"]',
    title:    '¿Tienes dudas?',
    intro:    'Haz clic en el botón <strong>?</strong> en cualquier momento para ver este recorrido de nuevo.',
    position: 'left',
  },
]

function baseBackofficeSteps(title, intro) {
  return [
    {
      element: null,
      title,
      intro,
    },
    {
      element: '[data-tour="backoffice-sidebar"]',
      title: 'Navegación principal',
      intro: 'Desde aquí puedes saltar entre las secciones administrativas del sistema.',
      position: 'right',
    },
    {
      element: '[data-tour="backoffice-topbar-actions"]',
      title: 'Acciones rápidas',
      intro: 'Este bloque agrupa los accesos directos más importantes de la pantalla actual.',
      position: 'bottom',
    },
    {
      element: '[data-tour="backoffice-help-btn"]',
      title: 'Repetir recorrido',
      intro: 'Puedes volver a abrir este tour cuando quieras usando el botón de ayuda.',
      position: 'left',
    },
  ]
}

export const BACKOFFICE_TOUR_SECTIONS = {
  dashboard: [
    ...baseBackofficeSteps(
      'Dashboard BIOTRACK',
      'Este resumen te orienta sobre el estado operativo general antes de entrar a cada módulo.'
    ),
    {
      element: '[data-tour="backoffice-dashboard-stats"]',
      title: 'Métricas principales',
      intro: 'Estas tarjetas concentran los indicadores más importantes para priorizar el trabajo del día.',
      position: 'bottom',
    },
    {
      element: '[data-tour="backoffice-map-link"]',
      title: 'Acceso al mapa',
      intro: 'Usa este acceso para saltar al mapa geográfico con todas las denuncias y zonas monitoreadas.',
      position: 'top',
    },
    {
      element: '[data-tour="backoffice-dashboard-charts"]',
      title: 'Tendencias y visualizaciones',
      intro: 'Los gráficos resumen patrones de impacto, frecuencia y volumen para detectar focos críticos.',
      position: 'top',
    },
  ],
  denuncias: [
    ...baseBackofficeSteps(
      'Gestión de denuncias',
      'Aquí revisas, filtras y exportas los reportes recibidos antes de abrir cada expediente.'
    ),
    {
      element: '[data-tour="backoffice-denuncias-toolbar"]',
      title: 'Búsqueda y acciones',
      intro: 'Usa la barra de búsqueda y los botones de acción para ubicar o crear denuncias rápidamente.',
      position: 'bottom',
    },
    {
      element: '[data-tour="backoffice-denuncias-list"]',
      title: 'Listado de denuncias',
      intro: 'La tabla te permite revisar el estado, la ubicación y el detalle de cada denuncia.',
      position: 'top',
    },
    {
      element: '[data-tour="backoffice-denuncias-pagination"]',
      title: 'Paginación',
      intro: 'Cambia la página o el tamaño del listado cuando necesites revisar más registros.',
      position: 'top',
    },
  ],
  'denuncias-nueva': [
    ...baseBackofficeSteps(
      'Nueva denuncia administrativa',
      'Este formulario registra denuncias manuales para alimentar el flujo de monitoreo y seguimiento.'
    ),
    {
      element: '[data-tour="backoffice-denuncia-form-personal"]',
      title: 'Datos del denunciante',
      intro: 'Primero identifica si la persona desea permanecer anónima y completa la información básica.',
      position: 'top',
    },
    {
      element: '[data-tour="backoffice-denuncia-form-location"]',
      title: 'Ubicación del incidente',
      intro: 'Después ubica con precisión el punto del incidente y la zona afectada.',
      position: 'top',
    },
    {
      element: '[data-tour="backoffice-denuncia-form-evidence"]',
      title: 'Evidencias adjuntas',
      intro: 'Carga archivos, agrega soporte visual y confirma el consentimiento antes de crear la denuncia.',
      position: 'top',
    },
  ],
  'denuncias-detalle': [
    ...baseBackofficeSteps(
      'Detalle de denuncia',
      'En esta vista revisas la información completa del caso y cambias su estado si hace falta.'
    ),
    {
      element: '[data-tour="backoffice-denuncia-status"]',
      title: 'Estado del caso',
      intro: 'Cambia el estado de la denuncia cuando avance en revisión, monitoreo o corrección.',
      position: 'bottom',
    },
    {
      element: '[data-tour="backoffice-denuncia-summary"]',
      title: 'Resumen del expediente',
      intro: 'Aquí ves la identificación del caso y el estado actual de un vistazo.',
      position: 'bottom',
    },
    {
      element: '[data-tour="backoffice-denuncia-details"]',
      title: 'Datos completos',
      intro: 'Estas tarjetas concentran la información del denunciante, la ubicación y las evidencias.',
      position: 'top',
    },
  ],
  monitoreo: [
    ...baseBackofficeSteps(
      'Gestión de monitoreo',
      'Desde aquí filtras zonas en seguimiento y abres el detalle operativo de cada una.'
    ),
    {
      element: '[data-tour="backoffice-monitoreo-toolbar"]',
      title: 'Filtro de monitoreo',
      intro: 'Busca por provincia o ajusta el estado para localizar las zonas activas.',
      position: 'bottom',
    },
    {
      element: '[data-tour="backoffice-monitoreo-list"]',
      title: 'Listado de zonas',
      intro: 'Cada fila muestra el estado y el acceso al detalle de monitoreo.',
      position: 'top',
    },
    {
      element: '[data-tour="backoffice-monitoreo-pagination"]',
      title: 'Paginación',
      intro: 'Aquí controlas cuántos registros quieres revisar por pantalla.',
      position: 'top',
    },
  ],
  'monitoreo-detalle': [
    ...baseBackofficeSteps(
      'Detalle de monitoreo',
      'Esta vista reúne el seguimiento del caso, la ruta y los planes asociados en un solo lugar.'
    ),
    {
      element: '[data-tour="backoffice-monitoreo-status"]',
      title: 'Estado del monitoreo',
      intro: 'Usa el selector para mover la denuncia entre revisión, monitoreo o corrección.',
      position: 'bottom',
    },
    {
      element: '[data-tour="backoffice-monitoreo-map"]',
      title: 'Mapa de ruta',
      intro: 'Este mapa ubica el punto de monitoreo y te ayuda a definir la cobertura del recorrido.',
      position: 'top',
    },
    {
      element: '[data-tour="backoffice-monitoreo-plans"]',
      title: 'Planes de monitoreo',
      intro: 'Aquí revisas, filtras y administras los planes creados para la zona.',
      position: 'top',
    },
  ],
  'monitoreo-planificar': [
    ...baseBackofficeSteps(
      'Planificar monitoreo',
      'Completa este formulario para crear una ruta de seguimiento con responsables y frecuencia.'
    ),
    {
      element: '[data-tour="backoffice-plan-form"]',
      title: 'Configuración del plan',
      intro: 'Completa el nombre, calendario y responsables antes de guardar.',
      position: 'top',
    },
    {
      element: '[data-tour="backoffice-plan-map"]',
      title: 'Definir ruta',
      intro: 'Usa el mapa para marcar el punto de partida del recorrido de monitoreo.',
      position: 'left',
    },
  ],
  acciones: [
    ...baseBackofficeSteps(
      'Acciones correctivas',
      'Consulta el avance de las acciones y abre el detalle de cada corrección asignada.'
    ),
    {
      element: '[data-tour="backoffice-acciones-toolbar"]',
      title: 'Búsqueda y exportación',
      intro: 'Filtra los casos, cambia el estado desde la lista y exporta la información cuando la necesites.',
      position: 'bottom',
    },
    {
      element: '[data-tour="backoffice-acciones-list"]',
      title: 'Listado de acciones',
      intro: 'Revisa la provincia, la fecha y el estado de cada acción correctiva.',
      position: 'top',
    },
    {
      element: '[data-tour="backoffice-acciones-pagination"]',
      title: 'Paginación',
      intro: 'Ajusta el tamaño de página para navegar entre más o menos registros.',
      position: 'top',
    },
  ],
  'acciones-detalle': [
    ...baseBackofficeSteps(
      'Detalle de acción correctiva',
      'Desde este expediente ves la relación con la denuncia original y el avance de la corrección.'
    ),
    {
      element: '[data-tour="backoffice-accion-status"]',
      title: 'Estado de la acción',
      intro: 'Modifica el estado cuando la acción avance o se complete.',
      position: 'bottom',
    },
    {
      element: '[data-tour="backoffice-accion-summary"]',
      title: 'Resumen del caso',
      intro: 'Este bloque resume el identificador, la denuncia relacionada y el estado actual.',
      position: 'bottom',
    },
    {
      element: '[data-tour="backoffice-accion-details"]',
      title: 'Información completa',
      intro: 'Aquí encuentras la descripción, el responsable y el seguimiento de la acción.',
      position: 'top',
    },
  ],
  usuarios: [
    ...baseBackofficeSteps(
      'Gestión de usuarios',
      'Administra accesos, roles y estados de los miembros del equipo desde esta vista.'
    ),
    {
      element: '[data-tour="backoffice-usuarios-toolbar"]',
      title: 'Crear y buscar usuarios',
      intro: 'Usa la búsqueda rápida o crea nuevos usuarios desde este bloque.',
      position: 'bottom',
    },
    {
      element: '[data-tour="backoffice-usuarios-list"]',
      title: 'Listado de usuarios',
      intro: 'La tabla centraliza el rol, estado y último acceso de cada cuenta.',
      position: 'top',
    },
  ],
  sistema: [
    ...baseBackofficeSteps(
      'Configuración del sistema',
      'Aquí ajustas parámetros globales, notificaciones, seguridad y respaldos.'
    ),
    {
      element: '[data-tour="backoffice-sistema-general"]',
      title: 'Ajustes generales',
      intro: 'Define el nombre del sistema, la zona horaria y el tamaño máximo de evidencias.',
      position: 'top',
    },
    {
      element: '[data-tour="backoffice-sistema-notificaciones"]',
      title: 'Notificaciones',
      intro: 'Controla qué alertas se envían por correo o SMS.',
      position: 'top',
    },
    {
      element: '[data-tour="backoffice-sistema-seguridad"]',
      title: 'Seguridad',
      intro: 'Activa 2FA, restricción de IP y tiempos de sesión según la política de la institución.',
      position: 'top',
    },
    {
      element: '[data-tour="backoffice-sistema-datos"]',
      title: 'Datos y respaldo',
      intro: 'Exporta registros o revisa el estado del respaldo automático.',
      position: 'top',
    },
  ],
  perfil: [
    ...baseBackofficeSteps(
      'Mi perfil',
      'Aquí revisas tus datos y cambias la información personal que ve el resto del equipo.'
    ),
    {
      element: '[data-tour="backoffice-perfil-actions"]',
      title: 'Editar perfil',
      intro: 'Activa el modo edición para actualizar tus datos o guardar los cambios.',
      position: 'bottom',
    },
    {
      element: '[data-tour="backoffice-perfil-info"]',
      title: 'Información personal',
      intro: 'Estos campos muestran tu identidad y los datos de contacto.',
      position: 'top',
    },
    {
      element: '[data-tour="backoffice-perfil-access"]',
      title: 'Rol y permisos',
      intro: 'Esta sección resume tu rol y el departamento asignado.',
      position: 'top',
    },
  ],
  notificaciones: [
    ...baseBackofficeSteps(
      'Centro de notificaciones',
      'Revisa los eventos recientes del sistema y navega directamente al caso relacionado.'
    ),
    {
      element: '[data-tour="backoffice-notificaciones-actions"]',
      title: 'Marcado en lote',
      intro: 'Usa este botón para limpiar tu bandeja de lectura de una sola vez.',
      position: 'bottom',
    },
    {
      element: '[data-tour="backoffice-notificaciones-list"]',
      title: 'Lista de eventos',
      intro: 'Cada fila resume una alerta y te lleva al caso conectado si aplica.',
      position: 'top',
    },
  ],
  mapa: [
    ...baseBackofficeSteps(
      'Mapa de denuncias',
      'Explora la distribución geográfica de denuncias y zonas monitoreadas con filtros interactivos.'
    ),
    {
      element: '[data-tour="backoffice-mapa-filters"]',
      title: 'Filtros del mapa',
      intro: 'Filtra por tipo, estado, riesgo o búsqueda geográfica antes de mover el mapa.',
      position: 'right',
    },
    {
      element: '[data-tour="backoffice-mapa-list"]',
      title: 'Resultados visibles',
      intro: 'Este panel lista los marcadores que coinciden con los filtros actuales.',
      position: 'right',
    },
    {
      element: '[data-tour="backoffice-mapa-canvas"]',
      title: 'Mapa interactivo',
      intro: 'Aquí se muestran las ubicaciones georreferenciadas y el detalle emergente de cada punto.',
      position: 'left',
    },
  ],
}

export function getBackofficeTourSteps(section) {
  return BACKOFFICE_TOUR_SECTIONS[section] ?? baseBackofficeSteps(
    'Panel de administración BIOTRACK',
    'Bienvenido al sistema de gestión institucional. Este recorrido te mostrará las funciones principales del backoffice.'
  )
}
