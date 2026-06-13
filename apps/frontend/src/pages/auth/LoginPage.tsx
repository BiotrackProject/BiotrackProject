import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ImagePanel from '../../components/auth/ImagePanel'
import { validateEmail, validateLoginPassword } from '../../utils/validation'
import { useAuth } from '../../context/AuthContext'
import * as authService from '../../services/authService'

import loginBg from '../../assets/images/login-bg.jpg'

const INPUT_CLS = (hasError) =>
  `w-full rounded-md border bg-white/90 px-3.5 py-3 text-[15px] text-dark outline-none placeholder:text-[#8d94a0] transition-[border-color,box-shadow,transform] duration-200 focus:-translate-y-[1px] focus:ring-2 ${
    hasError
      ? 'border-action focus:border-action focus:ring-action/20'
      : 'border-[#c8ced6] focus:border-primary focus:ring-primary/15'
  }`

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleChange(field) {
    return (e) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }))
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  function validate() {
    const emailErr = validateEmail(form.email)
    const passwordErr = validateLoginPassword(form.password)
    const next = { email: emailErr, password: passwordErr }
    setErrors(next)
    return !emailErr && !passwordErr
  }

  function handleBlur(field) {
    return () => {
      const validators = { email: validateEmail, password: validateLoginPassword }
      const err = validators[field]?.(form[field])
      setErrors(prev => ({ ...prev, [field]: err }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setApiError(null)
    try {
      const res = await authService.login(form.email, form.password)
      if (res.success && res.data) {
        setAuth(res.data.token, res.data.usuario)
        navigate('/admin/dashboard')
      } else {
        setApiError(res.error ?? 'Error al iniciar sesión')
      }
    } catch {
      setApiError('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#eceff3]">
      <div className="grid min-h-screen md:grid-cols-[0.95fr_1.05fr]">
        <div className="relative h-32 w-full overflow-hidden md:hidden" style={{ backgroundImage: `url(${loginBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(19,53,108,0.74),rgba(40,40,40,0.64))]" />
          <div className="absolute left-6 top-6 border-l-2 border-secondary/80 pl-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-surface/90">
            Acceso BIOTRACK
          </div>
        </div>

        <div className="relative flex w-full items-center px-6 py-8 sm:px-10 md:px-12 lg:px-16">
          <div className="pointer-events-none absolute left-5 top-5 h-14 w-14 border-l-2 border-t-2 border-primary/25" />
          <div className="w-full max-w-[460px]">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/75">Plataforma de monitoreo</p>
            <h2 className="mb-3 text-[clamp(2rem,4.2vw,3.25rem)] leading-[0.95] font-extrabold text-primary">
              Inicio de Sesión
            </h2>
            <p className="mb-8 max-w-[46ch] text-[14px] leading-6 text-dark/80">
              Ingresa con tu correo y contraseña para acceder al seguimiento de denuncias, acciones y monitoreos.
            </p>

            {apiError && (
              <div className="rounded-md border border-action/30 bg-action/5 px-4 py-3 text-sm text-action/90">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-[12px] font-semibold uppercase tracking-[0.08em] text-dark/80">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Ingresar correo electrónico"
                  value={form.email}
                  onChange={handleChange('email')}
                  onBlur={handleBlur('email')}
                  autoComplete="email"
                  className={INPUT_CLS(errors.email)}
                />
                {errors.email && <p className="text-xs text-action/95">{errors.email}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-[12px] font-semibold uppercase tracking-[0.08em] text-dark/80">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Ingresar contraseña"
                  value={form.password}
                  onChange={handleChange('password')}
                  onBlur={handleBlur('password')}
                  autoComplete="current-password"
                  className={INPUT_CLS(errors.password)}
                />
                {errors.password && <p className="text-xs text-action/95">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between gap-2 text-[13px]">
                <label htmlFor="remember" className="flex cursor-pointer items-center gap-2 text-dark/90 select-none">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={form.remember}
                    onChange={e => setForm(prev => ({ ...prev, remember: e.target.checked }))}
                    className="h-3.5 w-3.5 accent-primary"
                  />
                  Mantener sesión iniciada
                </label>
                <Link
                  to="/recuperar-cuenta"
                  className="font-semibold text-primary hover:text-primary/80 whitespace-nowrap"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-md bg-dark py-3 text-[16px] font-bold text-surface transition-[transform,background-color] duration-200 active:scale-[0.985] hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>

              <p className="text-center text-[13px] text-dark/85">
                ¿No tienes cuenta?{' '}
                <Link to="/registro" className="font-bold text-primary hover:text-primary/80">
                  Solicitar registro
                </Link>
              </p>
            </form>
          </div>
        </div>

        <ImagePanel
          imageSrc={loginBg}
          className="hidden md:flex"
          overlayClassName="bg-[linear-gradient(145deg,rgba(19,53,108,0.76),rgba(40,40,40,0.64))]"
          logoClassName="w-[540px]"
        />
      </div>
    </div>
  )
}
