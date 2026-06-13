import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import {
  listarAcciones,
  crearAccion,
  getAccion,
  actualizarAccion,
  cambiarEstadoAccion,
  publicarAccion,
  despublicarAccion,
  getAccionPublica,
} from './acciones.controller.js';

const router: Router = Router();

/**
 * @openapi
 * tags:
 *   - name: Acciones Correctivas
 *     description: MOD-05 — Acciones Correctivas (RF-5.1 a RF-5.3)
 */

// Acceso público (RF-5.2): sin autenticación — debe ir ANTES de /:id para evitar conflicto
router.get('/publicas/:id', getAccionPublica);

// Rutas protegidas
router.get('/', authenticate, authorize('MOD_05_ACCIONES', 'Leer'), listarAcciones);
router.post('/', authenticate, authorize('MOD_05_ACCIONES', 'Crear'), crearAccion);
router.get('/:id', authenticate, authorize('MOD_05_ACCIONES', 'Leer'), getAccion);
router.put('/:id', authenticate, authorize('MOD_05_ACCIONES', 'Editar'), actualizarAccion);
router.post('/:id/estado', authenticate, authorize('MOD_05_ACCIONES', 'Editar'), cambiarEstadoAccion);
router.post('/:id/publicar', authenticate, authorize('MOD_05_ACCIONES', 'Publicar'), publicarAccion);
router.delete('/:id/publicar', authenticate, authorize('MOD_05_ACCIONES', 'Publicar'), despublicarAccion);

export default router;
