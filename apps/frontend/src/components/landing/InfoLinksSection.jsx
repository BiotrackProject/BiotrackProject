import { Link } from 'react-router-dom'

const ITEMS = [
  {
    title: 'Antes de Reportar',
    description:
      'Conoce señales frecuentes de extraccion ilegal y prepara evidencia util (fotos, horario, ubicacion) para que tu reporte sea mas verificable.',
    button: 'Iniciar reporte guiado',
    href: '/reporte/nuevo',
  },
  {
    title: 'Seguimiento de Casos',
    description:
      'Consulta reportes por ID o ubicacion para revisar su estado actual, linea de tiempo y progreso de verificacion.',
    button: 'Buscar reportes',
    href: '/reportes',
  },
]

export default function InfoLinksSection() {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-12">
          {ITEMS.map(({ title, description, button, href }) => (
            <div key={title} className="max-w-xl">
              <h2 className="mb-3 text-base font-black uppercase tracking-wide text-primary">
                {title}
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-gray-600">{description}</p>
              <Link
                to={href}
                className="rounded-lg border border-primary px-5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
              >
                {button}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
