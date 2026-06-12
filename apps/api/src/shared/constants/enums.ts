import type { EstadoDenunciaEnum } from '@prisma/client';

export const ESTADO_USUARIO = {
  PENDIENTE_APROBACION: 'PENDIENTE_APROBACION',
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO',
} as const;

export const MODULO_SISTEMA = {
  MOD_01_AUTH: 'MOD_01_AUTH',
  MOD_02_DENUNCIAS: 'MOD_02_DENUNCIAS',
  MOD_03_ZONAS: 'MOD_03_ZONAS',
  MOD_04_INDICADORES: 'MOD_04_INDICADORES',
  MOD_05_ACCIONES: 'MOD_05_ACCIONES',
  MOD_06_ADMIN: 'MOD_06_ADMIN',
} as const;

export const ACCION_PERMISO = {
  LEER: 'LEER',
  CREAR: 'CREAR',
  EDITAR: 'EDITAR',
  ELIMINAR_LOGICO: 'ELIMINAR_LOGICO',
  EXPORTAR: 'EXPORTAR',
  PUBLICAR: 'PUBLICAR',
  CONFIGURAR: 'CONFIGURAR',
} as const;

export const TIPO_ACTIVIDAD = {
  EXTRACCION_RIO: 'EXTRACCION_RIO',
  EXTRACCION_PLAYA: 'EXTRACCION_PLAYA',
  EXTRACCION_ZONA_PROTEGIDA: 'EXTRACCION_ZONA_PROTEGIDA',
  TRANSPORTE_ILEGAL: 'TRANSPORTE_ILEGAL',
  OTRO: 'OTRO',
} as const;

export const ESTADO_DENUNCIA = {
  PENDIENTE: 'PENDIENTE',
  EN_INVESTIGACION: 'EN_INVESTIGACION',
  VERIFICADA: 'VERIFICADA',
  RESUELTA: 'RESUELTA',
  DESESTIMADA: 'DESESTIMADA',
} as const;

// Máquina de estados de denuncias (RF-2.3)
export const TRANSICIONES_DENUNCIA: Record<EstadoDenunciaEnum, EstadoDenunciaEnum[]> = {
  PENDIENTE: ['EN_INVESTIGACION'],
  EN_INVESTIGACION: ['VERIFICADA', 'DESESTIMADA'],
  VERIFICADA: ['RESUELTA', 'DESESTIMADA'],
  RESUELTA: [],
  DESESTIMADA: [],
};

export const ESTADOS_REQUIEREN_COMENTARIO: EstadoDenunciaEnum[] = ['RESUELTA', 'DESESTIMADA'];

export const NIVEL_RIESGO = {
  BAJO: 'BAJO',
  MEDIO: 'MEDIO',
  ALTO: 'ALTO',
  CRITICO: 'CRITICO',
} as const;

export const TIPO_SENSOR = {
  TURBIDEZ: 'TURBIDEZ',
  TEMPERATURA: 'TEMPERATURA',
  MOVIMIENTO: 'MOVIMIENTO',
  NIVEL_AGUA: 'NIVEL_AGUA',
  AUDIO: 'AUDIO',
  GPS_TRACKER: 'GPS_TRACKER',
  OTRO: 'OTRO',
} as const;

export const MIME_PERMITIDOS_DENUNCIA = ['image/jpeg', 'image/png', 'application/pdf'] as const;

export const MIME_PERMITIDOS_ACCION = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;
