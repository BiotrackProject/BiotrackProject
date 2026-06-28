import type { Request, Response } from 'express';
import * as accionesService from './acciones.service.js';
import { buildEvidenciasAccion } from './acciones.upload.js';
import { generarPDF, generarXLSX } from './acciones.export.js';
import {
  crearAccionSchema,
  actualizarAccionSchema,
  cambiarEstadoAccionSchema,
  publicarAccionSchema,
  exportarAccionSchema,
} from './acciones.validation.js';

export async function listarAcciones(req: Request, res: Response): Promise<void> {
  const resultado = await accionesService.listarAcciones(req.user!.id, req.query as Record<string, unknown>);
  res.json(resultado);
}

/**
 * En multipart/form-data los arrays llegan como cadenas JSON ("[1,2]").
 * Se parsean antes de validar con Zod.
 */
function parseJsonArrayField(value: unknown): unknown {
  if (typeof value === 'string' && value.trim().startsWith('[')) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

export async function crearAccion(req: Request, res: Response): Promise<void> {
  const body = { ...req.body } as Record<string, unknown>;
  if (body['denunciaIds'] !== undefined) body['denunciaIds'] = parseJsonArrayField(body['denunciaIds']);
  if (body['zonaIds'] !== undefined) body['zonaIds'] = parseJsonArrayField(body['zonaIds']);

  const datos = crearAccionSchema.parse(body);
  const evidencias = await buildEvidenciasAccion(
    req.files as Express.Multer.File[] | undefined,
    req
  );
  const resultado = await accionesService.crearAccion(datos, evidencias, req.user!.id, req.ip);
  res.status(201).json(resultado);
}

export async function getAccion(req: Request, res: Response): Promise<void> {
  const id = String(req.params['id']);
  const resultado = await accionesService.getAccion(id);
  res.json(resultado);
}

export async function actualizarAccion(req: Request, res: Response): Promise<void> {
  const id = String(req.params['id']);
  const datos = actualizarAccionSchema.parse(req.body);
  const resultado = await accionesService.actualizarAccion(id, datos, req.user!.id, req.ip);
  res.json(resultado);
}

export async function cambiarEstadoAccion(req: Request, res: Response): Promise<void> {
  const id = String(req.params['id']);
  const datos = cambiarEstadoAccionSchema.parse(req.body);
  const resultado = await accionesService.cambiarEstadoAccion(id, datos, req.user!.id, req.ip);
  res.json(resultado);
}

export async function publicarAccion(req: Request, res: Response): Promise<void> {
  const id = String(req.params['id']);
  const datos = publicarAccionSchema.parse(req.body);
  const resultado = await accionesService.publicarAccion(id, datos, req.user!.id, req.ip);
  res.json(resultado);
}

export async function despublicarAccion(req: Request, res: Response): Promise<void> {
  const id = String(req.params['id']);
  const resultado = await accionesService.despublicarAccion(id, req.user!.id, req.ip);
  res.json(resultado);
}

export async function getAccionPublica(req: Request, res: Response): Promise<void> {
  const id = String(req.params['id']);
  const resultado = await accionesService.getAccionPublica(id);
  res.json(resultado);
}

export async function exportarAccion(req: Request, res: Response): Promise<void> {
  const id = String(req.params['id']);
  const { formato, incluir_evidencias } = exportarAccionSchema.parse(req.query);
  const accion = await accionesService.getAccion(id);

  const resultado =
    formato === 'PDF'
      ? await generarPDF(accion as never, incluir_evidencias)
      : await generarXLSX(accion as never);

  res.setHeader('Content-Type', resultado.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${resultado.filename}"`);
  res.send(resultado.buffer);
}
