import { describe, it, expect } from '@jest/globals';
import { parsePagination, buildPaginatedResponse } from '../../src/shared/utils/pagination.js';

describe('parsePagination', () => {
  it('returns defaults when query is empty', () => {
    const result = parsePagination({});
    expect(result.pagina).toBe(1);
    expect(result.por_pagina).toBe(25);
    expect(result.skip).toBe(0);
    expect(result.take).toBe(25);
  });

  it('parses pagina and por_pagina correctly', () => {
    const result = parsePagination({ pagina: '3', por_pagina: '50' });
    expect(result.pagina).toBe(3);
    expect(result.por_pagina).toBe(50);
    expect(result.skip).toBe(100);
    expect(result.take).toBe(50);
  });

  it('clamps pagina to minimum 1 for zero', () => {
    expect(parsePagination({ pagina: '0' }).pagina).toBe(1);
  });

  it('clamps pagina to minimum 1 for negative values', () => {
    expect(parsePagination({ pagina: '-5' }).pagina).toBe(1);
  });

  it('falls back to 25 for disallowed por_pagina values', () => {
    expect(parsePagination({ por_pagina: '7' }).por_pagina).toBe(25);
    expect(parsePagination({ por_pagina: '200' }).por_pagina).toBe(25);
  });

  it('falls back to 25 for non-numeric por_pagina', () => {
    expect(parsePagination({ por_pagina: 'abc' }).por_pagina).toBe(25);
  });

  it('accepts all four allowed por_pagina values', () => {
    expect(parsePagination({ por_pagina: '10' }).por_pagina).toBe(10);
    expect(parsePagination({ por_pagina: '25' }).por_pagina).toBe(25);
    expect(parsePagination({ por_pagina: '50' }).por_pagina).toBe(50);
    expect(parsePagination({ por_pagina: '100' }).por_pagina).toBe(100);
  });

  it('calculates skip correctly for page 2', () => {
    const result = parsePagination({ pagina: '2', por_pagina: '10' });
    expect(result.skip).toBe(10);
  });
});

describe('buildPaginatedResponse', () => {
  it('builds correct pagination metadata', () => {
    const response = buildPaginatedResponse(['a', 'b'], 50, { pagina: 2, por_pagina: 25 });
    expect(response.data).toEqual(['a', 'b']);
    expect(response.paginacion.total).toBe(50);
    expect(response.paginacion.pagina).toBe(2);
    expect(response.paginacion.por_pagina).toBe(25);
    expect(response.paginacion.total_paginas).toBe(2);
  });

  it('calculates total_paginas correctly with remainder', () => {
    const result = buildPaginatedResponse([], 101, { pagina: 1, por_pagina: 10 });
    expect(result.paginacion.total_paginas).toBe(11);
  });

  it('returns total_paginas of 0 when total is 0', () => {
    const result = buildPaginatedResponse([], 0, { pagina: 1, por_pagina: 25 });
    expect(result.paginacion.total_paginas).toBe(0);
  });

  it('preserves the data array as-is', () => {
    const data = [{ id: '1' }, { id: '2' }];
    const result = buildPaginatedResponse(data, 2, { pagina: 1, por_pagina: 25 });
    expect(result.data).toBe(data);
  });
});
