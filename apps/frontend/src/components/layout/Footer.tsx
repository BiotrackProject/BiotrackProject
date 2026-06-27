import isotipoNegativo from '../../assets/images/isotiponegativo.png'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="bg-primary text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-8 py-8">
        <img
          src={isotipoNegativo}
          alt="Isotipo negativo BIOTRACK"
          className="h-28 w-auto"
        />

        <div className="text-right text-sm leading-relaxed">
          <p className="font-bold">{t('footer.explore')}</p>
          <Link to="/reporte/nuevo" className="block hover:underline">
            {t('footer.reportIncident')}
          </Link>
          <Link to="/reportes" className="block hover:underline">
            {t('footer.consultTracking')}
          </Link>
          <p className="mt-3 font-bold leading-tight">
            {t('footer.citizenSupport')}<br />*462
          </p>
        </div>
      </div>

      <div className="border-t border-white/20 py-3 text-center text-xs">
        {t('footer.rights')}
      </div>
    </footer>
  )
}
