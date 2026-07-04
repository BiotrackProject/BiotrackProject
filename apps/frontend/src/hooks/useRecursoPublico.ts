import { useEffect, useState } from 'react'

export type FetchState<T> =
  | { status: 'loading' }
  | { status: 'found'; data: T }
  | { status: 'notFound' }
  | { status: 'error'; message: string }

/**
 * Carga un recurso público por id. Los errores cuyo mensaje indica
 * "no encontrado" (o 404) se mapean al estado notFound; el resto a error.
 */
export function useRecursoPublico<T>(
  id: string | undefined,
  fetcher: (id: string) => Promise<T>,
  fallbackError: string,
): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>(() => (id ? { status: 'loading' } : { status: 'notFound' }))

  useEffect(() => {
    if (!id) return
    let active = true
    fetcher(id)
      .then((data) => { if (active) setState({ status: 'found', data }) })
      .catch((err: unknown) => {
        if (!active) return
        const message = err instanceof Error ? err.message : fallbackError
        if (/no disponible|no encontrad|not found|404/i.test(message)) {
          setState({ status: 'notFound' })
        } else {
          setState({ status: 'error', message })
        }
      })
    return () => { active = false }
    // Solo depende del id: fetcher/fallbackError suelen ser inline y cambiarían
    // de identidad en cada render, provocando refetch infinito.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return state
}
