import { SearchX } from 'lucide-react'

/**
 * Empty state for tables and lists.
 * Props: icon (lucide component), title, description, action (node)
 */
export default function EmptyState({
  icon: Icon = SearchX,
  title = 'Sin resultados',
  description = 'No se encontraron registros con los filtros aplicados.',
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 mb-4">
        <Icon className="h-7 w-7 text-gray-400" />
      </div>
      <p className="text-sm font-semibold text-gray-700 mb-1">{title}</p>
      <p className="text-xs text-gray-400 max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
