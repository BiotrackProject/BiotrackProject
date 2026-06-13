import { Router, type Request, type Response } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import {
  listarUsuarios,
  crearUsuario,
  getUsuario,
  actualizarUsuario,
  desactivarUsuario,
  listarRoles,
  asignarRol,
  listarSolicitudes,
  revisarSolicitud,
} from './admin.controller.js';

const router: Router = Router();

/**
 * @openapi
 * tags:
 *   - name: Administración
 *     description: MOD-06 — Configuración y Administración (RF-6.1 a RF-6.3)
 */

const todo = (_req: Request, res: Response): void => { res.status(501).json({ error: 'Endpoint en desarrollo.' }); };

// RF-6.1 — Gestión de usuarios
router.get('/usuarios', authenticate, authorize('MOD_06_ADMIN', 'Leer'), listarUsuarios);
router.post('/usuarios', authenticate, authorize('MOD_06_ADMIN', 'Crear'), crearUsuario);
router.get('/usuarios/:id', authenticate, authorize('MOD_06_ADMIN', 'Leer'), getUsuario);
router.patch('/usuarios/:id', authenticate, authorize('MOD_06_ADMIN', 'Editar'), actualizarUsuario);
router.patch('/usuarios/:id/desactivar', authenticate, authorize('MOD_06_ADMIN', 'Eliminar_Logico'), desactivarUsuario);

// RF-6.2 — Gestión de roles y permisos RBAC
router.get('/roles', authenticate, authorize('MOD_06_ADMIN', 'Leer'), listarRoles);
router.post('/roles', authenticate, authorize('MOD_06_ADMIN', 'Configurar'), todo);
router.put('/roles/:id', authenticate, authorize('MOD_06_ADMIN', 'Configurar'), todo);
router.patch('/usuarios/:id/rol', authenticate, authorize('MOD_06_ADMIN', 'Configurar'), asignarRol);

// RF-6.3 — Gestión de solicitudes de registro
router.get('/solicitudes', authenticate, authorize('MOD_06_ADMIN', 'Leer'), listarSolicitudes);
router.patch('/solicitudes/:id', authenticate, authorize('MOD_06_ADMIN', 'Configurar'), revisarSolicitud);

export default router;
