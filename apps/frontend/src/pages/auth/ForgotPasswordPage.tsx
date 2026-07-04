import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthPageLayout from '../../components/auth/AuthPageLayout'
import { inputCls } from '../../components/auth/inputCls'
import { validateEmail } from '../../utils/validation'
import { forgotPassword } from '../../services/authService'

import recoverBg from '../../assets/images/recover-bg.jpg'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setEmail(e.target.value)
    if (error) setError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const err = validateEmail(email)
    if (err) { setError(err); return }
    setLoading(true)
    const res = await forgotPassword(email.trim().toLowerCase())
    setLoading(false)
    if (!res.success) {
      setError(res.error ?? t('forgot.sendError'))
      return
    }
    navigate('/recuperar-cuenta/verificar', { state: { email: email.trim().toLowerCase() } })
  }

  return (
    <AuthPageLayout imageSrc={recoverBg} mobileTag={t('forgot.mobileTag')}>
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/75">{t('forgot.tag')}</p>
      <h2 className="mb-3 text-[clamp(1.9rem,3.5vw,2.85rem)] leading-[0.98] font-extrabold text-primary">
        {t('forgot.title')}
      </h2>
      <p className="mb-8 max-w-[46ch] text-[14px] leading-6 text-dark/80">
        {t('forgot.subtitle')}
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label htmlFor="recover-email" className="text-[12px] font-semibold uppercase tracking-[0.08em] text-dark/80">
            {t('forgot.emailLabel')}
          </label>
          <input
            id="recover-email"
            type="email"
            placeholder={t('forgot.emailPlaceholder')}
            value={email}
            onChange={handleChange}
            onBlur={() => setError(validateEmail(email))}
            autoComplete="email"
            className={inputCls(error)}
          />
          {error && <p className="text-xs text-action/95">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-md bg-dark py-3 text-[16px] font-bold text-surface transition-[transform,background-color] duration-200 active:scale-[0.985] hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? t('forgot.submitting') : t('forgot.submit')}
        </button>

        <p className="text-center text-[13px] text-dark/85">
          <Link to="/login" className="font-bold text-primary hover:text-primary/80">
            {t('forgot.backToLogin')}
          </Link>
        </p>
      </form>
    </AuthPageLayout>
  )
}
