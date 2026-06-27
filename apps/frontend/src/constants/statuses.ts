// ── Denuncia ──────────────────────────────────────────────────────────────────
export const DENUNCIA_ESTADOS = [
  'Nueva',
  'En revisión',
  'Monitorear',
  'En Monitoreo',
  'En Corrección',
  'Declinada',
]

export const DENUNCIA_STATUS_STYLES = {
  'Nueva':          'bg-emerald-50 text-emerald-600 border border-emerald-200',
  'En revisión':    'bg-action/10 text-action border border-action/20',
  'Monitorear':     'bg-primary/10 text-primary border border-primary/20',
  'En Monitoreo':   'bg-secondary/40 text-primary border border-secondary/80',
  'En Corrección':  'bg-primary/10 text-primary border border-primary/25',
  'Declinada':      'bg-gray-100 text-gray-500 border border-gray-200',
}

// ── Monitoreo ─────────────────────────────────────────────────────────────────
export const MONITOREO_ESTADOS = ['Monitorear', 'En Monitoreo', 'En Corrección', 'Declinada']

// ── Acciones Correctivas ──────────────────────────────────────────────────────
export const ACCION_ESTADOS = ['Pendiente', 'En Corrección', 'Corregido']

export const ACCION_STATUS_STYLES = {
  'Pendiente':     'bg-action/10 text-action border border-action/20',
  'En Corrección': 'bg-primary/10 text-primary border border-primary/25',
  'Corregido':     'bg-emerald-50 text-emerald-600 border border-emerald-200',
}

// ── Usuarios ──────────────────────────────────────────────────────────────────
export const USUARIO_ESTADOS = ['Activo', 'Inactivo', 'Suspendido']

export const USUARIO_STATUS_STYLES = {
  'Activo':     'bg-emerald-50 text-emerald-600 border border-emerald-200',
  'Inactivo':   'bg-gray-100 text-gray-500 border border-gray-200',
  'Suspendido': 'bg-red-50 text-red-600 border border-red-200',
}

// ── Nivel de riesgo ───────────────────────────────────────────────────────────
export const RIESGO_NIVELES = ['Bajo', 'Medio', 'Alto', 'Crítico']

export const RIESGO_STYLES = {
  'Bajo':    'bg-emerald-50 text-emerald-600 border border-emerald-200',
  'Medio':   'bg-amber-50 text-amber-600 border border-amber-200',
  'Alto':    'bg-orange-50 text-orange-600 border border-orange-200',
  'Crítico': 'bg-red-50 text-red-600 border border-red-200',
}

// ── Estados reales de denuncia (estado_denuncia del backend) ──────────────────
export const DENUNCIA_BACKEND_STATUS_STYLES = {
  'Pendiente':        'bg-amber-50 text-amber-600 border border-amber-200',
  'En_Investigacion': 'bg-blue-50 text-blue-600 border border-blue-200',
  'Verificada':       'bg-violet-50 text-violet-600 border border-violet-200',
  'Resuelta':         'bg-emerald-50 text-emerald-600 border border-emerald-200',
  'Desestimada':      'bg-gray-100 text-gray-500 border border-gray-200',
}

// ── Niveles de urgencia reales (nivel_urgencia del backend) ───────────────────
export const URGENCIA_STYLES = {
  'Baja':             'bg-emerald-50 text-emerald-600 border border-emerald-200',
  'Media':            'bg-amber-50 text-amber-600 border border-amber-200',
  'Alta':             'bg-orange-50 text-orange-600 border border-orange-200',
  'Riesgo inmediato': 'bg-red-50 text-red-600 border border-red-200',
}

// Unified lookup — works for any type
export const ALL_STATUS_STYLES = {
  ...DENUNCIA_STATUS_STYLES,
  ...DENUNCIA_BACKEND_STATUS_STYLES,
  ...ACCION_STATUS_STYLES,
  ...USUARIO_STATUS_STYLES,
  ...RIESGO_STYLES,
  ...URGENCIA_STYLES,
}
