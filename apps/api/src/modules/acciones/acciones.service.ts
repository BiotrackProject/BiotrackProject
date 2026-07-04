import prisma from '../../config/database.js';
import { logAuditoria } from '../../middleware/auditLog.js';
import { NotFoundError, ForbiddenError, AppError } from '../../shared/errors/AppError.js';
import { parsePagination, buildPaginatedResponse } from '../../shared/utils/pagination.js';
import { MODULO_SISTEMA } from '../../shared/constants/enums.js';
import type {
  CrearAccionInput,
  ActualizarAccionInput,
  CambiarEstadoAccionInput,
  PublicarAccionInput,
} from './acciones.validation.js';
import { type estado_accion, type Prisma } from '@prisma/client';
import type { EvidenciaAccionInput } from './acciones.upload.js';

// Valid state machine transitions for acciones correctivas
const TRANSICIONES_ACCION: Record<estado_accion, estado_accion[]> = {
  Planificada: ['En_Ejecucion', 'Cancelada'],
  En_Ejecucion: ['Completada', 'Cancelada'],
  Completada: [],
  Cancelada: [],
};

/**
 * RF-5.1 — Listar acciones correctivas con filtros opcionales.
 * Paginated. Filterable by estado and search query (titulo/descripcion_accion).
 */
export async function listarAcciones(
  _usuarioId: string,
  filtros: Record<string, unknown>
) {
  const pagination = parsePagination(filtros);

  // Build where clause dynamically using Prisma's WhereInput type
  const whereParts: Prisma.Accion_CorrectivaWhereInput[] = [];

  if (filtros['estado']) {
    whereParts.push({ Estado: String(filtros['estado']) as estado_accion });
  }

  if (filtros['q']) {
    const q = String(filtros['q']);
    whereParts.push({
      OR: [
        { titulo: { contains: q, mode: 'insensitive' } },
        { descripcion_accion: { contains: q, mode: 'insensitive' } },
      ],
    });
  }

  const where: Prisma.Accion_CorrectivaWhereInput =
    whereParts.length > 0 ? { AND: whereParts } : {};

  const [acciones, total] = await Promise.all([
    prisma.accion_Correctiva.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { created_at: 'desc' },
      select: {
        IDAccion: true,
        titulo: true,
        descripcion_accion: true,
        Estado: true,
        FechaPlanificacion: true,
        FechaImplementacion: true,
        visibilidad: true,
        Presupuesto: true,
        created_at: true,
        Usuario: {
          select: { nombre_completo: true },
        },
        _count: {
          select: { accion_denuncia: true },
        },
      },
    }),
    prisma.accion_Correctiva.count({ where }),
  ]);

  return buildPaginatedResponse(acciones, total, pagination);
}

/**
 * RF-5.1 — Crear una nueva acción correctiva.
 * El responsable es el usuario autenticado que crea la acción.
 */
export async function crearAccion(
  datos: CrearAccionInput,
  evidencias: EvidenciaAccionInput[],
  usuarioId: string,
  ip: string | undefined
) {
  const { denunciaIds, zonaIds, FechaPlanificacion, FechaImplementacion, Presupuesto, ...rest } =
    datos;

  const accion = await prisma.accion_Correctiva.create({
    data: {
      titulo: rest.titulo,
      descripcion_accion: rest.descripcion_accion ?? null,
      resumen_publico: rest.resumen_publico ?? null,
      responsable_id: usuarioId,
      FechaPlanificacion: FechaPlanificacion ? new Date(FechaPlanificacion) : null,
      FechaImplementacion: FechaImplementacion ? new Date(FechaImplementacion) : null,
      Presupuesto: Presupuesto ?? null,
      ...(denunciaIds && denunciaIds.length > 0
        ? {
            accion_denuncia: {
              create: denunciaIds.map((id) => ({ IDDenuncia: id })),
            },
          }
        : {}),
      ...(zonaIds && zonaIds.length > 0
        ? {
            accion_zona: {
              create: zonaIds.map((id) => ({ IDZona: id })),
            },
          }
        : {}),
      ...(evidencias.length > 0
        ? {
            Evidencia_Accion: {
              create: evidencias.map((e) => ({
                archivo_url: e.archivo_url,
                TipoArchivo: e.TipoArchivo,
                tamano_bytes: e.tamano_bytes,
                hash_archivo: e.hash_archivo,
              })),
            },
          }
        : {}),
    },
    include: {
      Usuario: { select: { nombre_completo: true, correo_electronico: true } },
      _count: { select: { accion_denuncia: true, accion_zona: true, Evidencia_Accion: true } },
    },
  });

  await logAuditoria({
    accion: 'ACCION_CREADA',
    modulo: MODULO_SISTEMA.ACCIONES,
    ip: ip ?? null,
    resultado: 'Exito',
    detalle: { IDAccion: accion.IDAccion, titulo: accion.titulo },
  });

  return accion;
}

