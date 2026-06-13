import type { Request, Response } from 'express';
import * as indicadoresService from './indicadores.service.js';

export async function getResumen(_req: Request, res: Response): Promise<void> {
  const resultado = await indicadoresService.getResumen();
  res.json(resultado);
}

export async function getImpacto(_req: Request, res: Response): Promise<void> {
  const resultado = await indicadoresService.getImpacto();
  res.json(resultado);
}

export async function getFrecuencia(_req: Request, res: Response): Promise<void> {
  const resultado = await indicadoresService.getFrecuencia();
  res.json(resultado);
}

export async function getCobertura(_req: Request, res: Response): Promise<void> {
  const resultado = await indicadoresService.getCobertura();
  res.json(resultado);
}

export async function getVolumen(_req: Request, res: Response): Promise<void> {
  const resultado = await indicadoresService.getVolumen();
  res.json(resultado);
}
