import type { Request, Response, CookieOptions } from 'express';
import * as authService from './auth.service.js';
import {
  registroSchema,
  loginSchema,
  updatePerfilSchema,
  forgotPasswordSchema,
  verifyCodeSchema,
  resetPasswordSchema,
  cambiarContrasenaSchema,
} from './auth.validation.js';
import { env } from '../../config/env.js';

/** Convierte JWT_EXPIRES_IN ('8h', '7d', '30m'…) a milisegundos para el maxAge de la cookie. */
function parseDurationMs(str: string): number {
  const m = /^(\d+)([smhd])$/.exec(str);
  if (!m) return 8 * 3_600_000;
  const n = parseInt(m[1]!, 10);
  const units: Record<string, number> = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return n * (units[m[2]!] ?? 3_600_000);
}

const SESSION_COOKIE = 'bt_session';

const cookieBase: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
};

export async function registro(req: Request, res: Response): Promise<void> {
  const datos = registroSchema.parse(req.body);
  const resultado = await authService.registrarSolicitud(datos, req.ip);
  res.status(201).json(resultado);
}

export async function login(req: Request, res: Response): Promise<void> {
  const datos = loginSchema.parse(req.body);
  const resultado = await authService.login(datos, req.ip);

  res.cookie(SESSION_COOKIE, resultado.token, {
    ...cookieBase,
    maxAge: parseDurationMs(env.JWT_EXPIRES_IN),
  });

  // Devolvemos solo los datos del usuario — el token viaja en la cookie, no en el body.
  res.json({ usuario: resultado.usuario });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie(SESSION_COOKIE, cookieBase);
  res.json({ mensaje: 'Sesión cerrada correctamente.' });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const datos = forgotPasswordSchema.parse(req.body);
  const resultado = await authService.solicitarCodigoRecuperacion(datos, req.ip);
  res.json(resultado);
}

export async function verifyCode(req: Request, res: Response): Promise<void> {
  const datos = verifyCodeSchema.parse(req.body);
  const resultado = await authService.verificarCodigoRecuperacion(datos, req.ip);
  res.json(resultado);
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const datos = resetPasswordSchema.parse(req.body);
  const resultado = await authService.restablecerContrasena(datos, req.ip);
  res.json(resultado);
}

export async function cambiarContrasena(req: Request, res: Response): Promise<void> {
  const datos = cambiarContrasenaSchema.parse(req.body);
  const resultado = await authService.cambiarContrasena(req.user!.id, datos, req.ip);
  res.json(resultado);
}

export async function getPerfil(req: Request, res: Response): Promise<void> {
  const perfil = await authService.getPerfilPropio(req.user!.id);
  res.json(perfil);
}

export async function actualizarPerfil(req: Request, res: Response): Promise<void> {
  const datos = updatePerfilSchema.parse(req.body);
  const resultado = await authService.actualizarPerfil(req.user!.id, datos, req.ip);
  res.json(resultado);
}
