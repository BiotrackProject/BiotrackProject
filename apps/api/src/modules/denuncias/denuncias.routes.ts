import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { denunciaPublicaLimiter, seguimientoLimiter } from '../../middleware/rateLimiter.js';
import { uploadEvidencias } from './denuncias.upload.js';
import {
  crearDenunciaPublica,
  getSeguimiento,
  listarDenuncias,
  getDenunciasMapa,
  getDenuncia,
  cambiarEstado,
  exportarDenuncias,
} from './denuncias.controller.js';

const router: Router = Router();

/**
 * @openapi
 * tags:
 *   - name: Denuncias
 *     description: MOD-02 — Gestión de Denuncias (RF-2.1 a RF-2.6)
 */

// RF-2.1 — Público (anónimo o autenticado), máximo 10 req/min por IP.
// Acepta multipart/form-data con evidencias adjuntas (campo "evidencias").
router.post('/', denunciaPublicaLimiter, uploadEvidencias, crearDenunciaPublica);

// RF-2.6 — Consulta pública por código de seguimiento (sin auth)
router.get('/seguimiento/:codigo', seguimientoLimiter, getSeguimiento);

// RF-2.5 — Exportación (antes que /:id para evitar colisión de rutas)
router.get('/exportar', authenticate, authorize('MOD_02_DENUNCIAS', 'Exportar'), exportarDenuncias);

// Listado ligero para el mapa (antes que /:id para evitar colisión de rutas)
router.get('/mapa', authenticate, authorize('MOD_02_DENUNCIAS', 'Leer'), getDenunciasMapa);

// RF-2.2 + RF-2.4 — Listado con filtros y paginación
router.get('/', authenticate, authorize('MOD_02_DENUNCIAS', 'Leer'), listarDenuncias);

// RF-2.2 — Detalle
router.get('/:id', authenticate, authorize('MOD_02_DENUNCIAS', 'Leer'), getDenuncia);

// RF-2.3 — Cambio de estado (máquina de estados)
router.patch('/:id/estado', authenticate, authorize('MOD_02_DENUNCIAS', 'Editar'), cambiarEstado);

export default router;
