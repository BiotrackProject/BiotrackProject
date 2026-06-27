import { Router } from 'express';
import * as ctrl from './auth.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authLimiter, passwordResetLimiter } from '../../middleware/rateLimiter.js';

const router: Router = Router();

/**
 * @openapi
 * tags:
 *   - name: Autenticación
 *     description: >
 *       MOD-01 — Autenticación y Perfil (RF-1.1 a RF-1.5).
 *       Login con correo/contraseña, JWT propio (HS256).
 */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Autenticación]
 *     summary: Login con correo y contraseña (RF-1.2)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [correo_electronico, contrasena]
 *             properties:
 *               correo_electronico:
 *                 type: string
 *                 format: email
 *               contrasena:
 *                 type: string
 *     responses:
 *       200:
 *         description: JWT emitido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 usuario:
 *                   type: object
 *       401:
 *         description: Credenciales incorrectas.
 *       429:
 *         description: Demasiadas solicitudes.
 */
router.post('/login', authLimiter, ctrl.login);
router.post('/logout', ctrl.logout);

/**
 * @openapi
 * /auth/registro:
 *   post:
 *     tags: [Autenticación]
 *     summary: Solicitud de registro de nuevo usuario (RF-1.1)
 *     description: >
 *       Crea una solicitud con estado Pendiente_Aprobacion.
 *       La cuenta no se activa hasta que el administrador apruebe la solicitud (RF-6.3).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre_completo, correo_electronico]
 *             properties:
 *               nombre_completo:
 *                 type: string
 *               correo_electronico:
 *                 type: string
 *                 format: email
 *               cargo:
 *                 type: string
 *               institucion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Solicitud recibida.
 *       409:
 *         description: Correo ya registrado o solicitud pendiente.
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         description: Demasiadas solicitudes.
 */
router.post('/registro', authLimiter, ctrl.registro);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags: [Autenticación]
 *     summary: Solicitar código de recuperación de contraseña (RF-1.4)
 *     description: >
 *       Envía un código OTP de 6 dígitos al correo registrado.
 *       Límite de 1 correo cada 3 minutos por cuenta. Respuesta genérica para no revelar
 *       si el correo existe.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [correo_electronico]
 *             properties:
 *               correo_electronico:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Si el correo está registrado, se envía un código.
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         description: Debe esperar antes de solicitar otro código.
 */
router.post('/forgot-password', passwordResetLimiter, ctrl.forgotPassword);

/**
 * @openapi
 * /auth/verify-code:
 *   post:
 *     tags: [Autenticación]
 *     summary: Verificar código de recuperación (RF-1.4)
 *     description: Valida el código OTP y devuelve un token de restablecimiento de corta duración.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [correo_electronico, codigo]
 *             properties:
 *               correo_electronico:
 *                 type: string
 *                 format: email
 *               codigo:
 *                 type: string
 *                 example: "482917"
 *     responses:
 *       200:
 *         description: Código válido; token de restablecimiento emitido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Código inválido o expirado.
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/verify-code', passwordResetLimiter, ctrl.verifyCode);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags: [Autenticación]
 *     summary: Restablecer contraseña con token de recuperación (RF-1.4)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, contrasena]
 *             properties:
 *               token:
 *                 type: string
 *               contrasena:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Contraseña restablecida.
 *       401:
 *         description: Token inválido o expirado.
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/reset-password', passwordResetLimiter, ctrl.resetPassword);

/**
 * @openapi
 * /auth/perfil:
 *   get:
 *     tags: [Autenticación]
 *     summary: Obtener perfil del usuario autenticado (RF-1.5)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del perfil.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   patch:
 *     tags: [Autenticación]
 *     summary: Actualizar perfil (RF-1.5)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_completo:
 *                 type: string
 *               telefono:
 *                 type: string
 *                 example: "+18091234567"
 *     responses:
 *       200:
 *         description: Perfil actualizado.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
/**
 * @openapi
 * /auth/cambiar-contrasena:
 *   post:
 *     tags: [Autenticación]
 *     summary: Cambiar la contraseña del usuario autenticado (RF-1.2)
 *     description: >
 *       Cambio voluntario u obligatorio (primer inicio de sesión tras aprobación).
 *       Requiere la contraseña actual y limpia la bandera de cambio obligatorio.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [contrasena_actual, contrasena_nueva]
 *             properties:
 *               contrasena_actual:
 *                 type: string
 *                 format: password
 *               contrasena_nueva:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Contraseña actualizada.
 *       401:
 *         description: Contraseña actual incorrecta o sesión inválida.
 *       409:
 *         description: La nueva contraseña es igual a la actual.
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/cambiar-contrasena', authenticate, ctrl.cambiarContrasena);

router.get('/perfil', authenticate, ctrl.getPerfil);
router.patch('/perfil', authenticate, ctrl.actualizarPerfil);

export default router;
