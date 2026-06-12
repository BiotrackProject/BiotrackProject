import { auth } from 'express-oauth2-jwt-bearer';
import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../shared/errors/AppError.js';

// Valida el JWT de Auth0 (firma RS256 via JWKS) — coloca req.auth con el payload
export const validateAuth0Token = auth({
  audience: env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${env.AUTH0_DOMAIN}`,
  tokenSigningAlg: 'RS256',
});

/**
 * Carga el usuario desde nuestra BD usando el `sub` del token de Auth0.
 * Verifica que no esté revocado (blacklist para logout explícito, RF-1.3).
 * Adjunta req.user con id, rolId y permisos.
 */
export async function loadUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  const auth0Id = req.auth?.payload.sub as string | undefined;
  const jti = req.auth?.payload.jti as string | undefined;

  if (!auth0Id) {
    return next(new UnauthorizedError());
  }

  // Blacklist: verifica que el token no haya sido revocado explícitamente (RF-1.3)
  if (jti) {
    const revocado = await prisma.tokenRevocado.findUnique({
      where: { jti },
      select: { id: true },
    });
    if (revocado) {
      return next(new UnauthorizedError('Sesión cerrada. Inicie sesión nuevamente.'));
    }
  }

  const usuario = await prisma.usuario.findUnique({
    where: { auth0_id: auth0Id },
    select: {
      id: true,
      estado: true,
      rol_id: true,
      rol: {
        select: {
          id: true,
          nombre: true,
          permisos: {
            select: { permiso: { select: { modulo: true, accion: true } } },
          },
        },
      },
    },
  });

  if (!usuario || usuario.estado !== 'ACTIVO') {
    return next(new UnauthorizedError('Cuenta inactiva o sin acceso al sistema.'));
  }

  req.user = {
    id: usuario.id,
    auth0Id,
    rolId: usuario.rol_id,
    rolNombre: usuario.rol?.nombre ?? null,
    permisos: (usuario.rol?.permisos ?? []).map((p) => ({
      modulo: p.permiso.modulo,
      accion: p.permiso.accion,
    })),
  };

  next();
}

/**
 * Middleware combinado: valida token Auth0 + carga usuario desde BD.
 * Usar en rutas protegidas: `router.get('/ruta', authenticate, handler)`
 */
export const authenticate = [validateAuth0Token, loadUser];
