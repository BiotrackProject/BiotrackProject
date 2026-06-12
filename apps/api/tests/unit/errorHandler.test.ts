import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../src/middleware/errorHandler.js';
import {
  AppError,
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from '../../src/shared/errors/AppError.js';

function makeRes() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as unknown as Response & { status: jest.Mock; json: jest.Mock };
}

const req = { url: '/test', method: 'GET' } as Request;
const next = jest.fn() as jest.MockedFunction<NextFunction>;

describe('errorHandler — AppError variants', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 404 for NotFoundError', () => {
    const res = makeRes();
    errorHandler(new NotFoundError('Zona'), req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Zona no encontrado.' });
  });

  it('returns 403 for ForbiddenError', () => {
    const res = makeRes();
    errorHandler(new ForbiddenError(), req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 422 with errores array for ValidationError', () => {
    const res = makeRes();
    const errores = [{ campo: 'email', mensaje: 'Requerido' }];
    errorHandler(new ValidationError(errores), req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ errores });
  });

  it('returns the AppError statusCode for generic AppError', () => {
    const res = makeRes();
    errorHandler(new AppError('custom', 418), req, res, next);
    expect(res.status).toHaveBeenCalledWith(418);
  });
});

describe('errorHandler — ZodError', () => {
  it('returns 422 and maps Zod errors to campo/mensaje', () => {
    const res = makeRes();
    const zodErr = Object.assign(new Error('zod'), {
      name: 'ZodError',
      errors: [{ path: ['nombre_completo'], message: 'Muy corto' }],
    });
    errorHandler(zodErr, req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    const body = (res.json as jest.Mock).mock.calls[0]?.[0] as { errores: unknown[] };
    expect(body.errores).toHaveLength(1);
  });

  it('joins nested path segments with a dot', () => {
    const res = makeRes();
    const zodErr = Object.assign(new Error('zod'), {
      name: 'ZodError',
      errors: [{ path: ['usuario', 'correo_electronico'], message: 'Inválido' }],
    });
    errorHandler(zodErr, req, res, next);
    const body = (res.json as jest.Mock).mock.calls[0]?.[0] as { errores: Array<{ campo: string }> };
    expect(body.errores[0]?.campo).toBe('usuario.correo_electronico');
  });
});

describe('errorHandler — JWT UnauthorizedError', () => {
  it('returns 401 when the error name is UnauthorizedError', () => {
    const res = makeRes();
    const jwtErr = Object.assign(new Error('jwt invalid'), { name: 'UnauthorizedError' });
    errorHandler(jwtErr, req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe('errorHandler — Prisma errors', () => {
  it('returns 409 for P2002 (unique constraint violation)', () => {
    const res = makeRes();
    errorHandler({ code: 'P2002', meta: { target: ['correo_electronico'] } }, req, res, next);
    expect(res.status).toHaveBeenCalledWith(409);
    const body = (res.json as jest.Mock).mock.calls[0]?.[0] as { error: string };
    expect(body.error).toContain('correo_electronico');
  });

  it('returns 409 with fallback field name when meta.target is missing', () => {
    const res = makeRes();
    errorHandler({ code: 'P2002' }, req, res, next);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('returns 404 for P2025 (record not found)', () => {
    const res = makeRes();
    errorHandler({ code: 'P2025' }, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('errorHandler — unexpected errors', () => {
  it('returns 500 for unknown Error instances', () => {
    const res = makeRes();
    errorHandler(new Error('boom'), req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('returns 500 for non-Error thrown values', () => {
    const res = makeRes();
    errorHandler('unexpected string error', req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
