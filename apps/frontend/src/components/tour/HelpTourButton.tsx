/**
 * HelpTourButton — reusable "?" button that triggers a guided tour.
 *
 * Props:
 *  onStart:     () => void   — callback that fires the tour
 *  position:    'fixed-bottom-right' | 'inline'  (default: 'fixed-bottom-right')
 *  label:       string  — tooltip/aria-label (default: 'Ver recorrido de ayuda')
 *  variant:     'primary' | 'white'  — colour scheme (default: 'primary')
 *  className:   string  — extra Tailwind classes
 *
 * Usage:
 *   <HelpTourButton onStart={() => startTour(LANDING_STEPS)} />
 */
export default function HelpTourButton({
  onStart,
  position  = 'fixed-bottom-right',
  label     = 'Ver recorrido de ayuda',
  variant   = 'primary',
  className = '',
  dataTour,
}) {
  const baseStyle = 'flex items-center justify-center rounded-full font-bold select-none shadow-lg transition-[transform,background-color,color,border-color,box-shadow] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'

  const variantStyle = variant === 'white'
    ? 'h-9 w-9 bg-white/20 text-white hover:bg-white/35 focus-visible:ring-white text-sm border border-white/30'
    : 'h-10 w-10 bg-[#13356C] text-white hover:bg-[#0f2a56] focus-visible:ring-[#13356C] text-base'

  const positionStyle = position === 'fixed-bottom-right'
    ? 'fixed bottom-6 right-6 z-[400]'
    : ''

  return (
    <button
      onClick={onStart}
      aria-label={label}
      title={label}
      data-tour={dataTour}
      className={[baseStyle, variantStyle, positionStyle, className].filter(Boolean).join(' ')}
    >
      ?
    </button>
  )
}
