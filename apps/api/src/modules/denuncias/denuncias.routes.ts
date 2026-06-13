import { Router, type Request, type Response } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { denunciaPublicaLimiter, seguimientoLimiter } from '../../middleware/rateLimiter.js';

const router: Router = Router();

/**
 * @openapi
 * tags:
 *   - name: Denuncias
 *     description: MOD-02 — Gestión de Denuncias (RF-2.1 a RF-2.6)
 */

const todo = (_req: Request, res: Response): void => { res.status(501).json({ error: 'Módulo en desarrollo.' }); };

// RF-2.1 — Público (anónimo o autenticado), máximo 10 req/min por IP
router.post('/', denunciaPublicaLimiter, todo);

// RF-2.6 — Consulta pública por código de seguimiento (sin auth)
router.get('/seguimiento/:codigo', seguimientoLimiter, todo);

// RF-2.5 — Exportación (antes que /:id para evitar colisión de rutas)
router.get('/exportar', authenticate, authorize('MOD_02_DENUNCIAS', 'Exportar'), todo);

// RF-2.2 + RF-2.4 — Listado con filtros y paginación
router.get('/', authenticate, authorize('MOD_02_DENUNCIAS', 'Leer'), todo);

// RF-2.2 — Detalle
router.get('/:id', authenticate, authorize('MOD_02_DENUNCIAS', 'Leer'), todo);

// RF-2.3 — Cambio de estado (máquina de estados)
router.patch('/:id/estado', authenticate, authorize('MOD_02_DENUNCIAS', 'Editar'), todo);

export default router;
