import prisma from '../../config/database.js';
import { Prisma } from '@prisma/client';

/**
 * RF-4.1 — Dashboard KPIs: counts agregados de todas las entidades principales.
 * Uses a transaction for consistency across all reads.
 */
export async function getResumen() {
  const [
    totalDenuncias,
    pendientes,
    enInvestigacion,
    verificadas,
    resueltas,
    desestimadas,
    totalAcciones,
    accionesPlanificadas,
    accionesEnEjecucion,
    accionesCompletadas,
    accionesCanceladas,
    totalUsuarios,
    usuariosActivos,
    solicitudesPendientes,
  ] = await prisma.$transaction([
    prisma.denuncia.count(),
    prisma.denuncia.count({ where: { Estado: 'Pendiente' } }),
    prisma.denuncia.count({ where: { Estado: 'En_Investigacion' } }),
    prisma.denuncia.count({ where: { Estado: 'Verificada' } }),
    prisma.denuncia.count({ where: { Estado: 'Resuelta' } }),
    prisma.denuncia.count({ where: { Estado: 'Desestimada' } }),
    prisma.accion_Correctiva.count(),
    prisma.accion_Correctiva.count({ where: { Estado: 'Planificada' } }),
    prisma.accion_Correctiva.count({ where: { Estado: 'En_Ejecucion' } }),
    prisma.accion_Correctiva.count({ where: { Estado: 'Completada' } }),
    prisma.accion_Correctiva.count({ where: { Estado: 'Cancelada' } }),
    prisma.usuario.count(),
    prisma.usuario.count({ where: { Estado: 'Activo' } }),
    prisma.solicitud_registro.count({ where: { estado: 'Pendiente_Aprobacion' } }),
  ]);

  return {
    totalDenuncias,
    por_estado: {
      Pendiente: pendientes,
      En_Investigacion: enInvestigacion,
      Verificada: verificadas,
      Resuelta: resueltas,
      Desestimada: desestimadas,
    },
    totalAcciones,
    por_estado_accion: {
      Planificada: accionesPlanificadas,
      En_Ejecucion: accionesEnEjecucion,
      Completada: accionesCompletadas,
      Cancelada: accionesCanceladas,
    },
    totalUsuarios,
    usuariosActivos,
    solicitudesPendientes,
  };
}

/**
 * RF-4.2 — Impacto: conteo de denuncias agrupadas por tipo_actividad.
 * Uses individual counts to avoid groupBy typing issues with Prisma 7.
 */
export async function getImpacto() {
  type ImpactoRow = { tipo_actividad: string; total: bigint };

  const rows = await prisma.$queryRaw<ImpactoRow[]>(
    Prisma.sql`
      SELECT tipo_actividad::text AS tipo_actividad, COUNT(*) AS total
      FROM "Denuncia"
      GROUP BY tipo_actividad
      ORDER BY total DESC
    `
  );

  return rows.map((row) => ({
    tipo_actividad: row.tipo_actividad,
    total: Number(row.total),
  }));
}

/**
 * RF-4.3 — Frecuencia: conteo de denuncias agrupadas por mes (últimos 12 meses).
 * Uses $queryRaw for PostgreSQL DATE_TRUNC support.
 */
export async function getFrecuencia() {
  type FrecuenciaRow = { mes: Date; total: bigint };

  const rows = await prisma.$queryRaw<FrecuenciaRow[]>(
    Prisma.sql`
      SELECT DATE_TRUNC('month', "Fecha_denuncia") AS mes, COUNT(*) AS total
      FROM "Denuncia"
      WHERE "Fecha_denuncia" >= NOW() - INTERVAL '12 months'
      GROUP BY mes
      ORDER BY mes ASC
    `
  );

  const MESES_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  return rows.map((row) => {
    const fecha = new Date(row.mes);
    return {
      mes: MESES_ES[fecha.getUTCMonth()],
      año: fecha.getUTCFullYear(),
      total: Number(row.total),
    };
  });
}

/**
 * RF-4.4 — Cobertura: conteo de denuncias agrupadas por estado.
 * Uses $queryRaw to avoid Prisma 7 groupBy strict typing.
 */
export async function getCobertura() {
  type CoberturaRow = { estado: string; total: bigint };

  const rows = await prisma.$queryRaw<CoberturaRow[]>(
    Prisma.sql`
      SELECT "Estado"::text AS estado, COUNT(*) AS total
      FROM "Denuncia"
      GROUP BY "Estado"
      ORDER BY total DESC
    `
  );

  return rows.map((row) => ({
    estado: row.estado,
    total: Number(row.total),
  }));
}

/**
 * RF-4.4 — Volumen: conteo de acciones por estado y denuncias vinculadas a acciones.
 * Uses $queryRaw to avoid Prisma 7 groupBy strict typing.
 */
export async function getVolumen() {
  type VolumenRow = { estado: string; total: bigint };

  const [gruposAcciones, denunciasVinculadas] = await prisma.$transaction([
    prisma.$queryRaw<VolumenRow[]>(
      Prisma.sql`
        SELECT "Estado"::text AS estado, COUNT(*) AS total
        FROM "Accion_Correctiva"
        GROUP BY "Estado"
        ORDER BY total DESC
      `
    ),
    prisma.accion_denuncia.count(),
  ]);

  return {
    acciones_por_estado: (gruposAcciones as VolumenRow[]).map((row) => ({
      estado: row.estado,
      total: Number(row.total),
    })),
    denuncias_vinculadas_a_acciones: denunciasVinculadas,
  };
}
