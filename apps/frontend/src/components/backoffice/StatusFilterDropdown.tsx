import { SlidersHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { EstadoDenuncia } from '../../services/denunciasService'

interface StatusFilterDropdownProps {
  estados: EstadoDenuncia[]
  filterEstado: EstadoDenuncia | ''
  filterOpen: boolean
  filterLabel: string
  filterTitle: string
  filterAll: string
  onToggle: () => void
  onSelect: (estado: EstadoDenuncia | '') => void
}

export default function StatusFilterDropdown({
  estados,
  filterEstado,
  filterOpen,
  filterLabel,
  filterTitle,
  filterAll,
  onToggle,
  onSelect,
}: Readonly<StatusFilterDropdownProps>) {
  const { t } = useTranslation()
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        aria-label={filterLabel}
        aria-expanded={filterOpen}
        className={`flex items-center justify-center h-10 w-10 rounded-xl border transition-colors ${filterOpen || filterEstado ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
      >
        <SlidersHorizontal className="h-4 w-4" />
      </button>
      {filterOpen && (
        <div className="absolute top-12 left-0 z-20 w-48 rounded-xl border border-gray-100 bg-white shadow-lg p-2">
          <p className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">{filterTitle}</p>
          {(['', ...estados] as Array<EstadoDenuncia | ''>).map((e) => (
            <button
              key={e}
              onClick={() => onSelect(e)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filterEstado === e ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {e ? t(`estados.${e}`) : filterAll}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
