import { useEffect } from 'react'
import { X, AlertTriangle, Info } from 'lucide-react'

/**
 * Generic Modal
 * Props:
 *  - open: bool
 *  - onClose: fn
 *  - title: string
 *  - children: node  (body content)
 *  - variant: 'default' | 'danger'
 *  - confirmLabel: string  (default: 'Confirmar')
 *  - cancelLabel: string   (default: 'Cancelar')
 *  - onConfirm: fn         (if omitted, no confirm button)
 *  - loading: bool
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  variant = 'default',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  loading = false,
}) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const isDanger = variant === 'danger'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md animate-[modalIn_220ms_cubic-bezier(0.23,1,0.32,1)] origin-center overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-100 ${isDanger ? 'bg-red-50' : ''}`}>
          <div className="flex items-center gap-2.5">
            {isDanger
              ? <AlertTriangle className="h-5 w-5 text-action shrink-0" />
              : <Info className="h-5 w-5 text-primary shrink-0" />
            }
            <h2 className={`text-base font-bold ${isDanger ? 'text-action' : 'text-primary'}`}>
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-[transform,background-color,color] duration-150 ease-out hover:bg-gray-100 hover:text-gray-600 active:scale-[0.96]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 text-sm text-gray-600 leading-relaxed">
          {children}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-[transform,background-color,color,border-color] duration-150 ease-out hover:bg-gray-100 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100"
          >
            {cancelLabel}
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-[transform,background-color,box-shadow] duration-150 ease-out active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${
                isDanger
                  ? 'bg-action hover:bg-red-700'
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {loading ? 'Procesando...' : confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
