import prisma from '../../config/database.js';
import { auth0Management } from '../../config/auth0.js';
import { sendRegistroRecibido } from '../../shared/utils/email.js';
import { logAuditoria } from '../../middleware/auditLog.js';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../shared/errors/AppError.js';
import type { RegistroInput, UpdatePerfilInput } from './auth.validation.js';

/**
 * RF-1.1 — Registro de solicitud de nuevo usuario.
 * Crea el usuario en Auth0 con blocked:true (no puede hacer login hasta aprobación del admin).
 * Crea SolicitudRegistro en nuestra BD.
 */
export async function registrarSolicitud(datos: RegistroInput, ip: string | undefined) {
  // Verificar si el correo ya existe en nuestra BD o tiene solicitud pendiente
  const [usuarioExistente, solicitudPendiente] = await Promise.all([
    prisma.usuario.findUnique({ where: { correo_electronico: datos.correo_electronico }, select: { id: true } }),
    prisma.solicitudRegistro.findFirst({
      where: {
        correo_electronico: datos.correo_electronico,
        estado: { in: ['PENDIENTE_APROBACION', 'PENDIENTE_INFO'] },
      },
      select: { id: true },
    }),
  ]);

  if (usuarioExistente || solicitudPendiente) {
    throw new ConflictError('Este correo electrónico ya está asociado a una cuenta.');
  }

  // Crear usuario en Auth0 bloqueado (sin contraseña — se envía reset email al aprobar)
  const auth0User = await auth0Management.users.create({
    connection: 'Username-Password-Authentication',
    email: datos.correo_electronico,
    name: datos.nombre_completo,
    password: `Biotrack_Temp_${Date.now()}!`, // contraseña temporal; se resetea en aprobación
    blocked: true,
    app_metadata: {
      biotrack_estado: 'PENDIENTE_APROBACION',
      cargo: datos.cargo,
      institucion: datos.institucion,
    },
  });

  const auth0UserId = auth0User.data.user_id as string;

  const solicitud = await prisma.solicitudRegistro.create({
    data: {
      auth0_user_id: auth0UserId,
      nombre_completo: datos.nombre_completo,
      correo_electronico: datos.correo_electronico,
      cargo: datos.cargo,
      institucion: datos.institucion,
    },
  });

  await sendRegistroRecibido({ nombre: datos.nombre_completo, correo: datos.correo_electronico });

  await logAuditoria({
    accion: 'REGISTRO_SOLICITADO',
    modulo: 'MOD_01_AUTH',
    recursoId: solicitud.id,
    ip: ip ?? null,
    resultado: 'EXITO',
  });

  return { mensaje: 'Tu solicitud ha sido recibida. Recibirás un correo cuando sea procesada.' };
}

/**
 * RF-1.3 — Logout seguro.
 * Añade el jti del token actual a la blacklist para invalidación inmediata.
 */
export async function logout(params: {
  jti: string;
  usuarioId: string;
  tokenExpiry: Date;
  ip: string | undefined;
}) {
  await prisma.tokenRevocado.create({
    data: {
      jti: params.jti,
      usuario_id: params.usuarioId,
      expires_at: params.tokenExpiry,
    },
  });

  await logAuditoria({
    usuarioId: params.usuarioId,
    accion: 'LOGOUT',
    modulo: 'MOD_01_AUTH',
    ip: params.ip ?? null,
    resultado: 'EXITO',
  });
}

/**
 * RF-1.4 — Recuperación de contraseña.
 * Delegada completamente a Auth0 (envía el reset email desde su panel).
 * Siempre responde igual para evitar enumeración de usuarios.
 */
export async function solicitarRecuperacion(
  correo_electronico: string,
  ip: string | undefined
): Promise<{ mensaje: string }> {
  const RESPUESTA = { mensaje: 'Si el correo existe, recibirás un enlace en breve.' };

  const usuario = await prisma.usuario.findUnique({
    where: { correo_electronico },
    select: { id: true, auth0_id: true },
  });

  await logAuditoria({
    usuarioId: usuario?.id ?? null,
    accion: 'RECUPERACION_SOLICITADA',
    modulo: 'MOD_01_AUTH',
    ip: ip ?? null,
    resultado: 'EXITO',
  });

  if (!usuario) return RESPUESTA;

  // Auth0 envía el email de recuperación automáticamente
  await auth0Management.tickets.changePassword({
    user_id: usuario.auth0_id,
    result_url: `${process.env['FRONTEND_URL']}/login`,
    ttl_sec: 3600, // 60 minutos (RF-1.4)
  });

  return RESPUESTA;
}

/**
 * RF-1.5 — Obtener perfil del usuario autenticado.
 */
export async function getPerfilPropio(usuarioId: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: {
      id: true,
      nombre_completo: true,
      correo_electronico: true,
      telefono: true,
      cargo: true,
      institucion: true,
      estado: true,
      created_at: true,
      rol: { select: { id: true, nombre: true } },
    },
  });

  if (!usuario) throw new NotFoundError('Usuario');
  return usuario;
}

/**
 * RF-1.5 — Actualizar perfil del usuario autenticado.
 */
export async function actualizarPerfil(
  usuarioId: string,
  auth0Id: string,
  datos: UpdatePerfilInput,
  ip: string | undefined
) {
  const update: { nombre_completo?: string; telefono?: string | null } = {};

  if (datos.nombre_completo !== undefined) {
    update.nombre_completo = datos.nombre_completo;
    // Sincronizar nombre en Auth0
    await auth0Management.users.update(auth0Id, { name: datos.nombre_completo });
  }

  if ('telefono' in datos) {
    update.telefono = datos.telefono ?? null;
  }

  const actualizado = await prisma.usuario.update({
    where: { id: usuarioId },
    data: update,
    select: {
      id: true,
      nombre_completo: true,
      correo_electronico: true,
      telefono: true,
      cargo: true,
      institucion: true,
    },
  });

  await logAuditoria({
    usuarioId,
    accion: 'PERFIL_ACTUALIZADO',
    modulo: 'MOD_01_AUTH',
    ip: ip ?? null,
    resultado: 'EXITO',
  });

  return { mensaje: 'Perfil actualizado correctamente.', usuario: actualizado };
}
