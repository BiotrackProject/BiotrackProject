import { ALL_STATUS_STYLES } from '../../constants/statuses'
import { ESTADO_LABEL } from '../../services/denunciasService'

/**
 * Consistent status badge across the backoffice.
 * Looks up colour from the unified ALL_STATUS_STYLES map and shows a readable
 * label (e.g. "En_Investigacion" → "En Investigación") when available.
 */
export default function StatusBadge({ status, className = '' }) {
  const style = ALL_STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-500 border border-gray-200'
  const label = ESTADO_LABEL[status] ?? status
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${style} ${className}`}>
      {label}
    </span>
  )
}
