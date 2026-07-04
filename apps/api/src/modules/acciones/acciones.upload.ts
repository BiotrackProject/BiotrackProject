import type { Request, RequestHandler } from 'express';
import type { tipo_archivo } from '@prisma/client';
import {
  createEvidenciasUpload,
  type EvidenciaBaseInput,
} from '../../shared/upload/evidenciasUpload.js';

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/** mimetype → enum tipo_archivo de Prisma. null si no está permitido. */
function mapTipoArchivo(mimetype: string): tipo_archivo | null {
  if (mimetype === 'image/jpeg' || mimetype === 'image/png') return 'Imagen';
  if (mimetype === 'application/pdf' || mimetype === DOCX_MIME) return 'Documento';
  return null;
}

// La extensión se deriva del mimetype ya validado — nunca del nombre que envía
// el cliente — para que un PDF renombrado a .html no se sirva como HTML.
const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'application/pdf': '.pdf',
  [DOCX_MIME]: '.docx',
};

// RF-5.1: máx. 5 archivos, 10 MB por archivo. Tipos: PDF, JPG, PNG, DOCX.
const upload = createEvidenciasUpload({
  subdir: 'acciones',
  maxFileSize: 10_000_000, // 10 MB por archivo
  maxFiles: 5,
  mapTipoArchivo,
  extForMimetype: (mimetype) => EXT_BY_MIME[mimetype] ?? '',
});

/** Middleware multer: acepta hasta 5 archivos en el campo "evidencias". */
export const uploadEvidencias: RequestHandler = upload.middleware;

/** Descriptor de evidencia listo para persistir en Evidencia_Accion. */
export type EvidenciaAccionInput = EvidenciaBaseInput;

/**
 * Convierte los archivos subidos (req.files) en descriptores de evidencia,
 * generando la URL pública y el hash de integridad de cada uno.
 */
export function buildEvidenciasAccion(
  files: Express.Multer.File[] | undefined,
  req: Request
): Promise<EvidenciaAccionInput[]> {
  return upload.buildEvidencias(files, req);
}
