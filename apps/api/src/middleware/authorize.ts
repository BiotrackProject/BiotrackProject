import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../shared/errors/AppError.js';

export function authorize(modulo: string, accion: string) {
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
