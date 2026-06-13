import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { onToast } from '../../utils/toast'

const VARIANTS = {
  success: {
    Icon: CheckCircle,
    bg:   'bg-emerald-50 border-emerald-200',
    icon: 'text-emerald-600',
    text: 'text-emerald-800',
  },
  error: {
    Icon: XCircle,
    bg:   'bg-red-50 border-red-200',
    icon: 'text-red-600',
    text: 'text-red-800',
  },
  info: {
    Icon: Info,
    bg:   'bg-blue-50 border-blue-200',
    icon: 'text-primary',
    text: 'text-blue-800',
  },
  warning: {
    Icon: AlertTriangle,
    bg:   'bg-amber-50 border-amber-200',
    icon: 'text-amber-600',
    text: 'text-amber-800',
  },
}

const AUTO_DISMISS_MS = 3500

export default function ToastContainer() {
  const [items, setItems] = useState([])

  useEffect(() => {
    return onToast((item) => {
      setItems((prev) => [...prev, item])
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== item.id))
      }, AUTO_DISMISS_MS)
    })
  }, [])

  if (items.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[300] flex flex-col gap-2 pointer-events-none">
      {items.map((item) => {
        const v = VARIANTS[item.type] ?? VARIANTS.info
        const { Icon } = v
        return (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg min-w-[280px] max-w-[380px] animate-[slideIn_0.2s_ease] ${v.bg}`}
          >
            <Icon className={`h-4 w-4 shrink-0 ${v.icon}`} />
            <p className={`flex-1 text-sm font-medium ${v.text}`}>{item.message}</p>
            <button
              onClick={() => setItems((prev) => prev.filter((t) => t.id !== item.id))}
              className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
