import type { Request, Response } from 'express';
import * as accionesService from './acciones.service.js';
import {
  crearAccionSchema,
  actualizarAccionSchema,
  cambiarEstadoAccionSchema,
  publicarAccionSchema,
} from './acciones.validation.js';

export async function listarAcciones(req: Request, res: Response): Promise<void> {
  const resultado = await accionesService.listarAcciones(req.user!.id, req.query as Record<string, unknown>);
  res.json(resultado);
}

export async function crearAccion(req: Request, res: Response): Promise<void> {
  const datos = crearAccionSchema.parse(req.body);
  const resultado = await accionesService.crearAccion(datos, req.user!.id, req.ip);
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
