import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import { env } from '../config/env.js';

const jsonHandler = (_req: Request, res: Response): void => {
  res.status(429).json({ error: 'Demasiadas solicitudes. Intente nuevamente más tarde.' });
};

export const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler,
});

// Límite estricto para endpoints de autenticación (previene fuerza bruta, aunque Auth0 también lo maneja)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler,
});

// RF-2.6: 10 consultas por minuto por IP para seguimiento público
export const seguimientoLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler,
});

// RF-3.2: 1000 peticiones por minuto por API Key para telemetría
export const telemetriaLimiter = rateLimit({
  windowMs: 60_000,
  max: 1000,
  keyGenerator: (req) => (req.headers['authorization'] as string | undefined) ?? req.ip ?? 'unknown',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ error: 'Límite de 1000 peticiones/minuto excedido para esta API Key.' });
  },
});
