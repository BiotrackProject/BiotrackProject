import type { ReactNode } from 'react'

interface Props {
  state: { status: 'loading' } | { status: 'notFound' } | { status: 'error'; message: string }
  loadingText: string
  notFoundTitle: string
  notFoundDesc: string
  errorTitle: string
  /** Enlaces de acción (volver, crear, etc.) mostrados bajo el mensaje. */
  actions: ReactNode
}

/** Tarjetas de loading / no-encontrado / error para páginas públicas de detalle. */
export default function RecursoPublicoFallback({ state, loadingText, notFoundTitle, notFoundDesc, errorTitle, actions }: Readonly<Props>) {
  if (state.status === 'loading') {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
        {loadingText}
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm">
      <h2 className="text-xl font-black text-primary">
        {state.status === 'notFound' ? notFoundTitle : errorTitle}
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        {state.status === 'notFound' ? notFoundDesc : state.message}
      </p>
      {actions}
    </div>
  )
}
