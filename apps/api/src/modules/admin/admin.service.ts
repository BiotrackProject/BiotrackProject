import bcrypt from 'bcryptjs';
import type { estado_solicitud } from '@prisma/client';
import prisma from '../../config/database.js';
import { logAuditoria } from '../../middleware/auditLog.js';
import { sendRegistroAprobado, sendRegistroRechazado } from '../../shared/utils/email.js';
import { NotFoundError, ConflictError, AppError } from '../../shared/errors/AppError.js';
import { MODULO_SISTEMA } from '../../shared/constants/enums.js';
import type {
  CrearUsuarioInput,
  ActualizarUsuarioInput,
  AsignarRolInput,
  RevisarSolicitudInput,
} from './admin.validation.js';

const BCRYPT_COST = 12;

/**
 * RF-6.1 — Listar todos los usuarios con su rol.
 */
export async function listarUsuarios(q?: string) {
  const usuarios = await prisma.usuario.findMany({
    ...(q
      ? {
          where: {
            OR: [
              { nombre_completo: { contains: q, mode: 'insensitive' } },
              { correo_electronico: { contains: q, mode: 'insensitive' } },
              { cargo: { contains: q, mode: 'insensitive' } },
              { institucion: { contains: q, mode: 'insensitive' } },
            ],
          },
        }
      : {}),
    orderBy: { Fecha_creacion: 'desc' },
    select: {
      IDUsuario: true,
      nombre_completo: true,
      correo_electronico: true,
      cargo: true,
      institucion: true,
      telefono: true,
      Estado: true,
      Fecha_creacion: true,
      Ultimo_acceso: true,
      rol: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
  });

  return usuarios;
}

/**
 * RF-6.1 — Crear usuario directamente (sin pasar por solicitud).
 */
export async function crearUsuario(datos: CrearUsuarioInput, adminId: string, ip: string | undefined) {
  const usuarioExistente = await prisma.usuario.findUnique({
    where: { correo_electronico: datos.correo_electronico },
    select: { IDUsuario: true },
  });

  if (usuarioExistente) {
    throw new ConflictError('Ya existe un usuario con este correo electrónico.');
  }

  const rolExistente = await prisma.rol.findUnique({
    where: { id: datos.rol_id },
    select: { id: true },
  });

  if (!rolExistente) {
    throw new NotFoundError('Rol');
  }

  const contrasena_hash = await bcrypt.hash(datos.contrasena, BCRYPT_COST);

  const usuario = await prisma.usuario.create({
    data: {
      nombre_completo: datos.nombre_completo,
      correo_electronico: datos.correo_electronico,
      contrasena_hash,
      rol_id: datos.rol_id,
      cargo: datos.cargo ?? null,
      institucion: datos.institucion ?? null,
      telefono: datos.telefono ?? null,
      Estado: 'Activo',
    },
    select: {
      IDUsuario: true,
      nombre_completo: true,
      correo_electronico: true,
      cargo: true,
      institucion: true,
      telefono: true,
      Estado: true,
      Fecha_creacion: true,
      rol: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
  });

  await logAuditoria({
    accion: 'USUARIO_CREADO',
    modulo: MODULO_SISTEMA.ADMIN,
    ip: ip ?? null,
    resultado: 'Exito',
    detalle: { IDUsuario: usuario.IDUsuario, adminId },
  });

  return { mensaje: 'Usuario creado correctamente.', usuario };
}

/**
 * RF-6.1 — Obtener detalle de un usuario con su rol.
 */
export async function getUsuario(id: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { IDUsuario: id },
    select: {
      IDUsuario: true,
      nombre_completo: true,
      correo_electronico: true,
      cargo: true,
      institucion: true,
      telefono: true,
      Estado: true,
      Fecha_creacion: true,
      Ultimo_acceso: true,
      rol: {
        select: {
          id: true,
          nombre: true,
          descripcion: true,
        },
      },
    },
  });

  if (!usuario) throw new NotFoundError('Usuario');
  return usuario;
}

/**
 * RF-6.1 — Actualización parcial de datos de un usuario.
 */
