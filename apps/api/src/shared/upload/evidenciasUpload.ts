import { createReadStream, mkdirSync } from 'node:fs';
import { randomUUID, createHash } from 'node:crypto';
import path from 'node:path';
import type { Request, RequestHandler } from 'express';
import multer from 'multer';
import type { tipo_archivo } from '@prisma/client';
import { env } from '../../config/env.js';
import { AppError } from '../errors/AppError.js';

const MAX_FIELD_SIZE = 100 * 1024; // 100 KB por campo de texto
const MAX_FIELDS = 20; // nº máximo de campos de texto (no-archivo)

/** Descriptor de evidencia listo para persistir (campos comunes a todos los módulos). */
export interface EvidenciaBaseInput {
  archivo_url: string;
  TipoArchivo: tipo_archivo;
  tamano_bytes: number;
  hash_archivo: string;
}

export interface EvidenciasUploadOptions {
  /** Subcarpeta física bajo STORAGE_LOCAL_PATH (también parte de la URL pública). */
  subdir: string;
  maxFileSize: number;
  maxFiles: number;
  /** mimetype → enum tipo_archivo de Prisma. null si no está permitido. */
  mapTipoArchivo: (mimetype: string) => tipo_archivo | null;
  /**
   * Extensión derivada del mimetype ya validado (p. ej. 'image/png' → '.png').
   * Si se omite, se usa la del nombre original saneada (solo [a-z0-9]).
   */
  extForMimetype?: (mimetype: string) => string;
}

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

export interface EvidenciasUpload {
  middleware: RequestHandler;
  buildEvidencias: (
    files: Express.Multer.File[] | undefined,
    req: Request
  ) => Promise<EvidenciaBaseInput[]>;
}

/**
 * Crea el middleware multer y el builder de descriptores de evidencia para un
 * módulo (denuncias, acciones, ...), compartiendo storage, límites y hashing.
 */
export function createEvidenciasUpload(opts: EvidenciasUploadOptions): EvidenciasUpload {
  const uploadDir = path.resolve(env.STORAGE_LOCAL_PATH, opts.subdir);
  mkdirSync(uploadDir, { recursive: true });

  // Cota dura de partes del multipart: archivos + campos. Evita peticiones
  // con un nº ilimitado de "parts" que no quedaría acotado por los demás límites.
  const maxParts = opts.maxFiles + MAX_FIELDS;

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = opts.extForMimetype
        ? opts.extForMimetype(file.mimetype)
        : path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '').slice(0, 10);
      cb(null, `${randomUUID()}${ext}`);
    },
  });

  /** Middleware multer: acepta hasta maxFiles archivos en el campo "evidencias". */
  const middleware: RequestHandler = multer({
    storage,
    limits: {
      fileSize: opts.maxFileSize,
      files: opts.maxFiles,
      fields: MAX_FIELDS,
      fieldSize: MAX_FIELD_SIZE,
      parts: maxParts,
    },
    fileFilter: (_req, file, cb) => {
      if (opts.mapTipoArchivo(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new AppError(`Tipo de archivo no permitido: ${file.mimetype}`, 422));
      }
    },
  }).array('evidencias', opts.maxFiles);

  /**
   * Convierte los archivos subidos (req.files) en descriptores de evidencia,
   * generando la URL pública y el hash de integridad de cada uno.
   */
  async function buildEvidencias(
    files: Express.Multer.File[] | undefined,
    req: Request
  ): Promise<EvidenciaBaseInput[]> {
    if (!files || files.length === 0) return [];

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    return Promise.all(
      files.map(async (file) => {
        const TipoArchivo = opts.mapTipoArchivo(file.mimetype);
        if (!TipoArchivo) {
          // No debería ocurrir (fileFilter ya filtra), pero por seguridad de tipos.
          throw new AppError(`Tipo de archivo no permitido: ${file.mimetype}`, 422);
        }
        const hash_archivo = await hashFile(file.path);
        return {
          archivo_url: `${baseUrl}/uploads/${opts.subdir}/${file.filename}`,
          TipoArchivo,
          tamano_bytes: file.size,
          hash_archivo,
        };
      })
    );
  }

  return { middleware, buildEvidencias };
}
