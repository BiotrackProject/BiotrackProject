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
    .max(100)
    .transform((v) => v.toLowerCase()),
  cargo: z.string().min(1).max(80).optional(),
  institucion: z.string().min(1).max(100).optional(),
});

export const loginSchema = z.object({
  correo_electronico: z
    .string()
    .email('Formato de correo electrónico inválido.')
    .transform((v) => v.toLowerCase()),
  contrasena: z.string().min(1, 'La contraseña es requerida.'),
});

export const updatePerfilSchema = z.object({
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

// RF-1.4 — Recuperación de contraseña por código (OTP)
const correoField = z
  .string()
  .email('Formato de correo electrónico inválido.')
  .max(100)
  .transform((v) => v.toLowerCase());

export const forgotPasswordSchema = z.object({
  correo_electronico: correoField,
});

export const verifyCodeSchema = z.object({
  correo_electronico: correoField,
  codigo: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'El código debe tener 6 dígitos.'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'El token de restablecimiento es requerido.'),
  contrasena: z
    .string()
    .min(10, 'La contraseña debe tener al menos 10 caracteres.')
    .max(72, 'La contraseña no puede superar los 72 caracteres.')
    .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula.')
    .regex(/[a-z]/, 'Debe incluir al menos una minúscula.')
    .regex(/\d/, 'Debe incluir al menos un número.')
    .regex(/[@$!%*?&]/, 'Debe incluir al menos un carácter especial (@$!%*?&).'),
});

// RF-1.2 — Cambio de contraseña del usuario autenticado.
export const cambiarContrasenaSchema = z.object({
  contrasena_actual: z.string().min(1, 'La contraseña actual es requerida.'),
  contrasena_nueva: z
    .string()
    .min(10, 'La contraseña debe tener al menos 10 caracteres.')
    .max(72, 'La contraseña no puede superar los 72 caracteres.')
    .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula.')
    .regex(/[a-z]/, 'Debe incluir al menos una minúscula.')
    .regex(/\d/, 'Debe incluir al menos un número.')
    .regex(/[@$!%*?&]/, 'Debe incluir al menos un carácter especial (@$!%*?&).'),
});

export type RegistroInput = z.infer<typeof registroSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdatePerfilInput = z.infer<typeof updatePerfilSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CambiarContrasenaInput = z.infer<typeof cambiarContrasenaSchema>;
