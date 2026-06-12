import type { Request, Response, NextFunction } from 'express';
import type { ModuloSistema, AccionPermiso } from '@prisma/client';
import { ForbiddenError } from '../shared/errors/AppError.js';

/**
 * Verifica que el usuario tenga el permiso requerido (RBAC).
 * Uso: router.get('/ruta', ...authenticate, authorize('MOD_02_DENUNCIAS', 'LEER'), handler)
 */
export function authorize(modulo: ModuloSistema, accion: AccionPermiso) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const tiene = req.user?.permisos.some(
      (p) => p.modulo === modulo && p.accion === accion
    );

    if (!tiene) {
      return next(
        new ForbiddenError(
          `No tiene permiso para realizar '${accion}' en el módulo '${modulo}'.`
        )
      );
    }

    next();
  };
}
