import { Prisma } from '@prisma/client';
import prisma from '../config/database.js';
import logger from '../shared/utils/logger.js';

interface AuditLogParams {
  accion: string;
  modulo: string;
  ip?: string | null;
  detalle?: Record<string, unknown> | null;
  resultado: 'Exito' | 'Fallo';
}

export async function logAuditoria(params: AuditLogParams): Promise<void> {
  try {
    await prisma.log_auditoria.create({
      data: {
        accion: params.accion,
        modulo: params.modulo,
        ip_address: params.ip ?? null,
        ...(params.detalle !== undefined
          ? { detalle: params.detalle !== null ? (params.detalle as Prisma.InputJsonValue) : Prisma.DbNull }
          : {}),
        resultado: params.resultado,
      },
    });
  } catch (err) {
    logger.error({ err }, 'Error al guardar log de auditoría');
  }
}
