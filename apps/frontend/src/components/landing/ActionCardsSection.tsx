import ActionCard from '../ui/ActionCard'
import { useTranslation } from 'react-i18next'

export default function ActionCardsSection() {
  const { t } = useTranslation()

  return (
    <section className="bg-surface py-12 sm:py-14">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-6 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary/70">{t('actionCards.sectionTag')}</p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-primary sm:text-3xl">{t('actionCards.sectionTitle')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {t('actionCards.sectionDesc')}
          </p>
        </div>

        <div className="flex overflow-hidden rounded-3xl bg-primary shadow-sm">
          <ActionCard
            variant="panel"
            category={t('actionCards.reportCategory')}
            title={t('actionCards.reportTitle')}
            description={t('actionCards.reportDesc')}
            cta={t('actionCards.reportCta')}
            to="/reporte/nuevo"
          />
          <div className="w-px self-stretch bg-white/20" />
          <ActionCard
            variant="panel"
            category={t('actionCards.consultCategory')}
            title={t('actionCards.consultTitle')}
            description={t('actionCards.consultDesc')}
            cta={t('actionCards.consultCta')}
            to="/reportes"
          />
        </div>
      </div>
    </section>
  )
}
