import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import logger from './logger.js';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS },
  });
  return transporter;
}

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

async function sendMail(options: MailOptions): Promise<void> {
  try {
    const info = await getTransporter().sendMail({
      from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM}>`,
      ...options,
    });
    logger.info({ messageId: info.messageId, to: options.to }, 'Email enviado');
  } catch (err) {
    logger.error({ err, to: options.to, subject: options.subject }, 'Error al enviar email');
    throw err;
  }
}

export async function sendRegistroRecibido(params: { nombre: string; correo: string }): Promise<void> {
  await sendMail({
    to: params.correo,
    subject: 'BIOTRACK — Solicitud de registro recibida',
    text: `Hola ${params.nombre}, tu solicitud de registro ha sido recibida. Recibirás un correo cuando sea procesada.`,
    html: `<p>Hola <strong>${params.nombre}</strong>,</p>
           <p>Tu solicitud de registro ha sido recibida. El administrador la revisará pronto.</p>
           <p>— Equipo BIOTRACK</p>`,
  });
}

export async function sendRegistroAprobado(params: {
  nombre: string;
  correo: string;
  passwordResetLink: string;
}): Promise<void> {
  await sendMail({
    to: params.correo,
    subject: 'BIOTRACK — Acceso aprobado',
    text: `Hola ${params.nombre}, tu solicitud fue aprobada. Establece tu contraseña en: ${params.passwordResetLink}`,
    html: `<p>Hola <strong>${params.nombre}</strong>,</p>
           <p>Tu solicitud de acceso a BIOTRACK ha sido <strong>aprobada</strong>.</p>
           <p><a href="${params.passwordResetLink}">Haz clic aquí para establecer tu contraseña</a></p>
           <p>El enlace expira en 24 horas.</p>
           <p>— Equipo BIOTRACK</p>`,
  });
}

export async function sendRegistroRechazado(params: {
  nombre: string;
  correo: string;
  motivo: string;
}): Promise<void> {
  await sendMail({
    to: params.correo,
    subject: 'BIOTRACK — Solicitud de registro no aprobada',
    text: `Hola ${params.nombre}, tu solicitud no fue aprobada. Motivo: ${params.motivo}`,
    html: `<p>Hola <strong>${params.nombre}</strong>,</p>
           <p>Tu solicitud de acceso a BIOTRACK no fue aprobada.</p>
           <p><strong>Motivo:</strong> ${params.motivo}</p>
           <p>— Equipo BIOTRACK</p>`,
  });
}

export async function sendEstadoDenunciaActualizado(params: {
  correo: string;
  codigo: string;
  nuevoEstado: string;
  comentario?: string | null;
}): Promise<void> {
  await sendMail({
    to: params.correo,
    subject: `BIOTRACK — Actualización de tu denuncia ${params.codigo}`,
    text: `Tu denuncia ${params.codigo} fue actualizada al estado: ${params.nuevoEstado}.`,
    html: `<p>Tu denuncia <strong>${params.codigo}</strong> fue actualizada.</p>
           <p>Nuevo estado: <strong>${params.nuevoEstado}</strong></p>
           ${params.comentario ? `<p>Comentario: ${params.comentario}</p>` : ''}
           <p><a href="${env.FRONTEND_URL}/seguimiento/${params.codigo}">Ver seguimiento</a></p>
           <p>— Equipo BIOTRACK</p>`,
  });
}

export async function sendNotificacionZonaCritica(params: {
  correos: string[];
  nombreZona: string;
}): Promise<void> {
  for (const correo of params.correos) {
    await sendMail({
      to: correo,
      subject: `BIOTRACK — Alerta: zona ${params.nombreZona} escalada a CRÍTICO`,
      text: `La zona "${params.nombreZona}" fue clasificada como CRÍTICA.`,
      html: `<p>La zona <strong>${params.nombreZona}</strong> fue escalada a nivel <strong>CRÍTICO</strong>.</p>
             <p><a href="${env.FRONTEND_URL}/zonas">Ver en el panel</a></p>
             <p>— BIOTRACK</p>`,
    });
  }
}
