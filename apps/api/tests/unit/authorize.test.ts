import { describe, it, expect, jest } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import { authorize } from '../../src/middleware/authorize.js';
import { ForbiddenError } from '../../src/shared/errors/AppError.js';

type FakePermiso = { modulo: string; accion: string };

function makeReq(permisos: FakePermiso[] = []): Partial<Request> {
  return { user: { id: 'u1', permisos } as unknown as Request['user'] };
}

describe('authorize middleware', () => {
  it('calls next() with no arguments when user has the required permission', () => {
    const req = makeReq([{ modulo: 'MOD_02_DENUNCIAS', accion: 'LEER' }]);
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    authorize('MOD_02_DENUNCIAS', 'LEER')(req as Request, {} as Response, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('calls next(ForbiddenError) when the user has a different action on the same module', () => {
    const req = makeReq([{ modulo: 'MOD_02_DENUNCIAS', accion: 'LEER' }]);
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    authorize('MOD_02_DENUNCIAS', 'ELIMINAR_LOGICO')(req as Request, {} as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it('calls next(ForbiddenError) when the user has the action on a different module', () => {
    const req = makeReq([{ modulo: 'MOD_02_DENUNCIAS', accion: 'LEER' }]);
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    authorize('MOD_03_ZONAS', 'LEER')(req as Request, {} as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it('calls next(ForbiddenError) when the user has no permissions', () => {
    const req = makeReq([]);
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    authorize('MOD_03_ZONAS', 'CREAR')(req as Request, {} as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it('calls next(ForbiddenError) when req.user is undefined', () => {
    const req: Partial<Request> = {};
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    authorize('MOD_01_AUTH', 'LEER')(req as Request, {} as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it('ForbiddenError message includes the required module and action', () => {
    const req = makeReq([]);
    let capturedError: unknown;
    const next = jest.fn((err?: unknown) => { capturedError = err; }) as jest.MockedFunction<NextFunction>;

    authorize('MOD_06_ADMIN', 'CONFIGURAR')(req as Request, {} as Response, next);

    const err = capturedError as ForbiddenError;
    expect(err.message).toContain('MOD_06_ADMIN');
    expect(err.message).toContain('CONFIGURAR');
    expect(err.statusCode).toBe(403);
  });

  it('grants access when the user has multiple permissions including the required one', () => {
    const req = makeReq([
      { modulo: 'MOD_01_AUTH', accion: 'LEER' },
      { modulo: 'MOD_02_DENUNCIAS', accion: 'CREAR' },
      { modulo: 'MOD_06_ADMIN', accion: 'CONFIGURAR' },
    ]);
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    authorize('MOD_06_ADMIN', 'CONFIGURAR')(req as Request, {} as Response, next);

    expect(next).toHaveBeenCalledWith();
  });
});
