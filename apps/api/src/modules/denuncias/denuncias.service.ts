import type { estado_denuncia } from '@prisma/client';
import prisma from '../../config/database.js';
import { encrypt, decrypt } from '../../shared/utils/crypto.js';
import { generateUniqueTrackingCode } from '../../shared/utils/trackingCode.js';
import { parsePagination, buildPaginatedResponse } from '../../shared/utils/pagination.js';
import { sendEstadoDenunciaActualizado } from '../../shared/utils/ses.js';
import { logAuditoria } from '../../middleware/auditLog.js';
import { NotFoundError, AppError } from '../../shared/errors/AppError.js';
import { TRANSICIONES_DENUNCIA, ESTADOS_REQUIEREN_COMENTARIO, MODULO_SISTEMA } from '../../shared/constants/enums.js';
import type { CrearDenunciaPublicaInput, FiltrosDenunciasInput, CambiarEstadoInput } from './denuncias.validation.js';
import type { EvidenciaInput } from './denuncias.upload.js';

/** Parsea un GPS en formato "lat, lng" a números. Devuelve null si no es válido. */
function parseGps(gps: string | undefined): { lat: number; lng: number } | null {
  if (!gps) return null;
  const parts = gps.split(',').map((p) => Number(p.trim()));
  if (parts.length !== 2 || parts.some((n) => Number.isNaN(n))) return null;
  return { lat: parts[0]!, lng: parts[1]! };
}

/**
 * Convierte el texto de un point de PostgreSQL "(lat,lng)" a { lat, lng }.
 * Devuelve null si el valor es nulo o no parseable.
 */
function pointTextToCoords(raw: string | null | undefined): { lat: number; lng: number } | null {
  if (!raw) return null;
  const parts = raw.replace(/^\(/, '').replace(/\)$/, '').split(',').map((p) => Number(p.trim()));
  if (parts.length !== 2 || parts.some((n) => Number.isNaN(n))) return null;
  return { lat: parts[0]!, lng: parts[1]! };
}

/**
 * Lee la columna geométrica ubicacion_gps (Unsupported, no seleccionable por Prisma)
 * y la devuelve normalizada como "lat, lng", o null si no tiene valor.
 */
async function readGps(id: number): Promise<string | null> {
  const rows = await prisma.$queryRaw<{ gps: string | null }[]>`
    SELECT ubicacion_gps::text AS gps FROM "Denuncia" WHERE "IDDenuncia" = ${id}
  `;
  const coords = pointTextToCoords(rows[0]?.gps);
  return coords ? `${coords.lat}, ${coords.lng}` : null;
}

/**
 * RF-2.1 — Crear denuncia pública (anónima o autenticada).
 * Genera código de seguimiento único de 8 caracteres y cifra el contacto si se provee.
 */
export async function crearDenunciaPublica(
  datos: CrearDenunciaPublicaInput,
  evidencias: EvidenciaInput[],
  ip: string | undefined
) {
  const codigo_seguimiento = await generateUniqueTrackingCode();

  const contacto_cifrado = datos.contacto ? encrypt(datos.contacto) : null;

  // GPS llega como "lat, lng"; lo parseamos para guardarlo como geometría point.
  const coords = parseGps(datos.gps);

  const denuncia = await prisma.$transaction(async (tx) => {
    const creada = await tx.denuncia.create({
      data: {
        codigo_seguimiento,
        Descripcion: datos.Descripcion,
        tipo_actividad: datos.tipo_actividad,
        fecha_incidente: datos.fecha_incidente ? new Date(`${datos.fecha_incidente}T00:00:00Z`) : null,
        hora_aproximada: datos.hora_aproximada ? new Date(`1970-01-01T${datos.hora_aproximada}:00Z`) : null,
        detalle_ubicacion: datos.detalle_ubicacion ?? null,
        tipo_extraccion: datos.tipo_extraccion ?? null,
        numero_personas: datos.numero_personas ?? null,
        cantidad_arena: datos.cantidad_arena ?? null,
        nivel_urgencia: datos.nivel_urgencia ?? null,
        contacto_cifrado,
        IDZona: datos.IDZona ?? null,
        Fecha_denuncia: new Date(),
      },
      select: {
        IDDenuncia: true,
        codigo_seguimiento: true,
      },
    });

    // ubicacion_gps es Unsupported("point"); Prisma no lo escribe vía data, usamos SQL crudo.
    if (coords) {
      await tx.$executeRaw`UPDATE "Denuncia" SET ubicacion_gps = point(${coords.lat}, ${coords.lng}) WHERE "IDDenuncia" = ${creada.IDDenuncia}`;
    }

    // Persistir evidencias adjuntas (archivos ya guardados en disco por multer).
    if (evidencias.length > 0) {
      await tx.evidencia_Denuncia.createMany({
        data: evidencias.map((ev) => ({
          IDDenuncia: creada.IDDenuncia,
          archivo_url: ev.archivo_url,
          TipoArchivo: ev.TipoArchivo,
          tamano_bytes: ev.tamano_bytes,
          hash_archivo: ev.hash_archivo,
          metadata: ev.metadata,
        })),
      });
    }

    return creada;
  });

  await logAuditoria({
    accion: 'DENUNCIA_CREADA',
    modulo: MODULO_SISTEMA.DENUNCIAS,
    ip: ip ?? null,
    resultado: 'Exito',
    detalle: { IDDenuncia: denuncia.IDDenuncia, codigo_seguimiento: denuncia.codigo_seguimiento },
  });

  return {
    IDDenuncia: denuncia.IDDenuncia,
    codigo_seguimiento: denuncia.codigo_seguimiento,
    mensaje: 'Denuncia registrada correctamente. Guarde su código de seguimiento para consultar el estado.',
  };
}

