import dunasBg from '../../assets/images/dunas.png'
import imagotipoNegativo from '../../assets/images/imagotipo negativo.svg'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function HeroSection() {
  const { t } = useTranslation()

  return (
    <section className="relative min-h-[620px] overflow-hidden">
      <img
        src={dunasBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/45" />

      <div className="relative mx-auto flex min-h-[620px] max-w-7xl flex-col justify-center gap-8 px-6 py-16 text-white sm:py-20 lg:px-10">
        <img src={imagotipoNegativo} alt="BIOTRACK" className="reveal-up w-[15rem] sm:w-[18rem]" />

        <div className="reveal-up reveal-delay-1 max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
            {t('hero.tagline')}
          </p>
          <h1 className="text-3xl font-black leading-[1.08] sm:text-4xl lg:text-5xl">
            {t('hero.title')}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
            {t('hero.description')}
          </p>
        </div>

        <div className="reveal-up reveal-delay-2 flex flex-wrap gap-3">
          <Link
            to="/reporte/nuevo"
            className="rounded-lg bg-action px-6 py-3 text-sm font-bold text-white transition-[transform,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:bg-red-700"
          >
            {t('hero.reportNow')}
          </Link>
          <Link
            to="/reportes"
            className="rounded-lg border border-white/45 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-[transform,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/20"
          >
            {t('hero.consultReports')}
          </Link>
        </div>

        <div className="reveal-up reveal-delay-3 grid max-w-3xl gap-3 sm:grid-cols-3">
          <p className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs text-white/90 transition-colors duration-200 hover:bg-white/15">{t('hero.quickRegister')}</p>
          <p className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs text-white/90 transition-colors duration-200 hover:bg-white/15">{t('hero.trackById')}</p>
          <p className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs text-white/90 transition-colors duration-200 hover:bg-white/15">{t('hero.dataProtection')}</p>
        </div>
      </div>
    </section>
  )
}