/**
 * RF-5.1 — Obtener detalle completo de una acción correctiva.
 */
export async function getAccion(id: string) {
  const accion = await prisma.accion_Correctiva.findUnique({
    where: { IDAccion: id },
    include: {
      Usuario: {
        select: {
          IDUsuario: true,
          nombre_completo: true,
          correo_electronico: true,
          cargo: true,
          institucion: true,
        },
      },
      accion_denuncia: {
        include: {
          Denuncia: {
            select: {
              IDDenuncia: true,
              codigo_seguimiento: true,
              Estado: true,
              tipo_actividad: true,
            },
          },
        },
      },
      accion_zona: { select: { IDZona: true } },
      Evidencia_Accion: true,
    },
  });

  if (!accion) throw new NotFoundError('Acción Correctiva');
  return accion;
}

/**
 * RF-5.1 — Actualizar parcialmente una acción correctiva.
 * Solo el responsable puede modificarla.
 */
export async function actualizarAccion(
  id: string,
  datos: ActualizarAccionInput,
  usuarioId: string,
  ip: string | undefined
) {
  const accion = await prisma.accion_Correctiva.findUnique({
    where: { IDAccion: id },
    select: { IDAccion: true, responsable_id: true },
  });

  if (!accion) throw new NotFoundError('Acción Correctiva');

  if (accion.responsable_id !== usuarioId) {
    throw new ForbiddenError('Solo el responsable puede modificar esta acción.');
  }

  const { denunciaIds, zonaIds, FechaPlanificacion, FechaImplementacion, Presupuesto, ...rest } =
    datos;

  const actualizada = await prisma.accion_Correctiva.update({
    where: { IDAccion: id },
    data: {
      ...(rest.titulo !== undefined ? { titulo: rest.titulo } : {}),
      ...(rest.descripcion_accion !== undefined ? { descripcion_accion: rest.descripcion_accion ?? null } : {}),
      ...(rest.resumen_publico !== undefined ? { resumen_publico: rest.resumen_publico ?? null } : {}),
      ...(FechaPlanificacion !== undefined
        ? { FechaPlanificacion: FechaPlanificacion ? new Date(FechaPlanificacion) : null }
        : {}),
      ...(FechaImplementacion !== undefined
        ? { FechaImplementacion: FechaImplementacion ? new Date(FechaImplementacion) : null }
        : {}),
      ...(Presupuesto !== undefined ? { Presupuesto } : {}),
      // Vínculos: si llega el array, se reemplaza el conjunto completo (deleteMany + create).
      ...(denunciaIds !== undefined
        ? {
            accion_denuncia: {
              deleteMany: {},
              create: denunciaIds.map((idDen) => ({ IDDenuncia: idDen })),
            },
          }
        : {}),
      ...(zonaIds !== undefined
        ? {
            accion_zona: {
              deleteMany: {},
              create: zonaIds.map((idZona) => ({ IDZona: idZona })),
            },
          }
        : {}),
    },
    include: {
      Usuario: { select: { nombre_completo: true } },
    },
  });

  await logAuditoria({
    accion: 'ACCION_ACTUALIZADA',
    modulo: MODULO_SISTEMA.ACCIONES,
    ip: ip ?? null,
    resultado: 'Exito',
    detalle: { IDAccion: id, campos: Object.keys(datos) },
  });

  return actualizada;
}

/**
 * RF-5.3 — Cambiar estado de una acción correctiva.
 * Validates state machine: Planificada→En_Ejecucion|Cancelada, En_Ejecucion→Completada|Cancelada.
 */
