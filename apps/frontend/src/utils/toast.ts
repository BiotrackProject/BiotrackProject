type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: number
  type: ToastType
  message: string
}

type ToastListener = (item: ToastItem) => void

const listeners = new Set<ToastListener>()

function notify(entry: { type: ToastType; message: string }): void {
  const item: ToastItem = { ...entry, id: Date.now() + Math.random() }
  listeners.forEach((fn) => fn(item))
}

export const toast = {
  success: (message: string) => notify({ type: 'success', message }),
  error:   (message: string) => notify({ type: 'error',   message }),
  info:    (message: string) => notify({ type: 'info',    message }),
  warning: (message: string) => notify({ type: 'warning', message }),
}

export function onToast(fn: ToastListener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
