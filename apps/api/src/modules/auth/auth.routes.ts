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
router.get('/perfil', authenticate, ctrl.getPerfil);
router.patch('/perfil', authenticate, ctrl.actualizarPerfil);

export default router;
