import { useState } from 'react'
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import ImagePanel from '../../components/auth/ImagePanel'
import { validateRegisterPassword } from '../../utils/validation'
import { resetPassword } from '../../services/authService'

import recoverBg from '../../assets/images/recover-bg.jpg'

const INPUT_CLS = (hasError) =>
  `w-full rounded-md border bg-white/90 px-3.5 py-3 text-[15px] text-dark outline-none placeholder:text-[#8d94a0] transition-[border-color,box-shadow,transform] duration-200 focus:-translate-y-[1px] focus:ring-2 ${
    hasError
      ? 'border-action focus:border-action focus:ring-action/20'
      : 'border-[#c8ced6] focus:border-primary focus:ring-primary/15'
  }`

export default function NuevaContrasenaPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email ?? ''
  const token = location.state?.token ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({ password: null, confirm: null })
  const [formError, setFormError] = useState(null)
  const [loading, setLoading] = useState(false)

  // Sin token no se puede continuar: volver al inicio del flujo.
  if (!token) return <Navigate to="/recuperar-cuenta" replace />

  function validate() {
    const passwordErr = validateRegisterPassword(password, '', '', email)
    const confirmErr = !confirm
      ? 'Confirma tu contraseña'
      : confirm !== password
        ? 'Las contraseñas no coinciden'
        : null
    setErrors({ password: passwordErr, confirm: confirmErr })
    return !passwordErr && !confirmErr
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)
    if (!validate()) return
    setLoading(true)
    const res = await resetPassword(token, password)
    setLoading(false)
    if (!res.success) {
      setFormError(res.error ?? 'No se pudo restablecer la contraseña. Solicita un nuevo código.')
      return
    }
    navigate('/login', {
      replace: true,
      state: { mensaje: 'Tu contraseña ha sido restablecida. Ya puedes iniciar sesión.' },
    })
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
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/75">Recuperación de acceso</p>
            <h2 className="mb-3 text-[clamp(1.9rem,3.5vw,2.85rem)] leading-[0.98] font-extrabold text-primary">
              Nueva Contraseña
            </h2>
            <p className="mb-8 max-w-[46ch] text-[14px] leading-6 text-dark/80">
              Crea una nueva contraseña segura para tu cuenta. Debe tener al menos 10 caracteres,
              mayúsculas, minúsculas, un número y un carácter especial.
            </p>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label htmlFor="new-password" className="text-[12px] font-semibold uppercase tracking-[0.08em] text-dark/80">
                  Nueva contraseña
                </label>
                <input
                  id="new-password"
                  type="password"
                  placeholder="Ingresar nueva contraseña"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: null })) }}
                  onBlur={() => setErrors((p) => ({ ...p, password: validateRegisterPassword(password, '', '', email) }))}
                  autoComplete="new-password"
                  className={INPUT_CLS(errors.password)}
                />
                {errors.password && <p className="text-xs text-action/95">{errors.password}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="confirm-password" className="text-[12px] font-semibold uppercase tracking-[0.08em] text-dark/80">
                  Confirmar contraseña
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  placeholder="Repetir nueva contraseña"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); if (errors.confirm) setErrors((p) => ({ ...p, confirm: null })) }}
                  autoComplete="new-password"
                  className={INPUT_CLS(errors.confirm)}
                />
                {errors.confirm && <p className="text-xs text-action/95">{errors.confirm}</p>}
              </div>

              {formError && <p className="text-center text-[13px] text-action/95">{formError}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-md bg-dark py-3 text-[16px] font-bold text-surface transition-[transform,background-color] duration-200 active:scale-[0.985] hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Restablecer contraseña'}
              </button>

              <p className="text-center text-[13px] text-dark/85">
                <Link to="/login" className="font-bold text-primary hover:text-primary/80">
                  Volver a inicio de sesión
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
