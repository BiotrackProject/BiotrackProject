import { describe, it, expect } from '@jest/globals';
import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  TooManyRequestsError,
} from '../../src/shared/errors/AppError.js';

describe('AppError', () => {
  it('creates error with message and default statusCode 500', () => {
    const err = new AppError('test error');
    expect(err.message).toBe('test error');
    expect(err.statusCode).toBe(500);
    expect(err.isOperational).toBe(true);
    expect(err.details).toBeNull();
    expect(err).toBeInstanceOf(Error);
  });

  it('accepts custom statusCode and details', () => {
    const err = new AppError('custom', 404, { field: 'id' });
    expect(err.statusCode).toBe(404);
    expect(err.details).toEqual({ field: 'id' });
  });

  it('captures a stack trace', () => {
    const err = new AppError('stack test');
    expect(err.stack).toBeDefined();
  });
});

describe('ValidationError', () => {
  it('has statusCode 422 and exposes errores array', () => {
    const errores = [{ campo: 'email', mensaje: 'Formato inválido' }];
    const err = new ValidationError(errores);
    expect(err.statusCode).toBe(422);
    expect(err.errores).toEqual(errores);
    expect(err).toBeInstanceOf(AppError);
  });
});

describe('NotFoundError', () => {
  it('has statusCode 404 with default resource name', () => {
    const err = new NotFoundError();
    expect(err.statusCode).toBe(404);
    expect(err.message).toContain('no encontrado');
  });

  it('includes the provided resource name in the message', () => {
    const err = new NotFoundError('Usuario');
    expect(err.message).toContain('Usuario');
  });
});

describe('UnauthorizedError', () => {
  it('has statusCode 401 with default message', () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
  });

  it('accepts a custom message', () => {
    const err = new UnauthorizedError('Token expirado.');
    expect(err.message).toBe('Token expirado.');
  });
});

describe('ForbiddenError', () => {
  it('has statusCode 403', () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
  });

  it('accepts a custom message', () => {
    const err = new ForbiddenError('Sin acceso al módulo.');
    expect(err.message).toBe('Sin acceso al módulo.');
  });
});

describe('ConflictError', () => {
  it('has statusCode 409 and preserves the message', () => {
    const err = new ConflictError('El correo ya existe.');
    expect(err.statusCode).toBe(409);
    expect(err.message).toBe('El correo ya existe.');
  });
});

describe('TooManyRequestsError', () => {
  it('has statusCode 429 with default message', () => {
    const err = new TooManyRequestsError();
    expect(err.statusCode).toBe(429);
  });

  it('accepts a custom message', () => {
    const err = new TooManyRequestsError('Límite excedido.');
    expect(err.message).toBe('Límite excedido.');
  });
});
