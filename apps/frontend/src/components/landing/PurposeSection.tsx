import { Contact, Target, Heart } from 'lucide-react'

const CARDS = [
  {
    Icon: Contact,
    title: 'Para qué existe BIOTRACK',
    description:
      'Convertir denuncias ciudadanas en información accionable para proteger ríos, costas y comunidades afectadas por extracción ilegal.',
  },
  {
    Icon: Target,
    title: 'Qué queremos lograr',
    description:
      'Que cualquier persona pueda reportar en minutos, dar seguimiento con transparencia y ver resultados en territorio.',
  },
  {
    Icon: Heart,
    title: 'Cómo te acompañamos',
    description:
      'Guiamos cada paso con un proceso claro, protección de datos y canales de consulta para mantenerte informado.',
  },
]

export default function PurposeSection() {
  return (
    <section className="bg-surface pb-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative z-10 -mt-10 rounded-2xl bg-white px-6 py-8 shadow-md sm:-mt-14 sm:px-8 sm:py-10 lg:-mt-16 lg:px-10">
          <h2 className="mb-10 border-l-4 border-action pl-3 text-sm font-black uppercase tracking-widest text-primary">
            Por qué tu reporte importa
          </h2>

          <div className="grid gap-8 md:grid-cols-3 md:divide-x md:divide-gray-100 md:gap-0">
            {CARDS.map(({ Icon, title, description }, i) => (
              <div
                key={title}
                className={`flex flex-col gap-3 ${i === 0 ? 'md:pr-8 lg:pr-10' : i === 2 ? 'md:pl-8 lg:pl-10' : 'md:px-8 lg:px-10'}`}
              >
                <Icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
                <h3 className="font-semibold text-primary">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
