import { z } from 'zod';

export const crearDenunciaPublicaSchema = z.object({
  Descripcion: z.string().min(10).max(2000),
  tipo_actividad: z.enum(['Extraccion_Rio', 'Extraccion_Playa', 'Extraccion_Zona_Protegida', 'Transporte_Ilegal', 'Otro']),
  hora_aproximada: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  contacto: z.string().max(500).optional(),
  IDZona: z.string().uuid().optional(),
  // Campos estructurados del incidente (antes se concatenaban dentro de Descripcion)
  fecha_incidente: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  detalle_ubicacion: z.string().max(2000).optional(),
  // GPS en formato "lat, lng"; se persiste como geometría point (ver service)
  gps: z.string().max(100).optional(),
  tipo_extraccion: z.string().max(50).optional(),
  numero_personas: z.string().max(50).optional(),
  cantidad_arena: z.string().max(150).optional(),
  nivel_urgencia: z.string().max(30).optional(),
});

export const filtrosDenunciasSchema = z.object({
  estado: z.enum(['Pendiente', 'En_Investigacion', 'Verificada', 'Resuelta', 'Desestimada']).optional(),
  tipo: z.enum(['Extraccion_Rio', 'Extraccion_Playa', 'Extraccion_Zona_Protegida', 'Transporte_Ilegal', 'Otro']).optional(),
  q: z.string().max(100).optional(),
  pagina: z.coerce.number().int().positive().default(1),
  por_pagina: z.coerce.number().int().positive().max(100).default(25),
});

export const cambiarEstadoSchema = z.object({
  estado: z.enum(['Pendiente', 'En_Investigacion', 'Verificada', 'Resuelta', 'Desestimada']),
  comentario: z.string().max(500).optional(),
});

export type CrearDenunciaPublicaInput = z.infer<typeof crearDenunciaPublicaSchema>;
export type FiltrosDenunciasInput = z.infer<typeof filtrosDenunciasSchema>;
export type CambiarEstadoInput = z.infer<typeof cambiarEstadoSchema>;
