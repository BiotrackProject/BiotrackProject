import { z } from 'zod';

export const registroSchema = z.object({
  nombre_completo: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres.')
    .max(100)
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ'\- ]+$/, 'Solo se permiten letras, espacios, guiones y apóstrofes.'),
  correo_electronico: z
    .string()
    .email('Formato de correo electrónico inválido.')
    .max(255)
    .transform((v) => v.toLowerCase()),
  cargo: z.string().min(1).max(80),
  institucion: z.string().min(1).max(100),
});

export const logoutSchema = z.object({
  // El token viene del header Authorization, pero lo podemos recibir en el body para logout explícito
});

export const updatePerfilSchema = z
  .object({
    nombre_completo: z
      .string()
      .min(3)
      .max(100)
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ'\- ]+$/)
      .optional(),
    telefono: z
      .string()
      .regex(/^\+[1-9]\d{7,14}$/, 'Formato inválido. Use E.164: +1809XXXXXXX')
      .optional()
      .nullable(),
  });

export type RegistroInput = z.infer<typeof registroSchema>;
export type UpdatePerfilInput = z.infer<typeof updatePerfilSchema>;
