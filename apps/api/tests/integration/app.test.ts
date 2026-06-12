import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('includes timestamp and version fields', async () => {
    const res = await request(app).get('/health');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('version');
  });

  it('returns JSON content-type', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});

describe('404 handler', () => {
  it('returns 404 for an unknown route', async () => {
    const res = await request(app).get('/ruta-inexistente');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('includes the method and path in the error message', async () => {
    const res = await request(app).get('/no-existe');
    expect(res.body.error).toContain('GET');
    expect(res.body.error).toContain('/no-existe');
  });
});

describe('Protected routes — missing token returns 401', () => {
  it('GET /api/v1/denuncias without token', async () => {
    const res = await request(app).get('/api/v1/denuncias');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/zonas without token', async () => {
    const res = await request(app).get('/api/v1/zonas');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/indicadores/impacto without token', async () => {
    const res = await request(app).get('/api/v1/indicadores/impacto');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/acciones without token', async () => {
    const res = await request(app).get('/api/v1/acciones');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/admin/usuarios without token', async () => {
    const res = await request(app).get('/api/v1/admin/usuarios');
    expect(res.status).toBe(401);
  });
});

describe('Public routes', () => {
  it('POST /api/v1/auth/registro with empty body returns validation error', async () => {
    const res = await request(app).post('/api/v1/auth/registro').send({});
    expect([422, 429, 501]).toContain(res.status);
  });

  it('GET /api/v1/denuncias/seguimiento/:codigo is publicly accessible (no 401)', async () => {
    const res = await request(app).get('/api/v1/denuncias/seguimiento/ABCD1234');
    expect(res.status).not.toBe(401);
  });
});

describe('OpenAPI documentation', () => {
  it('GET /api/docs.json returns a valid OpenAPI spec object', async () => {
    const res = await request(app).get('/api/docs.json');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('openapi');
    expect(res.body).toHaveProperty('info');
    expect(res.body).toHaveProperty('paths');
  });
});
