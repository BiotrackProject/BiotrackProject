import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// TODO: Replace with API/CMS call when backend is ready.
const NEWS = [
  {
    id: 1,
    title: 'Ministerio de Medio Ambiente realiza operativo contra extracción ilegal de arena en el río Yaque del Norte',
    summary: 'Autoridades reforzaron control en puntos de alta incidencia y levantaron evidencias para seguimiento.',
    source: 'Listín Diario',
    date: '14 ene 2025',
    url: 'https://listindiario.com/la-republica/medio-ambiente',
    image: 'https://listindiario.com/i/2025/01/operativo-arena.jpg',
    fallback: 'https://images.unsplash.com/photo-1489875347897-49f64b51c1f8?w=600&fit=crop&q=80',
  },
  {
    id: 2,
    title: 'EGEHID y Medio Ambiente unen esfuerzos para proteger cuencas hidrográficas de la minería ilegal',
    summary: 'La coordinación interinstitucional prioriza zonas vulnerables para inspección y vigilancia continua.',
    source: 'Diario Libre',
    date: '22 feb 2025',
    url: 'https://diariolibre.com/actualidad/medioambiente',
    image: 'https://diariolibre.com/assets/2025/02/cuencas-proteccion.jpg',
    fallback: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&fit=crop&q=80',
  },
  {
    id: 3,
    title: 'Operativo preventivo: Autoridades retienen 17 equipos de maquinaria en puntos críticos del Cibao',
    summary: 'Las acciones preventivas buscan frenar actividad irregular y mitigar daño ambiental acumulado.',
    source: 'El Caribe',
    date: '8 mar 2025',
    url: 'https://elcaribe.com.do/pais',
    image: 'https://elcaribe.com.do/wp-content/uploads/2025/03/maquinaria.jpg',
    fallback: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&fit=crop&q=80',
  },
  {
    id: 4,
    title: 'Más de 30 puntos bajo vigilancia constante por extracción ilegal de arena en ríos nacionales',
    summary: 'Se amplía cobertura de monitoreo con seguimiento técnico en áreas de mayor impacto.',
    source: 'CDN Digital',
    date: '19 mar 2025',
    url: 'https://cdn.com.do/nacionales',
    image: 'https://cdn.com.do/wp-content/uploads/2025/03/rios-vigilancia.jpg',
    fallback: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&fit=crop&q=80',
  },
  {
    id: 5,
    title: 'Alertan sobre degradación acelerada de ríos del Cibao por minería ilegal de arena',
    summary: 'Especialistas advierten sobre efectos en cauces y ecosistemas si no se refuerzan acciones de control.',
    source: 'Noticias SIN',
    date: '2 abr 2025',
    url: 'https://noticiassin.com/nacionales',
    image: 'https://noticiassin.com/wp-content/uploads/2025/04/degradacion-rios.jpg',
    fallback: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&fit=crop&q=80',
  },
  {
    id: 6,
    title: 'Sector ambiental exige mayor control institucional sobre extracción de áridos en costas y ríos dominicanos',
    summary: 'Organizaciones piden fortalecer fiscalización y respuesta temprana basada en reportes ciudadanos.',
    source: 'La Información',
    date: '18 abr 2025',
    url: 'https://lainformacion.com.do/pais',
    image: 'https://lainformacion.com.do/wp-content/uploads/2025/04/aridos.jpg',
    fallback: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&fit=crop&q=80',
  },
]

function NewsCard({ item, readLabel }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
    >
      <img
        src={item.image}
        alt={item.title}
        onError={e => { e.currentTarget.src = item.fallback }}
        className="h-44 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      />
      <div className="flex flex-1 flex-col p-4">
        <p className="mb-2 inline-flex w-fit rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary/80">
          {item.source}
        </p>
        <h3 className="text-sm font-black leading-snug text-gray-800">{item.title}</h3>
        <p className="mt-2 flex-1 text-xs leading-relaxed text-gray-600">{item.summary}</p>

        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="font-medium text-gray-500">{item.date}</span>
          <span className="inline-flex items-center gap-1 font-bold text-action">
            {readLabel}
            <ExternalLink className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </a>
  )
}

