import { Prisma } from '@prisma/client';
import prisma from '../config/database.js';
import logger from '../shared/utils/logger.js';

interface AuditLogParams {
  usuarioId?: string | null;
  accion: string;
  modulo: string;
  recursoId?: string | null;
  ip?: string | null;
  detalle?: Record<string, unknown> | null;
  resultado: string;
}

export async function logAuditoria(params: AuditLogParams): Promise<void> {
  try {
    await prisma.logAuditoria.create({
      data: {
        usuario_id: params.usuarioId ?? null,
        accion: params.accion,
        modulo: params.modulo,
        recurso_id: params.recursoId ?? null,
        ip: params.ip ?? null,
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