export async function cambiarEstadoAccion(
  id: string,
  datos: CambiarEstadoAccionInput,
  _usuarioId: string,
  ip: string | undefined
) {
  const accion = await prisma.accion_Correctiva.findUnique({
    where: { IDAccion: id },
    select: { IDAccion: true, Estado: true, responsable_id: true },
  });

  if (!accion) throw new NotFoundError('Acción Correctiva');

  const nuevoEstado = datos.estado as estado_accion;
  const estadosValidos = TRANSICIONES_ACCION[accion.Estado];

  if (!estadosValidos.includes(nuevoEstado)) {
    throw new AppError(
      `Transición de estado inválida: ${accion.Estado} → ${nuevoEstado}. ` +
        `Transiciones permitidas: ${estadosValidos.join(', ') || 'ninguna'}.`,
      422
    );
  }

  const actualizada = await prisma.accion_Correctiva.update({
    where: { IDAccion: id },
    data: {
      Estado: nuevoEstado,
      ...(datos.Resultado !== undefined ? { Resultado: datos.Resultado } : {}),
    },
    select: {
      IDAccion: true,
      titulo: true,
      Estado: true,
      Resultado: true,
      updated_at: true,
    },
  });

  await logAuditoria({
    accion: 'ACCION_ESTADO_CAMBIADO',
    modulo: MODULO_SISTEMA.ACCIONES,
    ip: ip ?? null,
    resultado: 'Exito',
    detalle: { IDAccion: id, estadoAnterior: accion.Estado, estadoNuevo: nuevoEstado },
  });

  return actualizada;
}

/**
 * RF-5.2 — Publicar una acción correctiva (visibilidad = Publico).
 */
export async function publicarAccion(
  id: string,
  datos: PublicarAccionInput,
  _usuarioId: string,
  ip: string | undefined
) {
  const accion = await prisma.accion_Correctiva.findUnique({
    where: { IDAccion: id },
    select: { IDAccion: true },
  });

  if (!accion) throw new NotFoundError('Acción Correctiva');

  const actualizada = await prisma.accion_Correctiva.update({
    where: { IDAccion: id },
    data: {
      visibilidad: 'Publico',
      resumen_publico: datos.resumen_publico,
    },
    select: {
      IDAccion: true,
      titulo: true,
      visibilidad: true,
      resumen_publico: true,
      updated_at: true,
    },
  });

  await logAuditoria({
    accion: 'ACCION_PUBLICADA',
    modulo: MODULO_SISTEMA.ACCIONES,
    ip: ip ?? null,
    resultado: 'Exito',
    detalle: { IDAccion: id },
  });

  return actualizada;
}

/**
 * RF-5.2 — Despublicar una acción correctiva (visibilidad = Restringido).
 */
export async function despublicarAccion(
  id: string,
  _usuarioId: string,
  ip: string | undefined
) {
  const accion = await prisma.accion_Correctiva.findUnique({
    where: { IDAccion: id },
    select: { IDAccion: true },
  });

  if (!accion) throw new NotFoundError('Acción Correctiva');

  const actualizada = await prisma.accion_Correctiva.update({
    where: { IDAccion: id },
    data: { visibilidad: 'Restringido' },
    select: {
      IDAccion: true,
      titulo: true,
      visibilidad: true,
      updated_at: true,
    },
  });

  await logAuditoria({
    accion: 'ACCION_DESPUBLICADA',
    modulo: MODULO_SISTEMA.ACCIONES,
    ip: ip ?? null,
    resultado: 'Exito',
    detalle: { IDAccion: id },
  });

  return actualizada;
}

/**
 * RF-5.2 — Endpoint público: obtener acción solo si es pública.
 * Retorna subconjunto de campos sin detalles internos.
 */
export async function getAccionPublica(id: string) {
  const accion = await prisma.accion_Correctiva.findUnique({
    where: { IDAccion: id },
    select: {
      IDAccion: true,
      titulo: true,
      resumen_publico: true,
      Estado: true,
      FechaPlanificacion: true,
      FechaImplementacion: true,
      visibilidad: true,
      // Institución (dato institucional, no personal). Se omite nombre_completo
      // del responsable para no exponer datos personales (RF-5.2 / TC-AC-003).
      Usuario: { select: { institucion: true } },
      accion_denuncia: {
        select: {
          Denuncia: {
            select: { codigo_seguimiento: true, tipo_actividad: true, Estado: true },
          },
        },
      },
      accion_zona: { select: { IDZona: true } },
    },
  });

  if (!accion) throw new NotFoundError('Acción Correctiva');

  if (accion.visibilidad !== 'Publico') {
    throw new NotFoundError('Acción Correctiva');
  }

  // Aplanar vínculos a formato público sin datos personales.
  const { accion_denuncia, accion_zona, Usuario, ...rest } = accion;
  return {
    ...rest,
    institucion: Usuario?.institucion ?? null,
    denuncias: accion_denuncia.map((a) => a.Denuncia),
    zonas: accion_zona.map((z) => z.IDZona),
  };
}
