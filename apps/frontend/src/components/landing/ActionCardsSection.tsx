import ActionCard from '../ui/ActionCard'

export default function ActionCardsSection() {
  return (
    <section className="bg-surface py-12 sm:py-14">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-6 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary/70">Acciones principales</p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-primary sm:text-3xl">Elige tu ruta en BIOTRACK</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Si observaste una actividad irregular, registra un reporte. Si ya reportaste, consulta su estado con
            ubicacion o ID de seguimiento.
          </p>
        </div>

        <div className="flex overflow-hidden rounded-3xl bg-primary shadow-sm">
          <ActionCard
            variant="panel"
            category="Reportar"
            title="Actividad Sospechosa de Extracción de Arena"
            description="Completa un formulario guiado, adjunta evidencia y recibe un ID para seguimiento."
            cta="Ir a reporte"
            to="/reporte/nuevo"
          />
          <div className="w-px self-stretch bg-white/20" />
          <ActionCard
            variant="panel"
            category="Consultar"
            title="Búsqueda de Reportes"
            description="Verifica estados, avances y detalle de casos registrados por la ciudadanía."
            cta="Ir a consulta"
            to="/reportes"
          />
        </div>
      </div>
    </section>
  )
}
