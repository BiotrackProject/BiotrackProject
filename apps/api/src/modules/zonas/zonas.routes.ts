import { Router, type Request, type Response } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

const router: Router = Router();

/**
 * @openapi
 * tags:
 *   - name: Zonas Críticas
 *     description: MOD-03 — Monitoreo de Zonas Críticas (RF-3.1 a RF-3.5)
 */

const todo = (_req: Request, res: Response): void => { res.status(501).json({ error: 'Módulo en desarrollo.' }); };

router.get('/', ...authenticate, authorize('MOD_03_ZONAS', 'LEER'), todo);
router.post('/', ...authenticate, authorize('MOD_03_ZONAS', 'CREAR'), todo);
router.get('/:id', ...authenticate, authorize('MOD_03_ZONAS', 'LEER'), todo);
router.put('/:id', ...authenticate, authorize('MOD_03_ZONAS', 'EDITAR'), todo);

// RF-3.4 — Actualizar nivel de riesgo
router.patch('/:id/riesgo', ...authenticate, authorize('MOD_03_ZONAS', 'EDITAR'), todo);

// RF-3.3 — Historial de telemetría con gráficos
router.get('/:id/telemetria', ...authenticate, authorize('MOD_03_ZONAS', 'LEER'), todo);

// RF-3.5 — Exportar historial (CSV, JSON, XLSX)
router.get('/:id/telemetria/exportar', ...authenticate, authorize('MOD_03_ZONAS', 'EXPORTAR'), todo);

export default router;
