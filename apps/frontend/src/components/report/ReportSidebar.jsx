import isotipoGris from '../../assets/images/isotipogris.png'

const GUIDE = [
  { label: 'Campo obligatorio', field: 'Ubicación' },
  { label: 'Recomendado',       field: 'Evidencia' },
  { label: 'Opcional',          field: 'Contacto'  },
]

export default function ReportSidebar() {
  return (
    <div className="flex flex-col gap-4">
      {/* Guía rápida */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-black text-primary">Guía rápida</h3>

        <div className="flex flex-col gap-3">
          {GUIDE.map(({ label, field }) => (
            <div key={field} className="rounded-xl bg-surface p-4">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="font-bold text-primary">{field}</p>
            </div>
          ))}
        </div>

        {/* Protección de datos */}
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="mb-1 text-sm font-bold text-action">
            Protección de datos
          </p>
          <p className="text-xs leading-relaxed text-gray-600">
            Tu información personal es tratada con estricta confidencialidad.
            BIOTRACK gestiona los datos bajo controles de seguridad institucional
            y no los comparte con terceros.
          </p>
        </div>
      </div>

      {/* Estado del reporte */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-2 text-lg font-black text-primary">Estado del reporte</h3>
        <p className="text-xs leading-relaxed text-gray-500">
          Al registrarse, el reporte puede pasar por estados como "Recibido",
          "En verificación", "En seguimiento" y "Cerrado".
        </p>
      </div>

      {/* Watermark */}
      <div className="flex justify-center py-2 opacity-20">
        <img src={isotipoGris} alt="" className="w-36" />
      </div>
    </div>
  )
}
