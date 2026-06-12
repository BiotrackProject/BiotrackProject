import { Router, type Request, type Response } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

const router: Router = Router();

/**
 * @openapi
 * tags:
 *   - name: Administración
 *     description: MOD-06 — Configuración y Administración (RF-6.1 a RF-6.3)
 */

const todo = (_req: Request, res: Response): void => { res.status(501).json({ error: 'Módulo en desarrollo.' }); };

// RF-6.1 — Gestión de usuarios
router.get('/usuarios', ...authenticate, authorize('MOD_06_ADMIN', 'LEER'), todo);
router.post('/usuarios', ...authenticate, authorize('MOD_06_ADMIN', 'CREAR'), todo);
router.get('/usuarios/:id', ...authenticate, authorize('MOD_06_ADMIN', 'LEER'), todo);
router.patch('/usuarios/:id', ...authenticate, authorize('MOD_06_ADMIN', 'EDITAR'), todo);
router.patch('/usuarios/:id/desactivar', ...authenticate, authorize('MOD_06_ADMIN', 'ELIMINAR_LOGICO'), todo);

// RF-6.2 — Gestión de roles y permisos RBAC
router.get('/roles', ...authenticate, authorize('MOD_06_ADMIN', 'LEER'), todo);
router.post('/roles', ...authenticate, authorize('MOD_06_ADMIN', 'CONFIGURAR'), todo);
router.put('/roles/:id', ...authenticate, authorize('MOD_06_ADMIN', 'CONFIGURAR'), todo);
router.patch('/usuarios/:id/rol', ...authenticate, authorize('MOD_06_ADMIN', 'CONFIGURAR'), todo);

// RF-6.3 — Gestión de solicitudes de registro
router.get('/solicitudes', ...authenticate, authorize('MOD_06_ADMIN', 'LEER'), todo);
router.patch('/solicitudes/:id', ...authenticate, authorize('MOD_06_ADMIN', 'CONFIGURAR'), todo);

export default router;
