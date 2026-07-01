import { useRef, useState, useEffect } from 'react'
import { useCountUp } from '../../hooks/useCountUp'
import { useTranslation } from 'react-i18next'
import isotipoGris from '../../assets/images/isotipogris.png'

function StatValue({ target, decimals, suffix, started }) {
  const value = useCountUp(target, started, { decimals })
  return (
    <span>
      {value}
      {suffix}
    </span>
  )
}

export default function StatsSection() {
  const { t } = useTranslation()
  const [started, setStarted] = useState(false)
  const sectionRef = useRef(null)

  // TODO: Replace hardcoded data with API call when backend is ready.
  // import { getStats } from '../../services/statsService'
  // useEffect(() => { getStats().then(setStats) }, [])
  const STATS = {
    highlight: {
      value: 56,
      decimals: 0,
      label: t('stats.highlightLabel'),
    },
    metrics: [
      { value: 573, decimals: 0, suffix: '', label: t('stats.metric1Label') },
      { value: 3.4, decimals: 1, suffix: 'h', label: t('stats.metric2Label') },
      { value: 128, decimals: 0, suffix: '', label: t('stats.metric3Label') },
    ],
  }

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true) },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-white py-16 sm:py-20">
      {/* Watermark */}
      <div className="pointer-events-none absolute -bottom-16 -right-12 opacity-[0.1] sm:-bottom-20 sm:-right-10">
        <img src={isotipoGris} alt="" className="w-60 sm:w-72 lg:w-80" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary/70">{t('stats.sectionTag')}</p>

        <p className="mt-3 text-6xl font-black leading-none text-primary sm:text-7xl lg:text-8xl">
          <StatValue
            target={STATS.highlight.value}
            decimals={STATS.highlight.decimals}
            suffix=""
            started={started}
          />
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-gray-700">{STATS.highlight.label}</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5 lg:mt-12 lg:gap-6">
          {STATS.metrics.map((m) => (
            <div key={m.label} className="rounded-2xl border border-gray-100 bg-surface px-4 py-5 shadow-sm sm:px-5">
              <p className="text-4xl font-black text-primary sm:text-5xl">
                <StatValue
                  target={m.value}
                  decimals={m.decimals}
                  suffix={m.suffix}
                  started={started}
                />
              </p>
              <p className="mt-2 text-sm font-medium text-gray-600">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