/**
 * RF-2.6 — Consulta pública por código de seguimiento.
 * No expone contacto_cifrado ni datos sensibles.
 */
export async function getSeguimiento(codigo: string) {
  const denuncia = await prisma.denuncia.findUnique({
    where: { codigo_seguimiento: codigo },
    select: {
      IDDenuncia: true,
      codigo_seguimiento: true,
      Descripcion: true,
      tipo_actividad: true,
      Fecha_denuncia: true,
      fecha_incidente: true,
      hora_aproximada: true,
      detalle_ubicacion: true,
      tipo_extraccion: true,
      numero_personas: true,
      cantidad_arena: true,
      nivel_urgencia: true,
      Estado: true,
      IDZona: true,
      historial_estado_denuncia: {
        orderBy: { created_at: 'asc' },
        select: {
          id: true,
          estado_anterior: true,
          estado_nuevo: true,
          comentario: true,
          created_at: true,
        },
      },
      // RF-5.2 — Solo acciones correctivas publicadas (visibilidad Publico),
      // sin datos personales, para transparencia en la consulta pública.
      accion_denuncia: {
        where: { Accion_Correctiva: { visibilidad: 'Publico' } },
        select: {
          Accion_Correctiva: {
            select: {
              IDAccion: true,
              titulo: true,
              Estado: true,
              resumen_publico: true,
              FechaPlanificacion: true,
              FechaImplementacion: true,
            },
          },
        },
      },
    },
  });

  if (!denuncia) throw new NotFoundError('Denuncia');

  const gps = await readGps(denuncia.IDDenuncia);
  const { accion_denuncia, ...rest } = denuncia;
  const acciones = accion_denuncia.map((a) => a.Accion_Correctiva);
  return { ...rest, acciones, gps };
}

/**
 * RF-2.2 + RF-2.4 — Listado paginado con filtros opcionales.
 */
export async function listarDenuncias(filtros: FiltrosDenunciasInput) {
  const pagination = parsePagination({ pagina: filtros.pagina, por_pagina: filtros.por_pagina });

  const where: {
    Estado?: estado_denuncia;
    tipo_actividad?: 'Extraccion_Rio' | 'Extraccion_Playa' | 'Extraccion_Zona_Protegida' | 'Transporte_Ilegal' | 'Otro';
    Descripcion?: { contains: string; mode: 'insensitive' };
  } = {};

  if (filtros.estado) {
    where.Estado = filtros.estado as estado_denuncia;
  }

  if (filtros.tipo) {
    where.tipo_actividad = filtros.tipo;
  }

  if (filtros.q) {
    where.Descripcion = {
      contains: filtros.q,
      mode: 'insensitive',
    };
  }

  const [denuncias, total] = await Promise.all([
    prisma.denuncia.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { Fecha_denuncia: 'desc' },
      select: {
        IDDenuncia: true,
        codigo_seguimiento: true,
        Descripcion: true,
        tipo_actividad: true,
        Estado: true,
        Fecha_denuncia: true,
        hora_aproximada: true,
        IDZona: true,
      },
    }),
    prisma.denuncia.count({ where }),
  ]);

  return buildPaginatedResponse(denuncias, total, pagination);
}

