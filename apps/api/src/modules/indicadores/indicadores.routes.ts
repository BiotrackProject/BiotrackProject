import { Router, type Request, type Response } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

const router: Router = Router();

/**
 * @openapi
 * tags:
 *   - name: Panel de Indicadores
 *     description: MOD-04 — Panel de Indicadores (RF-4.1 a RF-4.4) — Actualización cada 5 minutos
 */

const todo = (_req: Request, res: Response): void => { res.status(501).json({ error: 'Módulo en desarrollo.' }); };

router.get('/impacto', ...authenticate, authorize('MOD_04_INDICADORES', 'LEER'), todo);
router.get('/frecuencia', ...authenticate, authorize('MOD_04_INDICADORES', 'LEER'), todo);
router.get('/cobertura', ...authenticate, authorize('MOD_04_INDICADORES', 'LEER'), todo);
router.get('/volumen', ...authenticate, authorize('MOD_04_INDICADORES', 'LEER'), todo);
router.get('/exportar', ...authenticate, authorize('MOD_04_INDICADORES', 'EXPORTAR'), todo);

export default router;
