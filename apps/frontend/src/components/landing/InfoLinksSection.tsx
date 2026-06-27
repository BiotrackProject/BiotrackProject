import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function InfoLinksSection() {
  const { t } = useTranslation()

  const ITEMS = [
    {
      title: t('infoLinks.beforeTitle'),
      description: t('infoLinks.beforeDesc'),
      button: t('infoLinks.beforeCta'),
      href: '/reporte/nuevo',
    },
    {
      title: t('infoLinks.trackingTitle'),
      description: t('infoLinks.trackingDesc'),
      button: t('infoLinks.trackingCta'),
      href: '/reportes',
    },
  ]

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
