import type { Request, Response } from 'express';
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

export async function registro(req: Request, res: Response): Promise<void> {
  const datos = registroSchema.parse(req.body);
  const resultado = await authService.registrarSolicitud(datos, req.ip);
  res.status(201).json(resultado);
}

export async function login(req: Request, res: Response): Promise<void> {
  const datos = loginSchema.parse(req.body);
  const resultado = await authService.login(datos, req.ip);
  res.json(resultado);
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
