export interface UsuarioRequest {
  id: string;
  rolId: string | null;
  rolNombre: string | null;
  permisos: Array<{ modulo: string; accion: string }>;
}

declare global {
  namespace Express {
    interface Request {
      user?: UsuarioRequest;
    }
  }
}
