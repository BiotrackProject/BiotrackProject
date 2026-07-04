import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthPageLayout from '../../components/auth/AuthPageLayout'
import { inputCls } from '../../components/auth/inputCls'
import { validateCode } from '../../utils/validation'
import { verifyCode, forgotPassword } from '../../services/authService'

import recoverBg from '../../assets/images/recover-bg.jpg'

export default function VerifyCodePage() {
  const { t } = useTranslation()
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

  async function handleSubmit(e) {
    e.preventDefault()
    const err = validateCode(code)
    if (err) { setError(err); return }
    setLoading(true)
    const res = await verifyCode(email, code.trim())
    setLoading(false)
    if (!res.success || !res.data?.token) {
      setError(res.error ?? t('verify.invalidCode'))
      return
    }
    navigate('/recuperar-cuenta/nueva-contrasena', {
      state: { email, token: res.data.token },
    })
  }

  async function handleResend() {
    setResendMsg('')
    setError(null)
    const res = await forgotPassword(email)
    if (!res.success) {
      setError(res.error ?? t('verify.resendError'))
      return
    }
    setResendMsg(t('verify.resendMsg'))
    setCode('')
  }

  return (
    <AuthPageLayout imageSrc={recoverBg} mobileTag={t('verify.mobileTag')}>
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/75">{t('verify.tag')}</p>
      <h2 className="mb-3 text-[clamp(1.9rem,3.5vw,2.85rem)] leading-[0.98] font-extrabold text-primary">
        {t('verify.title')}
      </h2>
      <p className="mb-8 max-w-[46ch] text-[14px] leading-6 text-dark/80">
        {email ? t('verify.subtitleWithEmail', { email }) : t('verify.subtitle')}
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label htmlFor="code" className="text-[12px] font-semibold uppercase tracking-[0.08em] text-dark/80">
            {t('verify.codeLabel')}
          </label>
          <input
            id="code"
            placeholder={t('verify.codePlaceholder')}
            value={code}
            onChange={handleChange}
            onBlur={() => setError(validateCode(code))}
            autoComplete="one-time-code"
            className={inputCls(error)}
          />
          {error && <p className="text-xs text-action/95">{error}</p>}
        </div>

        {resendMsg && <p className="text-center text-[13px] text-primary">{resendMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-md bg-dark py-3 text-[16px] font-bold text-surface transition-[transform,background-color] duration-200 active:scale-[0.985] hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? t('verify.submitting') : t('verify.submit')}
        </button>

        <p className="text-center text-[13px] text-dark/85">
          {t('verify.noCode')}{' '}
          <button
            type="button"
            onClick={handleResend}
            className="font-bold text-primary hover:text-primary/80"
          >
            {t('verify.resend')}
          </button>
        </p>

        <p className="text-center text-[13px] text-dark/85">
          <Link to="/login" className="font-bold text-primary hover:text-primary/80">
            {t('verify.loginLink')}
          </Link>
        </p>
      </form>
    </AuthPageLayout>
  )
}
