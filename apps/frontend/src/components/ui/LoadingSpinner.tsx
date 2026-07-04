import { useTranslation } from 'react-i18next'

export default function LoadingSpinner({ fullPage = false }) {
  const { t } = useTranslation()
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-primary" />
      <p className="text-xs text-gray-400">{t('common.loading')}</p>
    </div>
  )

  if (fullPage) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}
