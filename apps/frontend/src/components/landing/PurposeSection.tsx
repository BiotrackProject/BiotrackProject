import { Contact, Target, Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function PurposeSection() {
  const { t } = useTranslation()

  const CARDS = [
    {
      Icon: Contact,
      title: t('purpose.card1Title'),
      description: t('purpose.card1Desc'),
    },
    {
      Icon: Target,
      title: t('purpose.card2Title'),
      description: t('purpose.card2Desc'),
    },
    {
      Icon: Heart,
      title: t('purpose.card3Title'),
      description: t('purpose.card3Desc'),
    },
  ]

  return (
    <section className="bg-surface pb-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative z-10 -mt-10 rounded-2xl bg-white px-6 py-8 shadow-md sm:-mt-14 sm:px-8 sm:py-10 lg:-mt-16 lg:px-10">
          <h2 className="mb-10 border-l-4 border-action pl-3 text-sm font-black uppercase tracking-widest text-primary">
            {t('purpose.sectionTitle')}
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
