import { Link } from 'react-router-dom'

/**
 * Tarjeta de acción reutilizable para accesos directos principales.
 *
 * variant="card"  (default) — tarjeta independiente con fondo propio, para usar en cualquier contexto.
 * variant="panel" — solo el contenido, sin fondo ni bordes, para usar dentro de un contenedor unificado.
 */
export default function ActionCard({ category, title, description, cta = 'Entrar', to, variant = 'card' }) {
  const inner = (
    <>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/60">
        {category}
      </p>
      <div className="mb-6 h-px w-24 bg-white/30" />
      <h3 className="text-xl font-black uppercase leading-snug text-white">{title}</h3>
      {description && (
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/80">{description}</p>
      )}
      <p className="mt-5 text-sm font-bold text-white">{cta}</p>
    </>
  )

  if (variant === 'panel') {
    return (
      <Link to={to} className="flex-1 px-8 py-12 transition-colors hover:bg-white/5">
        {inner}
      </Link>
    )
  }

  return (
    <Link
      to={to}
      className="relative overflow-hidden rounded-2xl bg-primary p-8 transition-opacity hover:opacity-90"
    >
      {inner}
    </Link>
  )
}
