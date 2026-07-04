import { FILE_COLORS } from '../../constants/fileColors'
import type { Evidencia } from '../../services/denunciasService'

interface EvidenciaListProps {
  evidencias: Evidencia[]
  emptyText: string
}

export default function EvidenciaList({ evidencias, emptyText }: Readonly<EvidenciaListProps>) {
  if (evidencias.length === 0) {
    return <p className="text-sm text-gray-400">{emptyText}</p>
  }
  return (
    <div className="flex flex-wrap gap-6">
      {evidencias.map((ev) => {
        const ext = ev.TipoArchivo.toUpperCase()
        return (
          <a
            key={ev.IDEvidencia}
            href={ev.archivo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2"
          >
            <div className={`flex h-14 w-12 items-center justify-center rounded-xl text-xs font-bold ${FILE_COLORS[ext] ?? 'bg-gray-100 text-gray-500'}`}>
              {ext}
            </div>
            <span className="text-xs text-gray-500 max-w-[80px] text-center truncate">
              {ev.archivo_url.split('/').pop()}
            </span>
          </a>
        )
      })}
    </div>
  )
}
