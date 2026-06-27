import { randomInt } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database.js';
import { env } from '../../config/env.js';
import { sendRegistroRecibido, sendCodigoRecuperacion } from '../../shared/utils/ses.js';
import { sha256 } from '../../shared/utils/crypto.js';
import { logAuditoria } from '../../middleware/auditLog.js';
import { segundosBloqueo, registrarFallo, limpiarIntentos } from './auth.lockout.js';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  TooManyRequestsError,
} from '../../shared/errors/AppError.js';
import type {
  RegistroInput,
  LoginInput,
  UpdatePerfilInput,
  ForgotPasswordInput,
  VerifyCodeInput,
  ResetPasswordInput,
  CambiarContrasenaInput,
} from './auth.validation.js';

// RF-1.4 — Parámetros de recuperación de contraseña
const BCRYPT_COST = 12;
const CODIGO_VALIDEZ_MIN = 15; // el código OTP vence a los 15 minutos
const REENVIO_MIN = 3; // solo se puede enviar 1 correo cada 3 minutos por cuenta
const MAX_INTENTOS = 5; // intentos de verificación antes de invalidar el código
const RESET_TOKEN_EXPIRES = '15m';
const RESET_TOKEN_PURPOSE = 'password_reset';

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
  // RF-1.2 — Si la cuenta está bloqueada por intentos fallidos, rechazamos
  // antes de tocar la BD o comparar el hash.
  const bloqueoRestante = segundosBloqueo(datos.correo_electronico);
  if (bloqueoRestante > 0) {
    await logAuditoria({
      accion: 'LOGIN_BLOQUEADO',
      modulo: 'MOD_01_AUTH',
      ip: ip ?? null,
      resultado: 'Fallo',
      detalle: { correo: datos.correo_electronico, segundosRestantes: bloqueoRestante },
    });
    const minutos = Math.ceil(bloqueoRestante / 60);
    throw new TooManyRequestsError(
      `Cuenta bloqueada temporalmente por intentos fallidos. Intenta de nuevo en ${minutos} minuto(s).`
    );
  }

  const usuario = await prisma.usuario.findUnique({
    where: { correo_electronico: datos.correo_electronico },
    select: {
      IDUsuario: true,
      contrasena_hash: true,
      Estado: true,
      rol_id: true,
      nombre_completo: true,
      debe_cambiar_contrasena: true,
      rol: { select: { nombre: true } },
    },
  });

  const hashValido = usuario
    ? await bcrypt.compare(datos.contrasena, usuario.contrasena_hash)
    : false;

  if (!usuario || !hashValido) {
    const bloqueoSeg = registrarFallo(datos.correo_electronico);
    await logAuditoria({
      accion: 'LOGIN_FALLIDO',
      modulo: 'MOD_01_AUTH',
      ip: ip ?? null,
      resultado: 'Fallo',
      detalle: { correo: datos.correo_electronico, bloqueado: bloqueoSeg > 0 },
    });
    if (bloqueoSeg > 0) {
      const minutos = Math.ceil(bloqueoSeg / 60);
      throw new TooManyRequestsError(
        `Demasiados intentos fallidos. Cuenta bloqueada por ${minutos} minuto(s).`
      );
    }
    throw new UnauthorizedError('Credenciales incorrectas.');
  }

  // Credenciales correctas: reiniciamos el contador de intentos fallidos.
  limpiarIntentos(datos.correo_electronico);

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
      debe_cambiar_contrasena: usuario.debe_cambiar_contrasena,
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
      debe_cambiar_contrasena: true,
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
      Estado: true,
      Fecha_creacion: true,
      rol: { select: { id: true, nombre: true } },
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

// Mensaje genérico para no revelar si un correo existe (anti-enumeración).
const MENSAJE_GENERICO =
  'Si el correo está registrado, recibirás un código de verificación en breve.';

/**
 * RF-1.4 — Solicita un código de recuperación de contraseña.
 * Envía un OTP de 6 dígitos al correo. Límite: 1 correo cada 3 minutos por cuenta.
 */
