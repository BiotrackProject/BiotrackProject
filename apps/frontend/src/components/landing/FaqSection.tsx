import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-primary"
      >
        <span className="text-sm font-semibold text-gray-800">{question}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-primary transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
          open ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="pb-5 text-sm leading-relaxed text-gray-600">{answer}</p>
      </div>
    </div>
  )
}

export default function FaqSection() {
  const { t } = useTranslation()
  const items = t('faq.items', { returnObjects: true }) as Array<{ q: string; a: string }>

  return (
    <section className="bg-surface py-14 sm:py-16">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary/70">
            {t('faq.sectionTag')}
          </p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-primary sm:text-3xl">
            {t('faq.sectionTitle')}
          </h2>
        </div>

        <div className="rounded-2xl bg-white px-6 py-2 shadow-sm sm:px-8">
          {Array.isArray(items) && items.map((item, i) => (
            <FaqItem key={i} question={item.q} answer={item.a} />
          ))}
        </div>
      </div>
    </section>
  )
}
