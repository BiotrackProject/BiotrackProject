import type { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';
import { AppError, ValidationError } from '../shared/errors/AppError.js';
import logger from '../shared/utils/logger.js';

/** Mensajes amigables para los errores de subida de archivos de multer. */
const MULTER_MESSAGES: Record<string, string> = {
  LIMIT_FILE_SIZE: 'Uno de los archivos supera el tamaño máximo permitido (25 MB).',
  LIMIT_FILE_COUNT: 'Se excedió el número máximo de archivos permitidos (10).',
  LIMIT_UNEXPECTED_FILE: 'Campo de archivo inesperado en la subida.',
  LIMIT_PART_COUNT: 'La solicitud contiene demasiadas partes.',
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  // Error de validación Zod
  if (err instanceof Error && err.name === 'ZodError') {
    const zodErr = err as unknown as { errors: Array<{ path: (string | number)[]; message: string }> };
    const errores = zodErr.errors.map((e) => ({
      campo: e.path.join('.'),
      mensaje: e.message,
    }));
    res.status(422).json({ errores });
    return;
  }

  // Error de validación interno
  if (err instanceof ValidationError) {
    res.status(422).json({ errores: err.errores });
    return;
  }

  // Errores de subida de archivos (multer)
  if (err instanceof MulterError) {
    res.status(422).json({ error: MULTER_MESSAGES[err.code] ?? `Error al subir archivo: ${err.message}` });
    return;
  }

  // Errores operacionales conocidos
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // JWT inválido de express-oauth2-jwt-bearer
  if (err instanceof Error && err.name === 'UnauthorizedError') {
    res.status(401).json({ error: 'Token de autenticación inválido o expirado.' });
    return;
  }

  // Prisma: violación de unicidad
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const prismaErr = err as { code: string; meta?: { target?: string[] } };
    if (prismaErr.code === 'P2002') {
      const field = prismaErr.meta?.target?.[0] ?? 'campo';
      res.status(409).json({ error: `El valor del campo '${field}' ya existe en el sistema.` });
      return;
    }
    if (prismaErr.code === 'P2025') {
      res.status(404).json({ error: 'Recurso no encontrado.' });
      return;
    }
  }

  logger.error({ err, url: req.url, method: req.method }, 'Error inesperado no controlado');
  res.status(500).json({ error: 'Error interno del servidor. Por favor, intente más tarde.' });
}
