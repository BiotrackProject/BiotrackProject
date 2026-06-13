import type { estado_denuncia } from '@prisma/client';

// Valores de enums del esquema de producción (case-sensitive, deben coincidir con BD)
export const ESTADO_USUARIO = {
  Activo: 'Activo',
  Inactivo: 'Inactivo',
} as const;

export const ESTADO_SOLICITUD = {
  Pendiente_Aprobacion: 'Pendiente_Aprobacion',
  Aprobada: 'Aprobada',
  Rechazada: 'Rechazada',
  Pendiente_Info: 'Pendiente_Info',
} as const;

// Módulos del sistema (strings libres en BD — campo VarChar en log_auditoria y permiso)
export const MODULO_SISTEMA = {
  AUTH: 'MOD_01_AUTH',
  DENUNCIAS: 'MOD_02_DENUNCIAS',
  ZONAS: 'MOD_03_ZONAS',
  INDICADORES: 'MOD_04_INDICADORES',
  ACCIONES: 'MOD_05_ACCIONES',
  ADMIN: 'MOD_06_ADMIN',
} as const;

// Valores del enum accion_permiso (definidos en schema.prisma)
export const ACCION_PERMISO = {
  Leer: 'Leer',
  Crear: 'Crear',
  Editar: 'Editar',
  Eliminar_Logico: 'Eliminar_Logico',
  Exportar: 'Exportar',
  Publicar: 'Publicar',
  Configurar: 'Configurar',
} as const;

// Valores del enum tipo_actividad_ilegal
export const TIPO_ACTIVIDAD = {
  Extraccion_Rio: 'Extraccion_Rio',
  Extraccion_Playa: 'Extraccion_Playa',
  Extraccion_Zona_Protegida: 'Extraccion_Zona_Protegida',
  Transporte_Ilegal: 'Transporte_Ilegal',
  Otro: 'Otro',
} as const;

// Valores del enum estado_denuncia
export const ESTADO_DENUNCIA = {
  Pendiente: 'Pendiente',
  En_Investigacion: 'En_Investigacion',
  Verificada: 'Verificada',
  Resuelta: 'Resuelta',
  Desestimada: 'Desestimada',
} as const;

// Máquina de estados (RF-2.3)
export const TRANSICIONES_DENUNCIA: Record<estado_denuncia, estado_denuncia[]> = {
  Pendiente: ['En_Investigacion'],
  En_Investigacion: ['Verificada', 'Desestimada'],
  Verificada: ['Resuelta', 'Desestimada'],
  Resuelta: [],
  Desestimada: [],
};

export const ESTADOS_REQUIEREN_COMENTARIO: estado_denuncia[] = ['Resuelta', 'Desestimada'];

export const NIVEL_RIESGO = {
  Bajo: 'Bajo',
  Medio: 'Medio',
  Alto: 'Alto',
  Critico: 'Critico',
} as const;

export const TIPO_SENSOR = {
  Turbidez: 'Turbidez',
  Temperatura: 'Temperatura',
  Movimiento: 'Movimiento',
  Nivel_Agua: 'Nivel_Agua',
  Audio: 'Audio',
  GPS_Tracker: 'GPS_Tracker',
  Otro: 'Otro',
} as const;

export const MIME_PERMITIDOS_DENUNCIA = ['image/jpeg', 'image/png', 'application/pdf'] as const;

export const MIME_PERMITIDOS_ACCION = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;
