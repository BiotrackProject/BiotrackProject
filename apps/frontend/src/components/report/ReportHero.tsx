import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import surveyImg from '../../assets/images/survey.svg'

/**
 * Hero reutilizable para páginas de reporte/consulta.
 * Props: category (etiqueta pequeña), title (heading principal)
 */
export default function ReportHero({ category = 'Reporte', title }) {
  const navigate = useNavigate()

  return (
    <section className="border-b border-primary/10 bg-gradient-to-b from-blue-50 to-white py-12 sm:py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="max-w-2xl shrink-0">
          <div className="mb-4 flex flex-col items-start gap-2">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 shadow-sm transition-all duration-150 ease-out hover:bg-gray-50 active:scale-[0.98]"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver
            </button>
            <p className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
              {category}
            </p>
          </div>
          <h1 className="text-3xl font-black leading-[1.08] text-primary sm:text-4xl">{title}</h1>
        </div>

        <img src={surveyImg} alt="" className="h-52 w-auto self-center sm:h-64 lg:h-80" />
      </div>
    </section>
  )
}