export async function solicitarCodigoRecuperacion(
  datos: ForgotPasswordInput,
  ip: string | undefined
) {
  const usuario = await prisma.usuario.findUnique({
    where: { correo_electronico: datos.correo_electronico },
    select: { IDUsuario: true, nombre_completo: true, Estado: true },
  });

  // No revelamos la existencia del correo ni el estado de la cuenta.
  if (usuario?.Estado !== 'Activo') {
    return { mensaje: MENSAJE_GENERICO };
  }

  // Rate limit por cuenta: ¿se generó un código en los últimos REENVIO_MIN minutos?
  const ultimoCodigo = await prisma.password_reset_code.findFirst({
    where: { usuario_id: usuario.IDUsuario },
    orderBy: { created_at: 'desc' },
    select: { created_at: true },
  });

  if (ultimoCodigo) {
    const transcurridoMs = Date.now() - ultimoCodigo.created_at.getTime();
    const ventanaMs = REENVIO_MIN * 60 * 1000;
    if (transcurridoMs < ventanaMs) {
      const segundosRestantes = Math.ceil((ventanaMs - transcurridoMs) / 1000);
      await logAuditoria({
        accion: 'RECUPERACION_RATE_LIMIT',
        modulo: 'MOD_01_AUTH',
        ip: ip ?? null,
        resultado: 'Fallo',
        detalle: { usuarioId: usuario.IDUsuario, segundosRestantes },
      });
      throw new TooManyRequestsError(
        `Ya enviamos un código recientemente. Espera ${segundosRestantes} segundos antes de solicitar otro.`
      );
    }
  }

  // Generamos un OTP de 6 dígitos y lo guardamos hasheado (nunca en claro).
  const codigo = randomInt(0, 1_000_000).toString().padStart(6, '0');
  const expira = new Date(Date.now() + CODIGO_VALIDEZ_MIN * 60 * 1000);

  await prisma.$transaction([
    // Invalidamos cualquier código previo sin usar.
    prisma.password_reset_code.updateMany({
      where: { usuario_id: usuario.IDUsuario, usado: false },
      data: { usado: true },
    }),
    prisma.password_reset_code.create({
      data: {
        usuario_id: usuario.IDUsuario,
        codigo_hash: sha256(codigo),
        expira_en: expira,
      },
    }),
  ]);

  await sendCodigoRecuperacion({
    nombre: usuario.nombre_completo,
    correo: datos.correo_electronico,
    codigo,
    minutosValidez: CODIGO_VALIDEZ_MIN,
  });

  await logAuditoria({
    accion: 'RECUPERACION_CODIGO_ENVIADO',
    modulo: 'MOD_01_AUTH',
    ip: ip ?? null,
    resultado: 'Exito',
    detalle: { usuarioId: usuario.IDUsuario },
  });

  return { mensaje: MENSAJE_GENERICO };
}

/**
 * RF-1.4 — Verifica el código OTP y emite un token de restablecimiento de corta duración.
 */
export async function verificarCodigoRecuperacion(
  datos: VerifyCodeInput,
  ip: string | undefined
) {
  const usuario = await prisma.usuario.findUnique({
    where: { correo_electronico: datos.correo_electronico },
    select: { IDUsuario: true },
  });

  const codigoErroneo = () => {
    throw new UnauthorizedError('Código inválido o expirado.');
  };

  if (!usuario) return codigoErroneo();

  const registro = await prisma.password_reset_code.findFirst({
    where: { usuario_id: usuario.IDUsuario, usado: false },
    orderBy: { created_at: 'desc' },
  });

  if (!registro || registro.expira_en.getTime() < Date.now() || registro.intentos >= MAX_INTENTOS) {
    return codigoErroneo();
  }

  if (registro.codigo_hash !== sha256(datos.codigo)) {
    const intentos = registro.intentos + 1;
    await prisma.password_reset_code.update({
      where: { id: registro.id },
      // Tras MAX_INTENTOS fallos, el código queda inutilizable.
      data: { intentos, usado: intentos >= MAX_INTENTOS },
    });
    await logAuditoria({
      accion: 'RECUPERACION_CODIGO_FALLIDO',
      modulo: 'MOD_01_AUTH',
      ip: ip ?? null,
      resultado: 'Fallo',
      detalle: { usuarioId: usuario.IDUsuario, intentos },
    });
    return codigoErroneo();
  }

  await prisma.password_reset_code.update({
    where: { id: registro.id },
    data: { verificado: true },
  });

  // Token de un solo propósito; vincula el código concreto (jti) para evitar reuso.
  const token = jwt.sign(
    { sub: usuario.IDUsuario, purpose: RESET_TOKEN_PURPOSE, jti: registro.id },
    env.JWT_SECRET,
    { expiresIn: RESET_TOKEN_EXPIRES } as jwt.SignOptions
  );

  await logAuditoria({
    accion: 'RECUPERACION_CODIGO_VERIFICADO',
    modulo: 'MOD_01_AUTH',
    ip: ip ?? null,
    resultado: 'Exito',
    detalle: { usuarioId: usuario.IDUsuario },
  });

  return { token };
}

