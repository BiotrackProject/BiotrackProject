const STORIES = [
  {
    title: 'Comunidad de Nagua',
    result: 'Reducción visible de extracción nocturna',
    detail:
      'Vecinos reportaron actividad recurrente en zona costera. Con evidencia y seguimiento, se coordinó una intervención que disminuyó operaciones irregulares.',
    metric: '17 reportes verificados',
  },
  {
    title: 'Tramo del Yuna',
    result: 'Punto crítico priorizado en monitoreo',
    detail:
      'Un caso ciudadano con ubicación precisa aceleró la validación técnica y permitió programar operativos en menor tiempo.',
    metric: '3.2 h promedio de respuesta',
  },
  {
    title: 'Red local de vigilancia',
    result: 'Más reportes útiles, menos denuncias incompletas',
    detail:
      'Al incluir guías claras en BIOTRACK, más personas enviaron información accionable para seguimiento institucional.',
    metric: '+41% reportes con evidencia',
  },
]

export default function ImpactStoriesSection() {
  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary/70">Impacto ciudadano</p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-primary sm:text-3xl">
            Cuando una denuncia bien hecha llega, sí mueve decisiones
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            Estos resultados muestran cómo un reporte claro puede convertirse en verificación técnica y acciones de protección.
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
