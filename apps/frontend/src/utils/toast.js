/**
 * Lightweight toast event bus — no external dependency.
 * Usage in any component or service:
 *   import { toast } from '../utils/toast'
 *   toast.success('Guardado exitosamente')
 *   toast.error('Ocurrió un error')
 */

const listeners = new Set()

function notify(entry) {
  const item = { ...entry, id: Date.now() + Math.random() }
  listeners.forEach((fn) => fn(item))
}

export const toast = {
  success: (message) => notify({ type: 'success', message }),
  error:   (message) => notify({ type: 'error',   message }),
  info:    (message) => notify({ type: 'info',    message }),
  warning: (message) => notify({ type: 'warning', message }),
}

/** Subscribe to toast events. Returns unsubscribe function. */
export function onToast(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
