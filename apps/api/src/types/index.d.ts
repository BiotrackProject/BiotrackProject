import type { ModuloSistema, AccionPermiso } from '@prisma/client';

export interface UsuarioRequest {
  id: string;
  auth0Id: string;
  rolId: string | null;
  rolNombre: string | null;
  permisos: Array<{ modulo: ModuloSistema; accion: AccionPermiso }>;
}

declare global {
  namespace Express {
    interface Request {
      user?: UsuarioRequest;
    }
  }
}
