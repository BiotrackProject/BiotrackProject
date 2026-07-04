import { SearchX } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  action = null,
}) {
  const { t } = useTranslation()
  const resolvedTitle = title ?? t('common.noResults')
  const resolvedDescription = description ?? t('common.noResultsDesc')
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 mb-4">
        <Icon className="h-7 w-7 text-gray-400" />
      </div>
      <p className="text-sm font-semibold text-gray-700 mb-1">{resolvedTitle}</p>
      <p className="text-xs text-gray-400 max-w-xs">{resolvedDescription}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
