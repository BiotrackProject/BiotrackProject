import type { Request, RequestHandler } from 'express';
import type { tipo_archivo } from '@prisma/client';
import {
  createEvidenciasUpload,
  type EvidenciaBaseInput,
} from '../../shared/upload/evidenciasUpload.js';

/** mimetype → enum tipo_archivo de Prisma. null si no está permitido. */
function mapTipoArchivo(mimetype: string): tipo_archivo | null {
  if (mimetype.startsWith('image/')) return 'Imagen';
  if (mimetype.startsWith('video/')) return 'Video';
  if (mimetype.startsWith('audio/')) return 'Audio';
  if (mimetype === 'application/pdf') return 'Documento';
  return null;
}

const upload = createEvidenciasUpload({
  subdir: 'denuncias',
  maxFileSize: 8_000_000, // 8 MB por archivo (límite seguro S5693)
  maxFiles: 10,
  mapTipoArchivo,
});

/** Middleware multer: acepta hasta 10 archivos en el campo "evidencias". */
export const uploadEvidencias: RequestHandler = upload.middleware;

/** Descriptor de evidencia listo para persistir en Evidencia_Denuncia. */
export interface EvidenciaInput extends EvidenciaBaseInput {
  metadata: { nombre_original: string; mimetype: string };
}

/**
 * Convierte los archivos subidos (req.files) en descriptores de evidencia,
 * generando la URL pública y el hash de integridad de cada uno.
 */
export async function buildEvidencias(
  files: Express.Multer.File[] | undefined,
  req: Request
): Promise<EvidenciaInput[]> {
  const base = await upload.buildEvidencias(files, req);
  // buildEvidencias conserva el orden de files, así que base[i] ↔ files[i].
  return base.map((evidencia, i) => {
    const file = files?.[i];
    return {
      ...evidencia,
      metadata: file
        ? { nombre_original: file.originalname, mimetype: file.mimetype }
        : { nombre_original: '', mimetype: '' },
    };
  });
}
