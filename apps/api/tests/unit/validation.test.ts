import { describe, it, expect } from '@jest/globals';
import { registroSchema, updatePerfilSchema } from '../../src/modules/auth/auth.validation.js';

const validRegistro = {
  nombre_completo: 'Juan Pérez',
  correo_electronico: 'juan@mimarena.gob.do',
  cargo: 'Técnico de Campo',
  institucion: 'MIMARENA',
};

describe('registroSchema', () => {
  it('accepts a valid registration payload', () => {
    expect(() => registroSchema.parse(validRegistro)).not.toThrow();
  });

  it('lowercases the email address', () => {
    const result = registroSchema.parse({
      ...validRegistro,
      correo_electronico: 'JUAN@MIMARENA.GOB.DO',
    });
    expect(result.correo_electronico).toBe('juan@mimarena.gob.do');
  });

  it('rejects an invalid email format', () => {
    expect(() =>
      registroSchema.parse({ ...validRegistro, correo_electronico: 'no-es-un-email' })
    ).toThrow();
  });

  it('rejects nombre_completo that contains numbers', () => {
    expect(() =>
      registroSchema.parse({ ...validRegistro, nombre_completo: 'Juan123' })
    ).toThrow();
  });

  it('rejects nombre_completo shorter than 3 characters', () => {
    expect(() =>
      registroSchema.parse({ ...validRegistro, nombre_completo: 'Ab' })
    ).toThrow();
  });

  it('rejects nombre_completo longer than 100 characters', () => {
    expect(() =>
      registroSchema.parse({ ...validRegistro, nombre_completo: 'A'.repeat(101) })
    ).toThrow();
  });

  it('rejects missing correo_electronico', () => {
    const { correo_electronico: _, ...rest } = validRegistro;
    expect(() => registroSchema.parse(rest)).toThrow();
  });

  it('rejects empty cargo', () => {
    expect(() => registroSchema.parse({ ...validRegistro, cargo: '' })).toThrow();
  });

  it('accepts nombres with accents and hyphens', () => {
    expect(() =>
      registroSchema.parse({ ...validRegistro, nombre_completo: 'María-José Núñez' })
    ).not.toThrow();
  });
});

describe('updatePerfilSchema', () => {
  it('accepts an empty object (all fields are optional)', () => {
    expect(() => updatePerfilSchema.parse({})).not.toThrow();
  });

  it('accepts a valid telefono in E.164 format', () => {
    expect(() =>
      updatePerfilSchema.parse({ telefono: '+18091234567' })
    ).not.toThrow();
  });

  it('rejects telefono without + prefix', () => {
    expect(() =>
      updatePerfilSchema.parse({ telefono: '18091234567' })
    ).toThrow();
  });

  it('rejects telefono that is too short', () => {
    expect(() =>
      updatePerfilSchema.parse({ telefono: '+123' })
    ).toThrow();
  });

  it('accepts a valid nombre_completo update', () => {
    expect(() =>
      updatePerfilSchema.parse({ nombre_completo: 'Pedro Sánchez' })
    ).not.toThrow();
  });

  it('accepts null telefono (removal)', () => {
    expect(() =>
      updatePerfilSchema.parse({ telefono: null })
    ).not.toThrow();
  });
});
