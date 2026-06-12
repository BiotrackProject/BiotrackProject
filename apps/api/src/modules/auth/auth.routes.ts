import { Router } from 'express';
import * as ctrl from './auth.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authLimiter } from '../../middleware/rateLimiter.js';

const router: Router = Router();

/**
 * @openapi
 * tags:
 *   - name: Autenticación
 *     description: >
 *       MOD-01 — Perfil y Autenticación (RF-1.1 a RF-1.5).
 *       El Login y el Registro de contraseña se delegan a Auth0 (Universal Login).
 *       Este módulo gestiona el registro de solicitudes, logout, recuperación y perfil.
 */

/**
 * @openapi
 * /auth/registro:
 *   post:
 *     tags: [Autenticación]
 *     summary: Solicitud de registro de nuevo usuario administrativo (RF-1.1)
 *     description: >
 *       Crea una solicitud de registro con estado PENDIENTE_APROBACION.
 *       El usuario se crea en Auth0 con blocked=true.
 *       La cuenta no se activa hasta la aprobación del Administrador (RF-6.3).
 *       El login se realiza via Auth0 Universal Login una vez aprobado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre_completo, correo_electronico, cargo, institucion]
 *             properties:
 *               nombre_completo:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: "Juan Pérez"
 *               correo_electronico:
 *                 type: string
 *                 format: email
 *                 example: "juan.perez@mimarena.gob.do"
 *               cargo:
 *                 type: string
 *                 maxLength: 80
 *                 example: "Técnico de Campo"
 *               institucion:
 *                 type: string
 *                 maxLength: 100
 *                 example: "MIMARENA"
 *     responses:
 *       201:
 *         description: Solicitud recibida. Se notificará al admin y al solicitante por email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Tu solicitud ha sido recibida. Recibirás un correo cuando sea procesada."
 *       409:
 *         description: El correo ya está registrado o tiene solicitud pendiente.
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         description: Demasiadas solicitudes.
 */
router.post('/registro', authLimiter, ctrl.registro);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Autenticación]
 *     summary: Logout — invalida el token actual en la blacklist (RF-1.3)
 *     description: >
 *       Añade el jti del token a la blacklist para invalidación inmediata.
 *       El frontend también debe llamar al endpoint de logout de Auth0
 *       para limpiar la sesión SSO.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/logout', ...authenticate, ctrl.logout);

/**
 * @openapi
 * /auth/recuperar-contrasena:
 *   post:
 *     tags: [Autenticación]
 *     summary: Solicitar enlace de recuperación de contraseña (RF-1.4)
 *     description: >
 *       Auth0 envía el email de recuperación al usuario si existe.
 *       Siempre responde igual (respuesta genérica) para evitar enumeración de usuarios.
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
 *         description: Respuesta genérica (independiente de si el correo existe).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Si el correo existe, recibirás un enlace en breve."
 */
router.post('/recuperar-contrasena', authLimiter, ctrl.solicitarRecuperacion);

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
 *         description: Datos del perfil del usuario.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   patch:
 *     tags: [Autenticación]
 *     summary: Actualizar perfil (RF-1.5)
 *     description: El cambio de contraseña se realiza desde el portal de Auth0, no desde aquí.
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
 *         description: Perfil actualizado correctamente.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get('/perfil', ...authenticate, ctrl.getPerfil);
router.patch('/perfil', ...authenticate, ctrl.actualizarPerfil);

export default router;
