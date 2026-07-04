import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ImagePanel from '../../components/auth/ImagePanel'
import { validateRegisterPassword } from '../../utils/validation'
import { useAuth } from '../../context/AuthContext'
import { cambiarContrasena } from '../../services/authService'

import recoverBg from '../../assets/images/recover-bg.jpg'

const INPUT_CLS = (hasError) =>
  `w-full rounded-md border bg-white/90 px-3.5 py-3 text-[15px] text-dark outline-none placeholder:text-[#8d94a0] transition-[border-color,box-shadow,transform] duration-200 focus:-translate-y-[1px] focus:ring-2 ${
    hasError
      ? 'border-action focus:border-action focus:ring-action/20'
      : 'border-[#c8ced6] focus:border-primary focus:ring-primary/15'
  }`

export default function CambiarContrasenaPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, updateUser } = useAuth()
  const obligatorio = !!user?.debe_cambiar_contrasena

  const [actual, setActual] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({ actual: null, password: null, confirm: null })
  const [formError, setFormError] = useState(null)
  const [loading, setLoading] = useState(false)

  function validate() {
    const actualErr = actual ? null : t('cambiarContrasena.currentRequired')
    const passwordErr = validateRegisterPassword(password, '', '', '')
      || (password === actual ? t('cambiarContrasena.newDistinct') : null)
    let confirmErr = null
    if (!confirm) confirmErr = t('cambiarContrasena.confirmRequired')
    else if (confirm !== password) confirmErr = t('cambiarContrasena.confirmMismatch')
    setErrors({ actual: actualErr, password: passwordErr, confirm: confirmErr })
    return !actualErr && !passwordErr && !confirmErr
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)
    if (!validate()) return
    setLoading(true)
    const res = await cambiarContrasena(actual, password)
    setLoading(false)
    if (!res.success) {
      setFormError(res.error ?? t('cambiarContrasena.changeError'))
      return
    }
    updateUser({ debe_cambiar_contrasena: false })
    navigate('/admin/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#eceff3]">
      <div className="grid min-h-screen md:grid-cols-[0.95fr_1.05fr]">
        <div className="relative h-32 w-full overflow-hidden md:hidden" style={{ backgroundImage: `url(${recoverBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(19,53,108,0.74),rgba(40,40,40,0.64))]" />
          <div className="absolute left-6 top-6 border-l-2 border-secondary/80 pl-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-surface/90">
            {t('cambiarContrasena.mobileTag')}
          </div>
        </div>

        <div className="relative flex w-full items-center px-6 py-8 sm:px-10 md:px-12 lg:px-16">
          <div className="pointer-events-none absolute left-5 top-5 h-14 w-14 border-l-2 border-t-2 border-primary/25" />
          <div className="w-full max-w-[460px]">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/75">{t('cambiarContrasena.tag')}</p>
            <h2 className="mb-3 text-[clamp(1.9rem,3.5vw,2.85rem)] leading-[0.98] font-extrabold text-primary">
              {t('cambiarContrasena.title')}
            </h2>
            <p className="mb-8 max-w-[46ch] text-[14px] leading-6 text-dark/80">
              {obligatorio ? t('cambiarContrasena.subtitleMandatory') : t('cambiarContrasena.subtitle')}
            </p>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label htmlFor="current-password" className="text-[12px] font-semibold uppercase tracking-[0.08em] text-dark/80">
                  {t('cambiarContrasena.currentLabel')}
                </label>
                <input
                  id="current-password"
                  type="password"
                  placeholder={t('cambiarContrasena.currentPlaceholder')}
                  value={actual}
                  onChange={(e) => { setActual(e.target.value); if (errors.actual) setErrors((p) => ({ ...p, actual: null })) }}
                  autoComplete="current-password"
                  className={INPUT_CLS(errors.actual)}
                />
                {errors.actual && <p className="text-xs text-action/95">{errors.actual}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="new-password" className="text-[12px] font-semibold uppercase tracking-[0.08em] text-dark/80">
                  {t('cambiarContrasena.newLabel')}
                </label>
                <input
                  id="new-password"
                  type="password"
                  placeholder={t('cambiarContrasena.newPlaceholder')}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: null })) }}
                  onBlur={() => setErrors((p) => ({ ...p, password: validateRegisterPassword(password, '', '', '') }))}
                  autoComplete="new-password"
                  className={INPUT_CLS(errors.password)}
                />
                {errors.password && <p className="text-xs text-action/95">{errors.password}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="confirm-password" className="text-[12px] font-semibold uppercase tracking-[0.08em] text-dark/80">
                  {t('cambiarContrasena.confirmLabel')}
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  placeholder={t('cambiarContrasena.confirmPlaceholder')}
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
                {loading ? t('cambiarContrasena.submitting') : t('cambiarContrasena.submit')}
              </button>
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
