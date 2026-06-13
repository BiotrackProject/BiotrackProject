import isotipoNegativo from '../../assets/images/isotiponegativo.png'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-8 py-8">
        <img
          src={isotipoNegativo}
          alt="Isotipo negativo BIOTRACK"
          className="h-28 w-auto"
        />

        <div className="text-right text-sm leading-relaxed">
          <p className="font-bold">Explora BIOTRACK</p>
          <Link to="/reporte/nuevo" className="block hover:underline">
            Reportar incidente
          </Link>
          <Link to="/reportes" className="block hover:underline">
            Consultar seguimiento
          </Link>
          <p className="mt-3 font-bold leading-tight">
            Soporte ciudadano<br />*462
          </p>
        </div>
      </div>

      <div className="border-t border-white/20 py-3 text-center text-xs">
        ©2026 Todos los Derechos Reservados.
      </div>
    </footer>
  )
}
