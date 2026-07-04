import { useTranslation } from 'react-i18next'
import { ALL_STATUS_STYLES } from '../../constants/statuses'

export default function StatusBadge({ status, className = '' }) {
  const { t } = useTranslation()
  const style = ALL_STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-500 border border-gray-200'
  const label = String(t(`estados.${status}`, status))
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${style} ${className}`}>
      {label}
    </span>
  )
}
