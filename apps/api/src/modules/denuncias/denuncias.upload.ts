import { createReadStream, mkdirSync } from 'node:fs';
import { randomUUID, createHash } from 'node:crypto';
import path from 'node:path';
import type { Request, RequestHandler } from 'express';
import multer from 'multer';
import type { tipo_archivo } from '@prisma/client';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/AppError.js';

/** Carpeta física donde se guardan las evidencias de denuncias. */
const UPLOAD_SUBDIR = 'denuncias';
const UPLOAD_DIR = path.resolve(env.STORAGE_LOCAL_PATH, UPLOAD_SUBDIR);
mkdirSync(UPLOAD_DIR, { recursive: true });

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB por archivo
const MAX_FILES = 10;
const MAX_FIELD_SIZE = 100 * 1024; // 100 KB por campo de texto
const MAX_FIELDS = 20; // nº máximo de campos de texto (no-archivo)
// Cota dura de partes del multipart: archivos + campos. Evita peticiones
// con un nº ilimitado de "parts" que no quedaría acotado por los demás límites.
const MAX_PARTS = MAX_FILES + MAX_FIELDS;

/** mimetype → enum tipo_archivo de Prisma. null si no está permitido. */
function mapTipoArchivo(mimetype: string): tipo_archivo | null {
  if (mimetype.startsWith('image/')) return 'Imagen';
  if (mimetype.startsWith('video/')) return 'Video';
  if (mimetype.startsWith('audio/')) return 'Audio';
  if (mimetype === 'application/pdf') return 'Documento';
  return null;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

/** Middleware multer: acepta hasta MAX_FILES archivos en el campo "evidencias". */
export const uploadEvidencias: RequestHandler = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
    fields: MAX_FIELDS,
    fieldSize: MAX_FIELD_SIZE,
    parts: MAX_PARTS,
  },
  fileFilter: (_req, file, cb) => {
    if (mapTipoArchivo(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(`Tipo de archivo no permitido: ${file.mimetype}`, 422));
    }
  },
}).array('evidencias', MAX_FILES);

/** Calcula el SHA-256 de un archivo leyéndolo en streaming (sin bloquear). */
function hashFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);
    stream.on('error', reject);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

/** Descriptor de evidencia listo para persistir en Evidencia_Denuncia. */
export interface EvidenciaInput {
  archivo_url: string;
  TipoArchivo: tipo_archivo;
  tamano_bytes: number;
  hash_archivo: string;
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
  if (!files || files.length === 0) return [];

  const baseUrl = `${req.protocol}://${req.get('host')}`;

  return Promise.all(
    files.map(async (file) => {
      const TipoArchivo = mapTipoArchivo(file.mimetype);
      if (!TipoArchivo) {
        // No debería ocurrir (fileFilter ya filtra), pero por seguridad de tipos.
        throw new AppError(`Tipo de archivo no permitido: ${file.mimetype}`, 422);
      }
      const hash_archivo = await hashFile(file.path);
      return {
        archivo_url: `${baseUrl}/uploads/${UPLOAD_SUBDIR}/${file.filename}`,
        TipoArchivo,
        tamano_bytes: file.size,
        hash_archivo,
        metadata: { nombre_original: file.originalname, mimetype: file.mimetype },
      };
    })
  );
}
