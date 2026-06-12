import { describe, it, expect } from '@jest/globals';
import {
  TRANSICIONES_DENUNCIA,
  ESTADOS_REQUIEREN_COMENTARIO,
  MODULO_SISTEMA,
  ACCION_PERMISO,
  NIVEL_RIESGO,
  TIPO_SENSOR,
  TIPO_ACTIVIDAD,
  ESTADO_DENUNCIA,
  ESTADO_USUARIO,
} from '../../src/shared/constants/enums.js';

describe('TRANSICIONES_DENUNCIA — máquina de estados RF-2.3', () => {
  it('PENDIENTE solo puede transicionar a EN_INVESTIGACION', () => {
    expect(TRANSICIONES_DENUNCIA.PENDIENTE).toEqual(['EN_INVESTIGACION']);
  });

  it('EN_INVESTIGACION puede ir a VERIFICADA o DESESTIMADA', () => {
    expect(TRANSICIONES_DENUNCIA.EN_INVESTIGACION).toContain('VERIFICADA');
    expect(TRANSICIONES_DENUNCIA.EN_INVESTIGACION).toContain('DESESTIMADA');
    expect(TRANSICIONES_DENUNCIA.EN_INVESTIGACION).toHaveLength(2);
  });

  it('VERIFICADA puede ir a RESUELTA o DESESTIMADA', () => {
    expect(TRANSICIONES_DENUNCIA.VERIFICADA).toContain('RESUELTA');
    expect(TRANSICIONES_DENUNCIA.VERIFICADA).toContain('DESESTIMADA');
  });

  it('RESUELTA es un estado terminal sin transiciones', () => {
    expect(TRANSICIONES_DENUNCIA.RESUELTA).toHaveLength(0);
  });

  it('DESESTIMADA es un estado terminal sin transiciones', () => {
    expect(TRANSICIONES_DENUNCIA.DESESTIMADA).toHaveLength(0);
  });

  it('PENDIENTE no puede ir directamente a RESUELTA (salto inválido)', () => {
    expect(TRANSICIONES_DENUNCIA.PENDIENTE).not.toContain('RESUELTA');
  });

  it('PENDIENTE no puede ir directamente a DESESTIMADA', () => {
    expect(TRANSICIONES_DENUNCIA.PENDIENTE).not.toContain('DESESTIMADA');
  });
});

describe('ESTADOS_REQUIEREN_COMENTARIO', () => {
  it('RESUELTA requiere comentario', () => {
    expect(ESTADOS_REQUIEREN_COMENTARIO).toContain('RESUELTA');
  });

  it('DESESTIMADA requiere comentario', () => {
    expect(ESTADOS_REQUIEREN_COMENTARIO).toContain('DESESTIMADA');
  });

  it('PENDIENTE no requiere comentario', () => {
    expect(ESTADOS_REQUIEREN_COMENTARIO).not.toContain('PENDIENTE');
  });

  it('EN_INVESTIGACION no requiere comentario', () => {
    expect(ESTADOS_REQUIEREN_COMENTARIO).not.toContain('EN_INVESTIGACION');
  });
});

describe('Constantes de enums', () => {
  it('MODULO_SISTEMA tiene exactamente 6 módulos (según SRS)', () => {
    expect(Object.keys(MODULO_SISTEMA)).toHaveLength(6);
  });

  it('ACCION_PERMISO tiene exactamente 7 acciones', () => {
    expect(Object.keys(ACCION_PERMISO)).toHaveLength(7);
  });

  it('NIVEL_RIESGO tiene los 4 niveles esperados', () => {
    expect(NIVEL_RIESGO.BAJO).toBe('BAJO');
    expect(NIVEL_RIESGO.MEDIO).toBe('MEDIO');
    expect(NIVEL_RIESGO.ALTO).toBe('ALTO');
    expect(NIVEL_RIESGO.CRITICO).toBe('CRITICO');
  });

  it('TIPO_SENSOR incluye GPS_TRACKER y AUDIO', () => {
    expect(TIPO_SENSOR.GPS_TRACKER).toBe('GPS_TRACKER');
    expect(TIPO_SENSOR.AUDIO).toBe('AUDIO');
  });

  it('TIPO_ACTIVIDAD incluye extracción en zona protegida', () => {
    expect(TIPO_ACTIVIDAD.EXTRACCION_ZONA_PROTEGIDA).toBe('EXTRACCION_ZONA_PROTEGIDA');
  });

  it('ESTADO_DENUNCIA tiene los 5 estados del flujo', () => {
    expect(Object.keys(ESTADO_DENUNCIA)).toHaveLength(5);
  });

  it('ESTADO_USUARIO tiene los 3 estados de usuario', () => {
    expect(Object.keys(ESTADO_USUARIO)).toHaveLength(3);
  });
});
