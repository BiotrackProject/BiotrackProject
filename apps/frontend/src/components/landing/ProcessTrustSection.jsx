import { Link } from 'react-router-dom'

const STEPS = [
  {
    title: '1. Registro',
    copy: 'Recibimos tu reporte con ubicación, hora y tipo de actividad observada.',
  },
  {
    title: '2. Verificación',
    copy: 'El equipo técnico revisa evidencia y cruza información territorial.',
  },
  {
    title: '3. Seguimiento',
    copy: 'El caso avanza por estados visibles para consulta ciudadana.',
  },
  {
    title: '4. Acción',
    copy: 'Se coordinan medidas correctivas y control en zonas priorizadas.',
  },
]

export default function ProcessTrustSection() {
  return (
    <section className="bg-blue-50 py-14 sm:py-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary/70">Transparencia del proceso</p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-primary sm:text-3xl">
            ¿Qué pasa después de enviar un reporte?
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">
            BIOTRACK no termina en el formulario. El reporte entra a una ruta de validación y seguimiento que puedes consultar con tu ID.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {STEPS.map((step) => (
              <article key={step.title} className="rounded-xl border border-blue-100 bg-white p-4">
                <h3 className="text-sm font-black text-primary">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{step.copy}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl bg-primary p-6 text-white shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">Compromiso ciudadano</p>
          <h3 className="mt-2 text-xl font-black leading-tight">
            Menos incertidumbre, más claridad en cada caso.
          </h3>

          <ul className="mt-4 space-y-2 text-sm text-white/90">
            <li>Tiempo promedio de primera revisión: 3.4 horas</li>
            <li>Seguimiento por ID desde la sección de consulta</li>
            <li>Información personal bajo controles institucionales</li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to="/reporte/nuevo"
              className="rounded-lg bg-action px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-700"
            >
              Reportar ahora
            </Link>
            <Link
              to="/reportes"
              className="rounded-lg border border-white/40 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15"
            >
              Consultar estado
            </Link>
          </div>
        </aside>
      </div>
    </section>
  )
}
