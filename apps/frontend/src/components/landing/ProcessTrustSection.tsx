import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function ProcessTrustSection() {
  const { t } = useTranslation()

  const STEPS = [
    {
      title: t('process.step1Title'),
      copy: t('process.step1Desc'),
    },
    {
      title: t('process.step2Title'),
      copy: t('process.step2Desc'),
    },
    {
      title: t('process.step3Title'),
      copy: t('process.step3Desc'),
    },
    {
      title: t('process.step4Title'),
      copy: t('process.step4Desc'),
    },
  ]

  return (
    <section className="bg-blue-50 py-14 sm:py-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary/70">{t('process.sectionTag')}</p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-primary sm:text-3xl">
            {t('process.sectionTitle')}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">
            {t('process.sectionDesc')}
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
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">{t('process.commitTag')}</p>
          <h3 className="mt-2 text-xl font-black leading-tight">
            {t('process.commitTitle')}
          </h3>

          <ul className="mt-4 space-y-2 text-sm text-white/90">
            <li>{t('process.commitItem1')}</li>
            <li>{t('process.commitItem2')}</li>
            <li>{t('process.commitItem3')}</li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to="/reporte/nuevo"
              className="rounded-lg bg-action px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-700"
            >
              {t('hero.reportNow')}
            </Link>
            <Link
              to="/reportes"
              className="rounded-lg border border-white/40 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15"
            >
              {t('process.consultStatus')}
            </Link>
          </div>
        </aside>
      </div>
    </section>
  )
}
