import { useTranslation } from 'react-i18next'
import { ESTADO_STYLES } from '../../services/denunciasService'
import type { HistorialEstado } from '../../services/denunciasService'
import { formatDateTime } from '../../utils/dates'

interface HistorialEstadosProps {
  historial: HistorialEstado[]
}

export default function HistorialEstados({ historial }: Readonly<HistorialEstadosProps>) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-3">
      {historial.map((h) => (
        <div key={h.id} className="flex items-start gap-3 text-sm">
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ESTADO_STYLES[h.estado_anterior]}`}>
                {t(`estados.${h.estado_anterior}`)}
              </span>
              <span className="text-gray-400">→</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ESTADO_STYLES[h.estado_nuevo]}`}>
                {t(`estados.${h.estado_nuevo}`)}
              </span>
            </div>
            {h.comentario && <p className="text-xs text-gray-500 mt-1">{h.comentario}</p>}
            <p className="text-xs text-gray-400">
              {h.Usuario.nombre_completo} · {formatDateTime(h.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