/**
 * RF-1.4 — Restablece la contraseña usando el token emitido tras verificar el código.
 */
export async function restablecerContrasena(
  datos: ResetPasswordInput,
  ip: string | undefined
) {
  let payload: { sub: string; purpose?: string; jti?: string };
  try {
    payload = jwt.verify(datos.token, env.JWT_SECRET) as typeof payload;
  } catch {
    throw new UnauthorizedError('El enlace de restablecimiento es inválido o ha expirado.');
  }

  if (payload.purpose !== RESET_TOKEN_PURPOSE || !payload.jti) {
    throw new UnauthorizedError('Token de restablecimiento inválido.');
  }

  // El código debe seguir verificado y no usado (un solo restablecimiento por código).
  const registro = await prisma.password_reset_code.findUnique({
    where: { id: payload.jti },
    select: { id: true, usuario_id: true, verificado: true, usado: true, expira_en: true },
  });

  if (
    registro?.usuario_id !== payload.sub ||
    !registro.verificado ||
    registro.usado ||
    registro.expira_en.getTime() < Date.now()
  ) {
    throw new UnauthorizedError('El enlace de restablecimiento es inválido o ha expirado.');
  }

  const contrasena_hash = await bcrypt.hash(datos.contrasena, BCRYPT_COST);

  await prisma.$transaction([
    prisma.usuario.update({
      where: { IDUsuario: registro.usuario_id },
      data: { contrasena_hash },
    }),
    // Consumimos el código e invalidamos cualquier otro código pendiente.
    prisma.password_reset_code.updateMany({
      where: { usuario_id: registro.usuario_id, usado: false },
      data: { usado: true },
    }),
  ]);

  await logAuditoria({
    accion: 'RECUPERACION_CONTRASENA_RESTABLECIDA',
    modulo: 'MOD_01_AUTH',
    ip: ip ?? null,
    resultado: 'Exito',
    detalle: { usuarioId: registro.usuario_id },
  });

  return { mensaje: 'Tu contraseña ha sido restablecida. Ya puedes iniciar sesión.' };
}

/**
 * RF-1.2 — Cambio de contraseña del usuario autenticado. Se usa tanto para el
 * cambio voluntario como para el cambio obligatorio en el primer inicio de
 * sesión (cuando `debe_cambiar_contrasena` está activo tras una aprobación).
 * Verifica la contraseña actual y limpia la bandera de cambio obligatorio.
 */
export async function cambiarContrasena(
  usuarioId: string,
  datos: CambiarContrasenaInput,
  ip: string | undefined
) {
  const usuario = await prisma.usuario.findUnique({
    where: { IDUsuario: usuarioId },
    select: { contrasena_hash: true },
  });

  if (!usuario) throw new NotFoundError('Usuario');

  const actualValida = await bcrypt.compare(datos.contrasena_actual, usuario.contrasena_hash);
  if (!actualValida) {
    await logAuditoria({
      accion: 'CAMBIO_CONTRASENA_FALLIDO',
      modulo: 'MOD_01_AUTH',
      ip: ip ?? null,
      resultado: 'Fallo',
      detalle: { usuarioId },
    });
    throw new UnauthorizedError('La contraseña actual es incorrecta.');
  }

  // No permitir reusar la misma contraseña.
  const esMisma = await bcrypt.compare(datos.contrasena_nueva, usuario.contrasena_hash);
  if (esMisma) {
    throw new ConflictError('La nueva contraseña debe ser distinta de la actual.');
  }

  const contrasena_hash = await bcrypt.hash(datos.contrasena_nueva, BCRYPT_COST);

  await prisma.usuario.update({
    where: { IDUsuario: usuarioId },
    data: { contrasena_hash, debe_cambiar_contrasena: false },
  });

  await logAuditoria({
    accion: 'CAMBIO_CONTRASENA',
    modulo: 'MOD_01_AUTH',
    ip: ip ?? null,
    resultado: 'Exito',
    detalle: { usuarioId },
  });

  return { mensaje: 'Tu contraseña ha sido actualizada correctamente.' };
}