/**
 * Listado ligero para el mapa: solo denuncias con coordenadas (ubicacion_gps).
 * Una sola consulta raw que lee la columna point y la normaliza a lat/lng,
 * evitando el N+1 de readGps por denuncia.
 */
export async function listarDenunciasMapa() {
  const rows = await prisma.$queryRaw<
    {
      IDDenuncia: number;
      codigo_seguimiento: string;
      Estado: estado_denuncia;
      tipo_actividad: string;
      nivel_urgencia: string | null;
      detalle_ubicacion: string | null;
      Descripcion: string;
      Fecha_denuncia: Date;
      gps: string | null;
    }[]
  >`
    SELECT "IDDenuncia", codigo_seguimiento, "Estado", tipo_actividad,
           nivel_urgencia, detalle_ubicacion, "Descripcion", "Fecha_denuncia",
           ubicacion_gps::text AS gps
    FROM "Denuncia"
    WHERE ubicacion_gps IS NOT NULL
    ORDER BY "Fecha_denuncia" DESC
  `;

  return rows.flatMap((row) => {
    const coords = pointTextToCoords(row.gps);
    if (!coords) return [];
    const { gps: _gps, ...rest } = row;
    return [{ ...rest, lat: coords.lat, lng: coords.lng }];
  });
}

/**
 * RF-2.2 — Detalle completo de una denuncia, con historial y evidencias.
 * Descifra contacto_cifrado para visualización autorizada.
 */
export async function getDenuncia(id: number) {
  const denuncia = await prisma.denuncia.findUnique({
    where: { IDDenuncia: id },
    select: {
      IDDenuncia: true,
      codigo_seguimiento: true,
      IDUsuario: true,
      IDZona: true,
      Descripcion: true,
      tipo_actividad: true,
      Fecha_denuncia: true,
      fecha_incidente: true,
      hora_aproximada: true,
      detalle_ubicacion: true,
      tipo_extraccion: true,
      numero_personas: true,
      cantidad_arena: true,
      nivel_urgencia: true,
      Estado: true,
      contacto_cifrado: true,
      historial_estado_denuncia: {
        orderBy: { created_at: 'asc' },
        select: {
          id: true,
          estado_anterior: true,
          estado_nuevo: true,
          comentario: true,
          created_at: true,
          Usuario: { select: { nombre_completo: true } },
        },
      },
      Evidencia_Denuncia: {
        select: {
          IDEvidencia: true,
          archivo_url: true,
          TipoArchivo: true,
          tamano_bytes: true,
          hash_archivo: true,
          fecha_carga: true,
        },
      },
      // RF-5.1 — Acciones correctivas vinculadas (visibles en el detalle de la denuncia).
      accion_denuncia: {
        select: {
          Accion_Correctiva: {
            select: {
              IDAccion: true,
              titulo: true,
              Estado: true,
              FechaPlanificacion: true,
            },
          },
        },
      },
    },
  });

  if (!denuncia) throw new NotFoundError('Denuncia');

  const { contacto_cifrado, historial_estado_denuncia, accion_denuncia, ...rest } = denuncia;
  const contacto = contacto_cifrado ? decrypt(contacto_cifrado) : null;
  const gps = await readGps(denuncia.IDDenuncia);

  // El frontend consume el historial bajo la clave `historial`.
  const acciones = accion_denuncia.map((a) => a.Accion_Correctiva);
  return { ...rest, historial: historial_estado_denuncia, acciones, contacto, gps };
}

/**
 * RF-2.3 — Cambio de estado mediante máquina de estados.
 * Valida transición con TRANSICIONES_DENUNCIA antes de aplicar.
 */
