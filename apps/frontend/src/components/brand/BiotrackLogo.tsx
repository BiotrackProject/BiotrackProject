import BiotrackIsotipo from './BiotrackIsotipo'

const SIZE_MAP = {
  sm: { isotipo: 28, text: 'text-xl tracking-widest' },
  md: { isotipo: 36, text: 'text-3xl tracking-widest' },
  lg: { isotipo: 52, text: 'text-5xl tracking-widest' },
  xl: { isotipo: 72, text: 'text-7xl tracking-widest' },
}

/**
 * Imagotipo BIOTRACK — isotipo + texto.
 * variant: 'white' (para fondos oscuros) | 'dark' (para fondos claros)
 */
export default function BiotrackLogo({ variant = 'white', size = 'md' }) {
  const { isotipo, text } = SIZE_MAP[size] ?? SIZE_MAP.md
  const color = variant === 'white' ? 'text-white' : 'text-primary'

  return (
    <div className={`flex items-center gap-3 font-black ${text} ${color}`}>
      <BiotrackIsotipo size={isotipo} />
      <span className="leading-none">BIOTRACK</span>
    </div>
  )
}