export async function actualizarUsuario(
  id: string,
  datos: ActualizarUsuarioInput,
  adminId: string,
  ip: string | undefined
) {
  const usuario = await prisma.usuario.findUnique({
    where: { IDUsuario: id },
    select: { IDUsuario: true },
  });

  if (!usuario) throw new NotFoundError('Usuario');

  const update: {
    nombre_completo?: string;
    cargo?: string | null;
    institucion?: string | null;
    telefono?: string | null;
  } = {};

  if (datos.nombre_completo !== undefined) update.nombre_completo = datos.nombre_completo;
  if (datos.cargo !== undefined) update.cargo = datos.cargo;
  if (datos.institucion !== undefined) update.institucion = datos.institucion;
  if ('telefono' in datos) update.telefono = datos.telefono ?? null;

  const actualizado = await prisma.usuario.update({
    where: { IDUsuario: id },
    data: update,
    select: {
      IDUsuario: true,
      nombre_completo: true,
      correo_electronico: true,
      cargo: true,
      institucion: true,
      telefono: true,
      Estado: true,
      rol: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
  });

  await logAuditoria({
    accion: 'USUARIO_ACTUALIZADO',
    modulo: MODULO_SISTEMA.ADMIN,
    ip: ip ?? null,
    resultado: 'Exito',
    detalle: { IDUsuario: id, adminId },
  });

  return { mensaje: 'Usuario actualizado correctamente.', usuario: actualizado };
}

/**
 * RF-6.1 — Desactivar usuario (eliminación lógica).
 */
export async function desactivarUsuario(id: string, adminId: string, ip: string | undefined) {
  const usuario = await prisma.usuario.findUnique({
    where: { IDUsuario: id },
    select: { IDUsuario: true, Estado: true },
  });

  if (!usuario) throw new NotFoundError('Usuario');

  if (usuario.Estado === 'Inactivo') {
    throw new AppError('El usuario ya se encuentra inactivo.', 409);
  }

  if (id === adminId) {
    throw new AppError('No puede desactivar su propia cuenta.', 422);
  }

  await prisma.usuario.update({
    where: { IDUsuario: id },
    data: { Estado: 'Inactivo' },
  });

  await logAuditoria({
    accion: 'USUARIO_DESACTIVADO',
    modulo: MODULO_SISTEMA.ADMIN,
    ip: ip ?? null,
    resultado: 'Exito',
    detalle: { IDUsuario: id, adminId },
  });

  return { mensaje: 'Usuario desactivado correctamente.' };
}

/**
 * RF-6.2 — Listar todos los roles con sus permisos.
 */
export async function listarRoles() {
  const roles = await prisma.rol.findMany({
    orderBy: { created_at: 'asc' },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      created_at: true,
      rol_permiso: {
        select: {
          permiso: {
            select: {
              id: true,
              modulo: true,
              accion: true,
            },
          },
        },
      },
    },
  });

  return roles.map((rol) => ({
    id: rol.id,
    nombre: rol.nombre,
    descripcion: rol.descripcion,
    created_at: rol.created_at,
    permisos: rol.rol_permiso.map((rp) => rp.permiso),
  }));
}

/**
 * RF-6.2 — Asignar rol a un usuario existente.
 */
export async function asignarRol(id: string, datos: AsignarRolInput, adminId: string, ip: string | undefined) {
  const [usuario, rol] = await Promise.all([
    prisma.usuario.findUnique({ where: { IDUsuario: id }, select: { IDUsuario: true } }),
    prisma.rol.findUnique({ where: { id: datos.rol_id }, select: { id: true, nombre: true } }),
  ]);

  if (!usuario) throw new NotFoundError('Usuario');
  if (!rol) throw new NotFoundError('Rol');

  const actualizado = await prisma.usuario.update({
    where: { IDUsuario: id },
    data: { rol_id: datos.rol_id },
    select: {
      IDUsuario: true,
      nombre_completo: true,
      correo_electronico: true,
      rol: { select: { id: true, nombre: true } },
    },
  });

  await logAuditoria({
    accion: 'ROL_ASIGNADO',
    modulo: MODULO_SISTEMA.ADMIN,
    ip: ip ?? null,
    resultado: 'Exito',
    detalle: { IDUsuario: id, rol_id: datos.rol_id, adminId },
  });

  return { mensaje: `Rol "${rol.nombre}" asignado correctamente.`, usuario: actualizado };
}

/**
 * RF-6.3 — Listar solicitudes de registro con filtro opcional por estado.
 */
export async function listarSolicitudes(estado?: string) {
  const solicitudes = await prisma.solicitud_registro.findMany({
    ...(estado ? { where: { estado: estado as estado_solicitud } } : {}),
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      nombre_completo: true,
      correo_electronico: true,
      cargo: true,
      institucion: true,
      estado: true,
      comentario_admin: true,
      created_at: true,
      updated_at: true,
      revisado_por: true,
    },
  });

  return solicitudes;
}

