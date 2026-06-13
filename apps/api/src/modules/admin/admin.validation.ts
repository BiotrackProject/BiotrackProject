import { z } from 'zod';

export const crearUsuarioSchema = z.object({
  nombre_completo: z.string().min(3).max(100),
  correo_electronico: z.string().email().max(100).transform((v) => v.toLowerCase()),
  contrasena: z.string().min(8).max(72),
  rol_id: z.string().uuid(),
  cargo: z.string().min(1).max(80).optional(),
  institucion: z.string().min(1).max(100).optional(),
  telefono: z.string().regex(/^\+[1-9]\d{7,14}$/).optional().nullable(),
});

export const actualizarUsuarioSchema = z.object({
  nombre_completo: z.string().min(3).max(100).optional(),
  cargo: z.string().min(1).max(80).optional(),
  institucion: z.string().min(1).max(100).optional(),
  telefono: z.string().regex(/^\+[1-9]\d{7,14}$/).optional().nullable(),
});

export const asignarRolSchema = z.object({
  rol_id: z.string().uuid(),
});

export const revisarSolicitudSchema = z.object({
  accion: z.enum(['Aprobada', 'Rechazada']),
  comentario: z.string().max(300).optional(),
  // Only needed when Aprobada:
  contrasena: z.string().min(8).max(72).optional(),
  rol_id: z.string().uuid().optional(),
  cargo: z.string().min(1).max(80).optional(),
  institucion: z.string().min(1).max(100).optional(),
});

export type CrearUsuarioInput = z.infer<typeof crearUsuarioSchema>;
export type ActualizarUsuarioInput = z.infer<typeof actualizarUsuarioSchema>;
export type AsignarRolInput = z.infer<typeof asignarRolSchema>;
export type RevisarSolicitudInput = z.infer<typeof revisarSolicitudSchema>;
