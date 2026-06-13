import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database.js';
import { env } from '../../config/env.js';
import { sendRegistroRecibido } from '../../shared/utils/email.js';
import { logAuditoria } from '../../middleware/auditLog.js';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../shared/errors/AppError.js';
import type { RegistroInput, LoginInput, UpdatePerfilInput } from './auth.validation.js';

/**
 * RF-1.1 — Solicitud de registro de nuevo usuario.
 * No crea cuenta activa: crea solicitud_registro con estado Pendiente_Aprobacion.
 * El admin aprueba y crea el Usuario con contraseña asignada.
 */
export async function registrarSolicitud(datos: RegistroInput, ip: string | undefined) {
  const [usuarioExistente, solicitudPendiente] = await Promise.all([
    prisma.usuario.findUnique({
      where: { correo_electronico: datos.correo_electronico },
      select: { IDUsuario: true },
    }),
    prisma.solicitud_registro.findFirst({
      where: {
        correo_electronico: datos.correo_electronico,
        estado: { in: ['Pendiente_Aprobacion', 'Pendiente_Info'] },
      },
      select: { id: true },
    }),
  ]);

  if (usuarioExistente || solicitudPendiente) {
    throw new ConflictError('Este correo electrónico ya está asociado a una cuenta o tiene una solicitud pendiente.');
  }

  const solicitud = await prisma.solicitud_registro.create({
    data: {
      nombre_completo: datos.nombre_completo,
      correo_electronico: datos.correo_electronico,
      cargo: datos.cargo ?? null,
      institucion: datos.institucion ?? null,
    },
  });

  await sendRegistroRecibido({ nombre: datos.nombre_completo, correo: datos.correo_electronico });

  await logAuditoria({
    accion: 'REGISTRO_SOLICITADO',
    modulo: 'MOD_01_AUTH',
    ip: ip ?? null,
    resultado: 'Exito',
    detalle: { solicitudId: solicitud.id },
  });

  return { mensaje: 'Tu solicitud ha sido recibida. Recibirás un correo cuando sea procesada.' };
}

/**
 * RF-1.2 — Login con correo y contraseña.
 * Verifica bcrypt contra contrasena_hash en BD.
 * Emite JWT firmado con JWT_SECRET.
 */
export async function login(datos: LoginInput, ip: string | undefined) {
  const usuario = await prisma.usuario.findUnique({
    where: { correo_electronico: datos.correo_electronico },
    select: {
      IDUsuario: true,
      contrasena_hash: true,
      Estado: true,
      rol_id: true,
      nombre_completo: true,
      rol: { select: { nombre: true } },
    },
  });

  const hashValido = usuario
    ? await bcrypt.compare(datos.contrasena, usuario.contrasena_hash)
    : false;

  if (!usuario || !hashValido) {
    await logAuditoria({
      accion: 'LOGIN_FALLIDO',
      modulo: 'MOD_01_AUTH',
      ip: ip ?? null,
      resultado: 'Fallo',
      detalle: { correo: datos.correo_electronico },
    });
    throw new UnauthorizedError('Credenciales incorrectas.');
  }

  if (usuario.Estado !== 'Activo') {
    throw new UnauthorizedError('Cuenta inactiva. Contacte al administrador.');
  }

  const token = jwt.sign(
    { sub: usuario.IDUsuario, rolId: usuario.rol_id },
    env.JWT_SECRET,
    { expiresIn: (env.JWT_EXPIRES_IN ?? '8h') } as jwt.SignOptions
  );

  await prisma.usuario.update({
    where: { IDUsuario: usuario.IDUsuario },
    data: { Ultimo_acceso: new Date() },
  });

  await logAuditoria({
    accion: 'LOGIN_EXITOSO',
    modulo: 'MOD_01_AUTH',
    ip: ip ?? null,
    resultado: 'Exito',
  });

  return {
    token,
    usuario: {
      id: usuario.IDUsuario,
      nombre_completo: usuario.nombre_completo,
      rol: usuario.rol?.nombre ?? null,
    },
  };
}

/**
 * RF-1.5 — Perfil del usuario autenticado.
 */
export async function getPerfilPropio(usuarioId: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { IDUsuario: usuarioId },
    select: {
      IDUsuario: true,
      nombre_completo: true,
      correo_electronico: true,
      telefono: true,
      cargo: true,
      institucion: true,
      Estado: true,
      Fecha_creacion: true,
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
  datos: UpdatePerfilInput,
  ip: string | undefined
) {
  const update: { nombre_completo?: string; telefono?: string | null } = {};

  if (datos.nombre_completo !== undefined) update.nombre_completo = datos.nombre_completo;
  if ('telefono' in datos) update.telefono = datos.telefono ?? null;

  const actualizado = await prisma.usuario.update({
    where: { IDUsuario: usuarioId },
    data: update,
    select: {
      IDUsuario: true,
      nombre_completo: true,
      correo_electronico: true,
      telefono: true,
      cargo: true,
      institucion: true,
    },
  });

  await logAuditoria({
    accion: 'PERFIL_ACTUALIZADO',
    modulo: 'MOD_01_AUTH',
    ip: ip ?? null,
    resultado: 'Exito',
  });

  return { mensaje: 'Perfil actualizado correctamente.', usuario: actualizado };
}
