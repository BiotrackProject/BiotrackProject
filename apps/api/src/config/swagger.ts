import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.js';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'BIOTRACK API',
      version: '1.0.0',
      description:
        'API REST para el sistema BIOTRACK — Gestión de Minería Ilegal de Extracción de Arena (República Dominicana). ' +
        'Documentada conforme a OpenAPI Specification 3.1.0 (RNF-M02). ' +
        'Este archivo OpenAPI puede usarse como target en OWASP ZAP para análisis DAST.',
      contact: { name: 'Equipo BIOTRACK — INTEC', email: 'biotrack@intec.edu.do' },
      license: { name: 'MIT' },
    },
    servers: [
      { url: `http://localhost:${env.PORT}/api/v1`, description: 'Servidor de desarrollo' },
      { url: 'https://api.biotrack.gob.do/api/v1', description: 'Producción' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'JWT emitido por Auth0. Obtener via Auth0 Universal Login en el frontend. ' +
            'Incluir en el header Authorization: Bearer {token}',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'Bearer {API_KEY} — Solo para el endpoint de telemetría (RF-3.2)',
        },
      },
      responses: {
        Unauthorized: {
          description: 'No autenticado. Token ausente, expirado o revocado.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        Forbidden: {
          description: 'Sin permisos para realizar esta acción.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        NotFound: {
          description: 'Recurso no encontrado.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        ValidationError: {
          description: 'Error de validación en los datos enviados.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationErrorResponse' } } },
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: { error: { type: 'string', example: 'Mensaje de error descriptivo.' } },
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            errores: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  campo: { type: 'string', example: 'correo_electronico' },
                  mensaje: { type: 'string', example: 'Formato de correo inválido.' },
                },
              },
            },
          },
        },
        Paginacion: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 150 },
            pagina: { type: 'integer', example: 1 },
            por_pagina: { type: 'integer', example: 25 },
            total_paginas: { type: 'integer', example: 6 },
          },
        },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
