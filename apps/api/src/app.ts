import 'express-async-errors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import logger from './shared/utils/logger.js';

import authRoutes from './modules/auth/auth.routes.js';
import denunciasRoutes from './modules/denuncias/denuncias.routes.js';
import zonasRoutes from './modules/zonas/zonas.routes.js';
import telemetriaRoutes from './modules/telemetria/telemetria.routes.js';
import indicadoresRoutes from './modules/indicadores/indicadores.routes.js';
import accionesRoutes from './modules/acciones/acciones.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const app: Express = express();

// ─── Seguridad ───────────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
);

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Parsers ─────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Logging HTTP ────────────────────────────────────────────────────────────
app.use(pinoHttp({ logger }));

// ─── Rate limiting global ────────────────────────────────────────────────────
app.use(globalLimiter);

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ─── Documentación OpenAPI 3.1 (/api/docs + /api/docs.json para OWASP ZAP) ──
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'BIOTRACK API Docs',
  swaggerOptions: { persistAuthorization: true },
}));

app.get('/api/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(swaggerSpec);
});

// ─── Rutas API v1 ────────────────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/auth`, authRoutes);
app.use(`${API}/denuncias`, denunciasRoutes);
app.use(`${API}/zonas`, zonasRoutes);
app.use(`${API}/telemetria`, telemetriaRoutes);
app.use(`${API}/indicadores`, indicadoresRoutes);
app.use(`${API}/acciones`, accionesRoutes);
app.use(`${API}/admin`, adminRoutes);

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.url}` });
});

// ─── Error Handler Global ────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
