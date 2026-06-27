import { Link } from 'react-router-dom'
import imagotipoNegativo from '../../assets/images/imagotipo negativo.svg'
import isotipoNegativo from '../../assets/images/isotiponegativo.png'

export default function ImagePanel({
  imageSrc,
  className = '',
  overlayClassName = 'bg-[linear-gradient(145deg,rgba(19,53,108,0.76),rgba(40,40,40,0.64))]',
  logo = 'imagotipo',
  logoClassName = 'w-72',
}) {
  const logoSrc = logo === 'isotipo' ? isotipoNegativo : imagotipoNegativo

  return (
    <div
      className={`relative flex items-center justify-center bg-primary overflow-hidden ${className}`}
      style={imageSrc ? { backgroundImage: `url(${imageSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      <div className={`absolute inset-0 ${overlayClassName}`} />
      <div className="pointer-events-none absolute left-10 top-10 h-16 w-16 border-l-2 border-t-2 border-secondary/75" />
      <div className="pointer-events-none absolute bottom-10 right-10 h-16 w-16 border-b-2 border-r-2 border-secondary/60" />
      <Link to="/" className="relative z-10">
        <img src={logoSrc} alt="BIOTRACK — ir al inicio" className={logoClassName} />
      </Link>
    </div>
  )
}
