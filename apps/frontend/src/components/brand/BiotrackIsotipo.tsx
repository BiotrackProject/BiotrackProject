/**
 * Isotipo de BIOTRACK — ícono de hoja en círculo.
 * Reemplazar con el SVG oficial del diseño cuando esté disponible.
 */
export default function BiotrackIsotipo({ size = 120, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="60" cy="60" r="56" stroke="currentColor" strokeWidth="4" />
      {/* Tallo */}
      <line x1="60" y1="88" x2="60" y2="52" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      {/* Hoja izquierda */}
      <path
        d="M60 72 C60 72 36 64 36 44 C36 44 52 38 60 52 L60 72Z"
        fill="currentColor"
      />
      {/* Hoja derecha */}
      <path
        d="M60 64 C60 64 84 56 84 36 C84 36 68 30 60 44 L60 64Z"
        fill="currentColor"
        opacity="0.75"
      />
    </svg>
  )
}
