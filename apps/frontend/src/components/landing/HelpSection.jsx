import { useState } from 'react'
import { ExternalLink, X } from 'lucide-react'
import questionsImg from '../../assets/images/questions.svg'

function ContactModal({ onClose }) {
  const [service, setService] = useState('')
  const [need, setNeed] = useState('')
  const [email, setEmail] = useState('')
  const [anon, setAnon] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: connect to backend — POST /api/feedback
    setSent(true)
  }

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Card */}
      <div className="relative w-full max-w-md animate-[modalIn_0.2s_ease] rounded-2xl bg-surface p-8 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {sent ? (
          <div className="py-8 text-center">
            <p className="text-2xl font-black text-primary">¡Gracias!</p>
            <p className="mt-2 text-sm text-gray-600">
              Recibimos tu solicitud de orientación.{!anon && email && ' Te contactaremos pronto.'}
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-lg bg-action px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <p className="text-lg font-black text-primary">Solicitud de orientación</p>
              <p className="mt-1 text-xs text-gray-500">Cuéntanos tu caso y te ayudamos con el siguiente paso.</p>
            </div>

            {/* Servicio */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-800">
                Tema de tu consulta
              </label>
              <input
                type="text"
                placeholder="Ej. Cómo reportar actividad nocturna"
                value={service}
                onChange={e => setService(e.target.value)}
                required
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Necesidad */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-800">
                ¿En qué te orientamos?
              </label>
              <textarea
                placeholder="Describe brevemente tu duda o situación"
                value={need}
                onChange={e => setNeed(e.target.value)}
                required
                rows={3}
                className="resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-800">
                Correo <span className="font-normal text-gray-400">(opcional)</span>
              </label>
              <input
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={anon}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-40"
              />
            </div>

            {/* Anónimo */}
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={anon}
                onChange={e => {
                  setAnon(e.target.checked)
                  if (e.target.checked) setEmail('')
                }}
                className="h-4 w-4 cursor-pointer accent-primary"
              />
              <span className="text-sm font-bold text-gray-800">Prefiero mantener esta consulta anónima</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-lg bg-action py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
            >
              Enviar solicitud
              <ExternalLink className="h-4 w-4" />
            </button>

            <p className="text-center text-xs text-gray-400">
              Si dejas correo, te contactamos. No compartimos tu información.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default function HelpSection() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-12 text-center text-2xl font-bold text-primary">
            ¿Tienes dudas antes de reportar?
          </h2>

          <div className="flex flex-col items-center justify-center gap-10 lg:flex-row lg:gap-16">
            <img
              src={questionsImg}
              alt="Persona con interrogante"
              className="h-56 w-auto sm:h-72 lg:h-80"
            />

            <div className="max-w-xs text-center lg:text-left">
              <p className="mb-6 text-sm leading-relaxed text-gray-700">
                Te orientamos sobre cómo reportar mejor, qué evidencia ayuda más y
                cómo consultar el avance de un caso sin perder tiempo.
              </p>
              <p className="mb-4 text-xs text-gray-500">
                Respuesta de acompañamiento en horario laboral.
              </p>
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded bg-action px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Solicitar orientación
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {open && <ContactModal onClose={() => setOpen(false)} />}
    </>
  )
}
