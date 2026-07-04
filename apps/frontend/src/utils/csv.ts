import { descargarBlob } from './download'
import { formatDate } from './dates'
import type { Denuncia } from '../services/denunciasService'

export function exportDenunciaCSV(data: Denuncia[], headers: string[], filename: string): void {
  const rows = data.map((d) => [
    d.codigo_seguimiento,
    `"${(d.Descripcion ?? '').replace(/"/g, "'")}"`,
    d.tipo_actividad,
    formatDate(d.Fecha_denuncia),
    d.Estado,
  ])
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
  descargarBlob(new Blob([csv], { type: 'text/csv' }), filename)
}
