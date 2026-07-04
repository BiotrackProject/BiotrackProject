import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface PaginationBarProps {
  page: number
  totalPages: number
  pageSize: number
  pageSizeOptions: number[]
  from: number
  to: number
  total: number
  dataTour?: string
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export default function PaginationBar({
  page,
  totalPages,
  pageSize,
  pageSizeOptions,
  from,
  to,
  total,
  dataTour,
  onPageChange,
  onPageSizeChange,
}: Readonly<PaginationBarProps>) {
  const { t } = useTranslation()
  return (
    <div data-tour={dataTour} className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-4 sm:px-5">
      <p className="order-2 w-full text-xs text-gray-400 sm:order-1 sm:w-auto">
        {t('denuncias.showing', { from, to, total })}
      </p>
      <div className="order-1 flex items-center gap-1 sm:order-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onPageChange(n)}
            className={`h-8 w-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${n === page ? 'bg-primary text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="order-3 flex items-center gap-2 text-xs text-gray-500">
        {t('denuncias.perPage')}
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-lg border border-gray-200 px-2 py-1 text-xs outline-none focus:border-primary"
        >
          {pageSizeOptions.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
    </div>
  )
}
