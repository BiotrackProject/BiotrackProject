import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../shared/errors/AppError.js';

interface JwtPayload {
  sub: string;
  rolId: string;
  iat: number;
  exp: number;
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const header = req.headers['authorization'];
  if (!header?.startsWith('Bearer ')) {
    return next(new UnauthorizedError());
  }

  const token = header.slice(7);
  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    return next(new UnauthorizedError('Token inválido o expirado.'));
  }

  const usuario = await prisma.usuario.findUnique({
    where: { IDUsuario: payload.sub },
    select: {
      IDUsuario: true,
      Estado: true,
      rol_id: true,
      rol: {
        select: {
          id: true,
          nombre: true,
          rol_permiso: {
            select: { permiso: { select: { modulo: true, accion: true } } },
          },
        },
      },
    },
  });

  if (!usuario || usuario.Estado !== 'Activo') {
    return next(new UnauthorizedError('Cuenta inactiva o sin acceso al sistema.'));
  }

  req.user = {
    id: usuario.IDUsuario,
    rolId: usuario.rol_id,
    rolNombre: usuario.rol?.nombre ?? null,
    permisos: (usuario.rol?.rol_permiso ?? []).map((rp) => ({
      modulo: rp.permiso.modulo,
      accion: rp.permiso.accion as string,
    })),
  };

  next();
}
