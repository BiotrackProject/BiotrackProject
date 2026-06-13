import type { Request, Response } from 'express';
import * as denunciasService from './denuncias.service.js';
import {
  crearDenunciaPublicaSchema,
  filtrosDenunciasSchema,
  cambiarEstadoSchema,
} from './denuncias.validation.js';

export async function crearDenunciaPublica(req: Request, res: Response): Promise<void> {
  const datos = crearDenunciaPublicaSchema.parse(req.body);
  const resultado = await denunciasService.crearDenunciaPublica(datos, req.ip);
  res.status(201).json(resultado);
}

export async function getSeguimiento(req: Request, res: Response): Promise<void> {
  const { codigo } = req.params as { codigo: string };
  const resultado = await denunciasService.getSeguimiento(codigo);
  res.json(resultado);
}

export async function listarDenuncias(req: Request, res: Response): Promise<void> {
  const filtros = filtrosDenunciasSchema.parse(req.query);
  const resultado = await denunciasService.listarDenuncias(filtros);
  res.json(resultado);
}

export async function getDenuncia(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params['id'] as string, 10);
  const resultado = await denunciasService.getDenuncia(id);
  res.json(resultado);
}

export async function cambiarEstado(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params['id'] as string, 10);
  const datos = cambiarEstadoSchema.parse(req.body);
  const resultado = await denunciasService.cambiarEstado(id, datos, req.user!.id, req.ip);
  res.json(resultado);
}

export async function exportarDenuncias(req: Request, res: Response): Promise<void> {
  const filtros = filtrosDenunciasSchema.parse(req.query);
  const resultado = await denunciasService.exportarTodasDenuncias(filtros);
  res.json(resultado);
}
