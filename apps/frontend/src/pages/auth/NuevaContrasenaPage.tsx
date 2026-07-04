import { useState } from 'react'
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthPageLayout from '../../components/auth/AuthPageLayout'
import PasswordField from '../../components/auth/PasswordField'
import { validateRegisterPassword } from '../../utils/validation'
import { resetPassword } from '../../services/authService'

import recoverBg from '../../assets/images/recover-bg.jpg'

export default function NuevaContrasenaPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const email = location.state?.email ?? ''
  const token = location.state?.token ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({ password: null, confirm: null })
  const [formError, setFormError] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!token) return <Navigate to="/recuperar-cuenta" replace />

  function validate() {
    const passwordErr = validateRegisterPassword(password, '', '', email)
    let confirmErr = null
    if (!confirm) confirmErr = t('nuevaContrasena.confirmRequired')
    else if (confirm !== password) confirmErr = t('nuevaContrasena.confirmMismatch')
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
      setFormError(res.error ?? t('nuevaContrasena.resetError'))
      return
    }
    navigate('/login', {
      replace: true,
      state: { mensaje: t('nuevaContrasena.resetSuccess') },
    })
  }

  return (
    <AuthPageLayout imageSrc={recoverBg} mobileTag={t('nuevaContrasena.mobileTag')}>
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/75">{t('nuevaContrasena.tag')}</p>
      <h2 className="mb-3 text-[clamp(1.9rem,3.5vw,2.85rem)] leading-[0.98] font-extrabold text-primary">
        {t('nuevaContrasena.title')}
      </h2>
      <p className="mb-8 max-w-[46ch] text-[14px] leading-6 text-dark/80">
        {t('nuevaContrasena.subtitle')}
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <PasswordField
          id="new-password"
          label={t('nuevaContrasena.newLabel')}
          placeholder={t('nuevaContrasena.newPlaceholder')}
          value={password}
          error={errors.password}
          autoComplete="new-password"
          onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: null })) }}
          onBlur={() => setErrors((p) => ({ ...p, password: validateRegisterPassword(password, '', '', email) }))}
        />

        <PasswordField
          id="confirm-password"
          label={t('nuevaContrasena.confirmLabel')}
          placeholder={t('nuevaContrasena.confirmPlaceholder')}
          value={confirm}
          error={errors.confirm}
          autoComplete="new-password"
          onChange={(e) => { setConfirm(e.target.value); if (errors.confirm) setErrors((p) => ({ ...p, confirm: null })) }}
        />

        {formError && <p className="text-center text-[13px] text-action/95">{formError}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-md bg-dark py-3 text-[16px] font-bold text-surface transition-[transform,background-color] duration-200 active:scale-[0.985] hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? t('nuevaContrasena.submitting') : t('nuevaContrasena.submit')}
        </button>

        <p className="text-center text-[13px] text-dark/85">
          <Link to="/login" className="font-bold text-primary hover:text-primary/80">
            {t('nuevaContrasena.backToLogin')}
          </Link>
        </p>
      </form>
    </AuthPageLayout>
  )
}