export async function cambiarEstado(
  id: number,
  datos: CambiarEstadoInput,
  usuarioId: string,
  ip: string | undefined
) {
  const denuncia = await prisma.denuncia.findUnique({
    where: { IDDenuncia: id },
    select: {
      IDDenuncia: true,
      Estado: true,
      codigo_seguimiento: true,
      contacto_cifrado: true,
    },
  });

  if (!denuncia) throw new NotFoundError('Denuncia');

  const estadoActual = denuncia.Estado as estado_denuncia;
  const estadoNuevo = datos.estado as estado_denuncia;

  const transicionesValidas = TRANSICIONES_DENUNCIA[estadoActual];
  if (!transicionesValidas.includes(estadoNuevo)) {
    throw new AppError(
      `Transición no permitida: ${estadoActual} → ${estadoNuevo}. Transiciones válidas: ${transicionesValidas.join(', ') || 'ninguna'}.`,
      422
    );
  }

  if (ESTADOS_REQUIEREN_COMENTARIO.includes(estadoNuevo) && !datos.comentario) {
    throw new AppError(`El estado "${estadoNuevo}" requiere un comentario explicativo.`, 422);
  }

  const [denunciaActualizada] = await prisma.$transaction([
    prisma.denuncia.update({
      where: { IDDenuncia: id },
      data: { Estado: estadoNuevo },
      select: {
        IDDenuncia: true,
        codigo_seguimiento: true,
        Estado: true,
      },
    }),
    prisma.historial_estado_denuncia.create({
      data: {
        IDDenuncia: id,
        IDUsuario: usuarioId,
        estado_anterior: estadoActual,
        estado_nuevo: estadoNuevo,
        comentario: datos.comentario ?? null,
      },
    }),
  ]);

  await logAuditoria({
    accion: 'DENUNCIA_ESTADO_CAMBIADO',
    modulo: MODULO_SISTEMA.DENUNCIAS,
    ip: ip ?? null,
    resultado: 'Exito',
    detalle: {
      IDDenuncia: id,
      estado_anterior: estadoActual,
      estado_nuevo: estadoNuevo,
      usuarioId,
    },
  });

  // Notify by email if there is an encrypted contact that looks like an email
  if (denuncia.contacto_cifrado) {
    try {
      const contacto = decrypt(denuncia.contacto_cifrado);
      if (contacto && contacto.includes('@')) {
        await sendEstadoDenunciaActualizado({
          correo: contacto,
          codigo: denuncia.codigo_seguimiento,
          nuevoEstado: estadoNuevo,
          comentario: datos.comentario ?? null,
        });
      }
    } catch {
      // Do not fail the request if email cannot be sent
    }
  }

  return {
    mensaje: 'Estado actualizado correctamente.',
    denuncia: denunciaActualizada,
  };
}

/**
 * Estadísticas de denuncias por estado.
 */
export async function getEstadisticas() {
  const [total, porEstado] = await Promise.all([
    prisma.denuncia.count(),
    prisma.denuncia.groupBy({
      by: ['Estado'],
      _count: { IDDenuncia: true },
    }),
  ]);

  const estadoMap: Record<string, number> = {
    Pendiente: 0,
    En_Investigacion: 0,
    Verificada: 0,
    Resuelta: 0,
    Desestimada: 0,
  };

  for (const grupo of porEstado) {
    estadoMap[grupo.Estado] = grupo._count.IDDenuncia;
  }

  return {
    total,
    por_estado: {
      Pendiente: estadoMap['Pendiente'] ?? 0,
      En_Investigacion: estadoMap['En_Investigacion'] ?? 0,
      Verificada: estadoMap['Verificada'] ?? 0,
      Resuelta: estadoMap['Resuelta'] ?? 0,
      Desestimada: estadoMap['Desestimada'] ?? 0,
    },
  };
}

/**
 * RF-2.5 — Exportar todas las denuncias sin paginación (con los mismos filtros opcionales).
 */
export async function exportarTodasDenuncias(
  filtros: Omit<FiltrosDenunciasInput, 'pagina' | 'por_pagina'>
) {
  const where: {
    Estado?: estado_denuncia;
    tipo_actividad?: 'Extraccion_Rio' | 'Extraccion_Playa' | 'Extraccion_Zona_Protegida' | 'Transporte_Ilegal' | 'Otro';
    Descripcion?: { contains: string; mode: 'insensitive' };
  } = {};

  if (filtros.estado) {
    where.Estado = filtros.estado as estado_denuncia;
  }

  if (filtros.tipo) {
    where.tipo_actividad = filtros.tipo;
  }

  if (filtros.q) {
    where.Descripcion = {
      contains: filtros.q,
      mode: 'insensitive',
    };
  }

  const [denuncias, total] = await Promise.all([
    prisma.denuncia.findMany({
      where,
      orderBy: { Fecha_denuncia: 'desc' },
      select: {
        IDDenuncia: true,
        codigo_seguimiento: true,
        tipo_actividad: true,
        Estado: true,
        Fecha_denuncia: true,
        hora_aproximada: true,
        Descripcion: true,
        IDZona: true,
      },
    }),
    prisma.denuncia.count({ where }),
  ]);

  return { data: denuncias, total };
}
