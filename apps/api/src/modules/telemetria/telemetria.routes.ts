import { Router, type Request, type Response } from 'express';
import { telemetriaLimiter } from '../../middleware/rateLimiter.js';

const router: Router = Router();

/**
 * @openapi
 * tags:
 *   - name: Telemetría
 *     description: >
 *       MOD-03 — API de Ingesta de Telemetría (RF-3.2).
 *       Autenticación via API Key por zona (Bearer {API_KEY}).
 *       Documentada según Apéndice B del SRS. Usable como target en OWASP ZAP.
 */

/**
 * @openapi
 * /telemetria:
 *   post:
 *     tags: [Telemetría]
 *     summary: Ingesta de datos de sensores/drones (RF-3.2)
 *     description: >
 *       Endpoint RESTful documentado en OpenAPI 3.1.0 (RNF-M02).
 *       Autenticación: Authorization: Bearer {API_KEY} única por zona.
 *       Rate limit: 1000 req/min por API Key.
 *       HTTP 201 en éxito, 401 si API Key inválida, 422 si payload inválido, 429 si rate limit excedido.
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [zona_id, timestamp, tipo_sensor, valor, unidad]
 *             properties:
 *               zona_id:
 *                 type: string
 *                 format: uuid
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: ISO 8601. No puede ser futuro ni anterior a 7 días.
 *               tipo_sensor:
 *                 type: string
 *                 enum: [TURBIDEZ, TEMPERATURA, MOVIMIENTO, NIVEL_AGUA, AUDIO, GPS_TRACKER, OTRO]
 *               valor:
 *                 type: number
 *                 example: 45.7
 *               unidad:
 *                 type: string
 *                 maxLength: 20
 *                 example: "NTU"
 *               coordenadas:
 *                 type: object
 *                 description: GeoJSON Point (RFC 7946), opcional
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [Point]
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     example: [-70.12345, 18.47890]
 *     responses:
 *       201:
 *         description: Registro creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 registro_id:
 *                   type: string
 *                   format: uuid
 *                 timestamp_recibido:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: API Key inválida o no asociada a la zona_id.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "API Key inválida o sin permisos para esta zona."
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         description: Límite de 1000 peticiones/minuto excedido.
 */
router.post('/', telemetriaLimiter, (_req: Request, res: Response) => {
  res.status(501).json({ error: 'Módulo en desarrollo.' });
});

export default router;
