import type { Request, Response } from 'express';
import * as adminService from './admin.service.js';
import {
  crearUsuarioSchema,
  actualizarUsuarioSchema,
  asignarRolSchema,
  revisarSolicitudSchema,
} from './admin.validation.js';

export async function listarUsuarios(req: Request, res: Response): Promise<void> {
  const q = typeof req.query['q'] === 'string' ? req.query['q'] : undefined;
  const resultado = await adminService.listarUsuarios(q);
  res.json(resultado);
}

export async function crearUsuario(req: Request, res: Response): Promise<void> {
  const datos = crearUsuarioSchema.parse(req.body);
  const resultado = await adminService.crearUsuario(datos, req.user!.id, req.ip);
  res.status(201).json(resultado);
}

export async function getUsuario(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const resultado = await adminService.getUsuario(id);
  res.json(resultado);
}

export async function actualizarUsuario(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const datos = actualizarUsuarioSchema.parse(req.body);
  const resultado = await adminService.actualizarUsuario(id, datos, req.user!.id, req.ip);
  res.json(resultado);
}

export async function desactivarUsuario(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const resultado = await adminService.desactivarUsuario(id, req.user!.id, req.ip);
  res.json(resultado);
}

export async function listarRoles(req: Request, res: Response): Promise<void> {
  const resultado = await adminService.listarRoles();
  res.json(resultado);
}

export async function asignarRol(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const datos = asignarRolSchema.parse(req.body);
  const resultado = await adminService.asignarRol(id, datos, req.user!.id, req.ip);
  res.json(resultado);
}

export async function listarSolicitudes(req: Request, res: Response): Promise<void> {
  const estado = typeof req.query['estado'] === 'string' ? req.query['estado'] : undefined;
  const resultado = await adminService.listarSolicitudes(estado);
  res.json(resultado);
}

export async function revisarSolicitud(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const datos = revisarSolicitudSchema.parse(req.body);
  const resultado = await adminService.revisarSolicitud(id, datos, req.user!.id, req.ip);
  res.json(resultado);
}
