import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import ImagePanel from '../../components/auth/ImagePanel'
import { validateCode } from '../../utils/validation'

import recoverBg from '../../assets/images/recover-bg.jpg'

const INPUT_CLS = (hasError) =>
  `w-full rounded-md border bg-white/90 px-3.5 py-3 text-[15px] text-dark outline-none placeholder:text-[#8d94a0] transition-[border-color,box-shadow,transform] duration-200 focus:-translate-y-[1px] focus:ring-2 ${
    hasError
      ? 'border-action focus:border-action focus:ring-action/20'
      : 'border-[#c8ced6] focus:border-primary focus:ring-primary/15'
  }`

export default function VerifyCodePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email ?? ''

  const [code, setCode] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resendMsg, setResendMsg] = useState('')

  function handleChange(e) {
    setCode(e.target.value)
    if (error) setError(null)
    if (resendMsg) setResendMsg('')
  }

  function handleBlur() {
    setError(validateCode(code))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const err = validateCode(code)
    if (err) { setError(err); return }
    setLoading(true)
    // TODO: conectar con el backend — POST /api/auth/verify-code
    setTimeout(() => {
      setLoading(false)
      // navigate('/recuperar-cuenta/nueva-contrasena')
      navigate('/login')
    }, 800)
  }

  async function handleResend() {
    // TODO: conectar con el backend — POST /api/auth/forgot-password (reenviar)
    setResendMsg('Código reenviado. Revisa tu correo electrónico.')
    setCode('')
    setError(null)
  }

  return (
    <div className="min-h-screen bg-[#eceff3]">
      <div className="grid min-h-screen md:grid-cols-[0.95fr_1.05fr]">
        <div className="relative h-32 w-full overflow-hidden md:hidden" style={{ backgroundImage: `url(${recoverBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(19,53,108,0.74),rgba(40,40,40,0.64))]" />
          <div className="absolute left-6 top-6 border-l-2 border-secondary/80 pl-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-surface/90">
            Seguridad BIOTRACK
          </div>
        </div>

        <div className="relative flex w-full items-center px-6 py-8 sm:px-10 md:px-12 lg:px-16">
          <div className="pointer-events-none absolute left-5 top-5 h-14 w-14 border-l-2 border-t-2 border-primary/25" />
          <div className="w-full max-w-[460px]">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/75">Verificación de identidad</p>
            <h2 className="mb-3 text-[clamp(1.9rem,3.5vw,2.85rem)] leading-[0.98] font-extrabold text-primary">
              Ingresar Código
            </h2>
            <p className="mb-8 max-w-[46ch] text-[14px] leading-6 text-dark/80">
              Escribe el código enviado{email ? ` a ${email}` : ' a tu correo'} para continuar con la recuperación de tu cuenta.
            </p>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label htmlFor="code" className="text-[12px] font-semibold uppercase tracking-[0.08em] text-dark/80">
                  Código de verificación
                </label>
                <input
                  id="code"
                  placeholder="Ingresar código"
                  value={code}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="one-time-code"
                  className={INPUT_CLS(error)}
                />
                {error && <p className="text-xs text-action/95">{error}</p>}
              </div>

              {resendMsg && <p className="text-center text-[13px] text-primary">{resendMsg}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-md bg-dark py-3 text-[16px] font-bold text-surface transition-[transform,background-color] duration-200 active:scale-[0.985] hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Verificando...' : 'Validar código'}
              </button>

              <p className="text-center text-[13px] text-dark/85">
                ¿No has recibido el código?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  className="font-bold text-primary hover:text-primary/80"
                >
                  Reenviar
                </button>
              </p>

              <p className="text-center text-[13px] text-dark/85">
                <Link to="/login" className="font-bold text-primary hover:text-primary/80">
                  Iniciar sesión
                </Link>
              </p>
            </form>
          </div>
        </div>

        <ImagePanel
          imageSrc={recoverBg}
          className="hidden md:flex"
          overlayClassName="bg-[linear-gradient(145deg,rgba(19,53,108,0.76),rgba(40,40,40,0.64))]"
          logo="isotipo"
          logoClassName="w-[260px]"
        />
      </div>
    </div>
  )
}