/**
 * RF-6.3 — Revisar (aprobar o rechazar) una solicitud de registro.
 * Si Aprobada: crea el Usuario, actualiza solicitud, envía email.
 * Si Rechazada: actualiza solicitud, envía email con motivo.
 */
export async function revisarSolicitud(
  id: string,
  datos: RevisarSolicitudInput,
  adminId: string,
  ip: string | undefined
) {
  const solicitud = await prisma.solicitud_registro.findUnique({
    where: { id },
    select: {
      id: true,
      nombre_completo: true,
      correo_electronico: true,
      cargo: true,
      institucion: true,
      estado: true,
    },
  });

  if (!solicitud) throw new NotFoundError('Solicitud de registro');

  if (solicitud.estado !== 'Pendiente_Aprobacion' && solicitud.estado !== 'Pendiente_Info') {
    throw new AppError(
      `La solicitud ya fue procesada con estado "${solicitud.estado}". Solo se pueden revisar solicitudes en estado Pendiente_Aprobacion o Pendiente_Info.`,
      409
    );
  }

  if (datos.accion === 'Aprobada') {
    if (!datos.contrasena) {
      throw new AppError('Se requiere una contraseña para aprobar la solicitud.', 422);
    }
    if (!datos.rol_id) {
      throw new AppError('Se requiere un rol para aprobar la solicitud.', 422);
    }

    const rolExistente = await prisma.rol.findUnique({
      where: { id: datos.rol_id },
      select: { id: true },
    });

    if (!rolExistente) throw new NotFoundError('Rol');

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { correo_electronico: solicitud.correo_electronico },
      select: { IDUsuario: true },
    });

    if (usuarioExistente) {
      throw new ConflictError('Ya existe un usuario activo con este correo electrónico.');
    }

    const contrasena_hash = await bcrypt.hash(datos.contrasena, BCRYPT_COST);

    const [usuario] = await prisma.$transaction([
      prisma.usuario.create({
        data: {
          nombre_completo: solicitud.nombre_completo,
          correo_electronico: solicitud.correo_electronico,
          contrasena_hash,
          // El admin define una contraseña inicial; el usuario debe cambiarla
          // obligatoriamente en su primer inicio de sesión.
          debe_cambiar_contrasena: true,
          rol_id: datos.rol_id,
          cargo: datos.cargo ?? solicitud.cargo ?? null,
          institucion: datos.institucion ?? solicitud.institucion ?? null,
          Estado: 'Activo',
        },
        select: {
          IDUsuario: true,
          nombre_completo: true,
          correo_electronico: true,
        },
      }),
      prisma.solicitud_registro.update({
        where: { id },
        data: {
          estado: 'Aprobada',
          revisado_por: adminId,
          comentario_admin: datos.comentario ?? null,
          updated_at: new Date(),
        },
      }),
    ]);

    await logAuditoria({
      accion: 'SOLICITUD_APROBADA',
      modulo: MODULO_SISTEMA.ADMIN,
      ip: ip ?? null,
      resultado: 'Exito',
      detalle: { solicitudId: id, IDUsuario: usuario.IDUsuario, adminId },
    });

    try {
      await sendRegistroAprobado({
        nombre: solicitud.nombre_completo,
        correo: solicitud.correo_electronico,
        contrasena: datos.contrasena,
      });
    } catch {
      // Do not fail the request if email cannot be sent
    }

    return {
      mensaje: 'Solicitud aprobada. Usuario creado correctamente.',
      usuario,
    };
  }

  // Rechazada
  await prisma.solicitud_registro.update({
    where: { id },
    data: {
      estado: 'Rechazada',
      revisado_por: adminId,
      comentario_admin: datos.comentario ?? null,
      updated_at: new Date(),
    },
  });

  await logAuditoria({
    accion: 'SOLICITUD_RECHAZADA',
    modulo: MODULO_SISTEMA.ADMIN,
    ip: ip ?? null,
    resultado: 'Exito',
    detalle: { solicitudId: id, adminId },
  });

  try {
    await sendRegistroRechazado({
      nombre: solicitud.nombre_completo,
      correo: solicitud.correo_electronico,
      motivo: datos.comentario ?? 'No se proporcionó motivo.',
    });
  } catch {
    // Do not fail the request if email cannot be sent
  }

  return { mensaje: 'Solicitud rechazada correctamente.' };
}
