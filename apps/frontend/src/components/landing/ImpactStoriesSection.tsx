import { useTranslation } from 'react-i18next'

export default function ImpactStoriesSection() {
  const { t } = useTranslation()

  const STORIES = [
    {
      title: t('impact.story1Title'),
      result: t('impact.story1Result'),
      detail: t('impact.story1Detail'),
      metric: t('impact.story1Metric'),
    },
    {
      title: t('impact.story2Title'),
      result: t('impact.story2Result'),
      detail: t('impact.story2Detail'),
      metric: t('impact.story2Metric'),
    },
    {
      title: t('impact.story3Title'),
      result: t('impact.story3Result'),
      detail: t('impact.story3Detail'),
      metric: t('impact.story3Metric'),
    },
  ]

  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary/70">{t('impact.sectionTag')}</p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-primary sm:text-3xl">
            {t('impact.sectionTitle')}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            {t('impact.sectionDesc')}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {STORIES.map((story) => (
            <article key={story.title} className="rounded-2xl border border-gray-100 bg-surface p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-primary/70">{story.title}</p>
              <h3 className="mt-2 text-base font-black text-primary">{story.result}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{story.detail}</p>
              <p className="mt-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {story.metric}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
