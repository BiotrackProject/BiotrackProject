import type { Request, Response } from 'express';
import * as authService from './auth.service.js';
import { registroSchema, updatePerfilSchema } from './auth.validation.js';

export async function registro(req: Request, res: Response): Promise<void> {
  const datos = registroSchema.parse(req.body);
  const resultado = await authService.registrarSolicitud(datos, req.ip);
  res.status(201).json(resultado);
}

export async function logout(req: Request, res: Response): Promise<void> {
  const jti = req.auth?.payload['jti'] as string | undefined;
  const exp = req.auth?.payload['exp'] as number | undefined;

  if (jti && exp && req.user) {
    await authService.logout({
      jti,
      usuarioId: req.user.id,
      tokenExpiry: new Date(exp * 1000),
      ip: req.ip,
    });
  }

  res.json({ mensaje: 'Sesión cerrada exitosamente.' });
}

export async function solicitarRecuperacion(req: Request, res: Response): Promise<void> {
  const { correo_electronico } = req.body as { correo_electronico: string };
  const resultado = await authService.solicitarRecuperacion(correo_electronico, req.ip);
  res.json(resultado);
}

export async function getPerfil(req: Request, res: Response): Promise<void> {
  const perfil = await authService.getPerfilPropio(req.user!.id);
  res.json(perfil);
}

export async function actualizarPerfil(req: Request, res: Response): Promise<void> {
  const datos = updatePerfilSchema.parse(req.body);
  const resultado = await authService.actualizarPerfil(
    req.user!.id,
    req.user!.auth0Id,
    datos,
    req.ip
  );
  res.json(resultado);
}
