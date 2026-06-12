import { Router, type Request, type Response } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

const router: Router = Router();

/**
 * @openapi
 * tags:
 *   - name: Acciones Correctivas
 *     description: MOD-05 — Acciones Correctivas (RF-5.1 a RF-5.3)
 */

const todo = (_req: Request, res: Response): void => { res.status(501).json({ error: 'Módulo en desarrollo.' }); };

router.get('/', ...authenticate, authorize('MOD_05_ACCIONES', 'LEER'), todo);
router.post('/', ...authenticate, authorize('MOD_05_ACCIONES', 'CREAR'), todo);
router.get('/:id', ...authenticate, authorize('MOD_05_ACCIONES', 'LEER'), todo);
router.put('/:id', ...authenticate, authorize('MOD_05_ACCIONES', 'EDITAR'), todo);
router.post('/:id/publicar', ...authenticate, authorize('MOD_05_ACCIONES', 'PUBLICAR'), todo);
router.delete('/:id/publicar', ...authenticate, authorize('MOD_05_ACCIONES', 'PUBLICAR'), todo);
router.get('/:id/exportar', ...authenticate, authorize('MOD_05_ACCIONES', 'EXPORTAR'), todo);

// Acceso público (RF-5.2): sin auth
router.get('/publicas/:id', todo);

export default router;
