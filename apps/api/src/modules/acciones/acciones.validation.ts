import { z } from 'zod';

export const crearAccionSchema = z.object({
  titulo: z.string().min(5).max(200),
  descripcion_accion: z.string().min(10).max(3000).optional(),
  FechaPlanificacion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  FechaImplementacion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  resumen_publico: z.string().max(500).optional(),
  Presupuesto: z.coerce.number().positive().optional(),
  denunciaIds: z.array(z.number().int().positive()).max(20).optional(),
  zonaIds: z.array(z.string().uuid()).max(20).optional(),
});

/**
 * Parámetros de exportación (RF-5.3). Llegan por query string, por eso
 * `incluir_evidencias` se coacciona desde string ("true"/"false").
 */
export const exportarAccionSchema = z.object({
  formato: z.enum(['PDF', 'XLSX']),
  incluir_evidencias: z
    .preprocess((v) => v === true || v === 'true', z.boolean())
    .default(false),
});

export const actualizarAccionSchema = crearAccionSchema.partial();

export const cambiarEstadoAccionSchema = z.object({
  estado: z.enum(['Planificada', 'En_Ejecucion', 'Completada', 'Cancelada']),
  Resultado: z.string().max(2000).optional(),
});

export const publicarAccionSchema = z.object({
  resumen_publico: z.string().min(10).max(500),
});

export type CrearAccionInput = z.infer<typeof crearAccionSchema>;
export type ActualizarAccionInput = z.infer<typeof actualizarAccionSchema>;
export type CambiarEstadoAccionInput = z.infer<typeof cambiarEstadoAccionSchema>;
export type PublicarAccionInput = z.infer<typeof publicarAccionSchema>;
export type ExportarAccionInput = z.infer<typeof exportarAccionSchema>;
