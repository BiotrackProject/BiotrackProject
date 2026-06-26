/**
 * RF-1.2 — Bloqueo de login por intentos fallidos (en memoria, sin BD).
 *
 * Mantiene un contador por correo en un Map dentro del proceso Node:
 *  - 5 fallos consecutivos => bloqueo temporal de 15 minutos.
 *  - El contador y el bloqueo comparten una "ventana" deslizante; un registro
 *    inactivo durante 15 min se descarta (evita que el Map crezca sin límite).
 *  - Un login exitoso limpia el registro de inmediato.
 *
 * Limitaciones asumidas: el estado se pierde al reiniciar el servidor y no se
 * comparte entre múltiples instancias. Suficiente como capa defensiva junto al
 * authLimiter por IP; no sustituye un store persistente para alta disponibilidad.
 */

const MAX_INTENTOS = 5;
const BLOQUEO_MS = 15 * 60 * 1000;

interface Registro {
  intentos: number;
  /** Epoch ms tras el cual el registro deja de ser válido (ventana o fin del bloqueo). */
  expira: number;
  bloqueado: boolean;
}

const registros = new Map<string, Registro>();

function clave(correo: string): string {
  return correo.trim().toLowerCase();
}

/** Devuelve el registro vigente, o null si no existe o ya expiró (purgándolo). */
function vigente(k: string): Registro | null {
  const r = registros.get(k);
  if (!r) return null;
  if (Date.now() > r.expira) {
    registros.delete(k);
    return null;
  }
  return r;
}

/** Segundos restantes de bloqueo para el correo, o 0 si no está bloqueado. */
export function segundosBloqueo(correo: string): number {
  const r = vigente(clave(correo));
  if (!r?.bloqueado) return 0;
  return Math.ceil((r.expira - Date.now()) / 1000);
}

/**
 * Registra un intento fallido. Devuelve los segundos de bloqueo si este fallo
 * alcanzó el límite y disparó el bloqueo, o 0 en caso contrario.
 */
export function registrarFallo(correo: string): number {
  const k = clave(correo);
  const r = vigente(k) ?? { intentos: 0, expira: 0, bloqueado: false };

  r.intentos += 1;
  r.expira = Date.now() + BLOQUEO_MS;

  if (r.intentos >= MAX_INTENTOS) {
    r.bloqueado = true;
    registros.set(k, r);
    return Math.ceil(BLOQUEO_MS / 1000);
  }

  registros.set(k, r);
  return 0;
}

/** Limpia el registro de intentos tras un login exitoso. */
export function limpiarIntentos(correo: string): void {
  registros.delete(clave(correo));
}