export default function NewsCarousel() {
  const { t } = useTranslation()
  const [cardsPerView, setCardsPerView] = useState(() => {
    if (typeof window === 'undefined') return 3
    if (window.innerWidth < 768) return 1
    if (window.innerWidth < 1024) return 2
    return 3
  })
  const [pos, setPos] = useState(cardsPerView)
  const [paused, setPaused] = useState(false)
  const trackRef = useRef(null)

  const clones = cardsPerView
  const extended = useMemo(
    () => [...NEWS.slice(-clones), ...NEWS, ...NEWS.slice(0, clones)],
    [clones],
  )
  const total = extended.length
  const cardPct = 100 / total

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setCardsPerView(1)
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2)
      } else {
        setCardsPerView(3)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setTrackTransition(false)
    setPos(clones)
    requestAnimationFrame(() => requestAnimationFrame(() => setTrackTransition(true)))
  }, [clones])

  const setTrackTransition = (on) => {
    if (trackRef.current) {
      trackRef.current.style.transition = on ? 'transform 320ms cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
    }
  }

  const advance = useCallback((dir) => {
    setTrackTransition(true)
    setPos(p => p + dir)
  }, [])

  // After sliding into a clone region, silently jump to the real equivalent
  const handleTransitionEnd = useCallback((e) => {
    if (e.propertyName !== 'transform') return
    setPos(p => {
      const tooFar = p >= clones + NEWS.length
      const tooBack = p < clones
      if (tooFar || tooBack) {
        setTrackTransition(false)
        const next = tooFar ? p - NEWS.length : p + NEWS.length
        requestAnimationFrame(() => requestAnimationFrame(() => setTrackTransition(true)))
        return next
      }
      return p
    })
  }, [clones])

  // Auto-advance
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => advance(1), 5000)
    return () => clearInterval(t)
  }, [paused, advance])

  const realIndex = ((pos - clones) % NEWS.length + NEWS.length) % NEWS.length

  return (
    <section className="bg-gradient-to-b from-blue-50 to-white py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary/70">{t('news.sectionTag')}</p>
            <h2 className="mt-1 text-3xl font-black uppercase tracking-wide text-primary">{t('news.sectionTitle')}</h2>
            <p className="mt-2 text-sm text-gray-600">{t('news.sectionDesc')}</p>
          </div>
          <div className="text-xs font-medium text-gray-500">
            <p className="inline-flex items-center gap-2">
              <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-action" />
              {t('news.liveUpdate')}
            </p>
            <p className="mt-1">{t('news.swipeHint')}</p>
          </div>
        </div>

        <div
          className="relative px-10 sm:px-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Left arrow */}
          <button
            onClick={() => advance(-1)}
            aria-label={t('news.prevLabel')}
            className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-blue-100 bg-white shadow-sm text-primary transition-colors hover:bg-primary hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Track */}
          <div className="overflow-hidden">
            <div
              ref={trackRef}
              className="flex"
              style={{
                width: `${(total / cardsPerView) * 100}%`,
                transform: `translateX(-${pos * cardPct}%)`,
                transition: 'transform 320ms cubic-bezier(0.23, 1, 0.32, 1)',
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {extended.map((item, i) => (
                <div
                  key={`${item.id}-${i}`}
                  style={{ width: `${cardPct}%`, flexShrink: 0, padding: '0 8px' }}
                >
                  <NewsCard item={item} readLabel={t('news.readArticle')} />
                </div>
              ))}
            </div>
          </div>

          {/* Right arrow */}
          <button
            onClick={() => advance(1)}
            aria-label={t('news.nextLabel')}
            className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-blue-100 bg-white shadow-sm text-primary transition-colors hover:bg-primary hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="mt-8 flex justify-center gap-2">
          {NEWS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setTrackTransition(true); setPos(i + clones) }}
              aria-label={t('news.goToLabel', { n: i + 1 })}
              aria-current={i === realIndex ? 'true' : 'false'}
              className={`h-2 rounded-full transition-[width,background-color] duration-220 ease-out ${
                i === realIndex ? 'w-6 bg-primary' : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
