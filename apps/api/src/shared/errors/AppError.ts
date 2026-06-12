export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details: unknown;

  constructor(message: string, statusCode = 500, details: unknown = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly errores: Array<{ campo: string; mensaje: string }>;

  constructor(errores: Array<{ campo: string; mensaje: string }>) {
    super('Error de validación en los datos enviados.', 422);
    this.errores = errores;
  }
}

export class NotFoundError extends AppError {
  constructor(recurso = 'Recurso') {
    super(`${recurso} no encontrado.`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(mensaje = 'No autenticado. Inicie sesión para continuar.') {
    super(mensaje, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(mensaje = 'No tiene permisos para realizar esta acción.') {
    super(mensaje, 403);
  }
}

export class ConflictError extends AppError {
  constructor(mensaje: string) {
    super(mensaje, 409);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(mensaje = 'Demasiadas solicitudes. Intente nuevamente más tarde.') {
    super(mensaje, 429);
  }
}
