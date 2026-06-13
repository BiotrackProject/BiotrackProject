import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import {
  getResumen,
  getImpacto,
  getFrecuencia,
  getCobertura,
  getVolumen,
} from './indicadores.controller.js';

const router: Router = Router();

/**
 * @openapi
 * tags:
 *   - name: Panel de Indicadores
 *     description: MOD-04 — Panel de Indicadores (RF-4.1 a RF-4.4)
 */

router.get('/resumen', authenticate, authorize('MOD_04_INDICADORES', 'Leer'), getResumen);
router.get('/impacto', authenticate, authorize('MOD_04_INDICADORES', 'Leer'), getImpacto);
router.get('/frecuencia', authenticate, authorize('MOD_04_INDICADORES', 'Leer'), getFrecuencia);
router.get('/cobertura', authenticate, authorize('MOD_04_INDICADORES', 'Leer'), getCobertura);
router.get('/volumen', authenticate, authorize('MOD_04_INDICADORES', 'Leer'), getVolumen);

export default router;
