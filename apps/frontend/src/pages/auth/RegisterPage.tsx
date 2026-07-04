import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ImagePanel from '../../components/auth/ImagePanel'
import { inputCls } from '../../components/auth/inputCls'
import { validateName, validateEmail } from '../../utils/validation'
import * as authService from '../../services/authService'

import registerBg from '../../assets/images/register-bg.jpg'

export default function RegisterPage() {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    cargo: '',
    institucion: '',
  })
  const [errors, setErrors]     = useState<Record<string, string | null>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]   = useState(false)

  function handleChange(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }))
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  function validateField(field: string, value: string) {
    switch (field) {
      case 'nombres':   return validateName(value, 'Nombres')
      case 'apellidos': return validateName(value, 'Apellidos')
      case 'email':     return validateEmail(value)
      default:          return null
    }
  }

  function handleBlur(field: string) {
    return () => setErrors(prev => ({ ...prev, [field]: validateField(field, form[field]) }))
  }

  function validate() {
    const next = {
      nombres:   validateName(form.nombres, 'Nombres'),
      apellidos: validateName(form.apellidos, 'Apellidos'),
      email:     validateEmail(form.email),
    }
    setErrors(next)
    return Object.values(next).every(v => !v)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setApiError(null)
    try {
      const res = await authService.registro({
        nombre_completo: `${form.nombres.trim()} ${form.apellidos.trim()}`,
        correo_electronico: form.email,
        cargo: form.cargo || undefined,
        institucion: form.institucion || undefined,
      })
      if (res.success) {
        setSubmitted(true)
      } else {
        setApiError(res.error ?? t('register.submitError'))
      }
    } catch {
      setApiError(t('register.connectionError'))
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#eceff3]">
        <div className="grid min-h-screen md:grid-cols-[1.05fr_0.95fr]">
          <ImagePanel
            imageSrc={registerBg}
            className="hidden md:flex"
            overlayClassName="bg-[linear-gradient(145deg,rgba(19,53,108,0.76),rgba(40,40,40,0.64))]"
            logoClassName="w-[450px]"
          />
          <div className="relative flex items-center px-6 py-10 sm:px-10 md:px-12 lg:px-16">
            <div className="pointer-events-none absolute right-5 top-5 h-14 w-14 border-r-2 border-t-2 border-primary/25" />
            <div className="w-full max-w-[460px] flex flex-col gap-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/75">{t('register.successTag')}</p>
              <h2 className="text-[clamp(1.75rem,3.1vw,2.55rem)] leading-[1] font-extrabold text-primary">
                {t('register.successTitle')}
              </h2>
              <p className="text-[14px] leading-6 text-dark/90 max-w-[44ch]">
                {t('register.successMsg')}
              </p>
              <Link
                to="/login"
                className="inline-flex w-fit items-center gap-2 text-[15px] font-semibold text-primary transition-transform duration-200 hover:translate-x-1"
              >
                {t('register.goToLogin')}
              </Link>
              <p className="text-xs leading-6 text-dark/70">
                {t('register.checkSpam')}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#eceff3]">
      <div className="grid min-h-screen md:grid-cols-[1.05fr_0.95fr]">
        <ImagePanel
          imageSrc={registerBg}
          className="hidden md:flex"
          overlayClassName="bg-[linear-gradient(145deg,rgba(19,53,108,0.76),rgba(40,40,40,0.64))]"
          logoClassName="w-[450px]"
        />

        <div className="relative flex items-center px-6 py-10 sm:px-10 md:px-12 lg:px-16">
          <div className="pointer-events-none absolute right-5 top-5 h-14 w-14 border-r-2 border-t-2 border-primary/25" />
          <div className="w-full max-w-[460px]">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/75">
              {t('register.tag')}
            </p>
            <h2 className="mb-3 text-[clamp(1.72rem,3.15vw,2.6rem)] leading-[1] font-extrabold text-primary">
              {t('register.title')}
            </h2>
            <p className="mb-8 max-w-[46ch] text-[14px] leading-6 text-dark/80">
              {t('register.subtitle')}
            </p>

            {apiError && (
              <div className="mb-5 rounded-md border border-action/30 bg-action/5 px-4 py-3 text-sm text-action/90">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label htmlFor="nombres" className="text-[12px] font-semibold uppercase tracking-[0.08em] text-dark/80">
                    {t('register.firstNameLabel')} <span className="text-action">*</span>
                  </label>
                  <input
                    id="nombres"
                    placeholder={t('register.firstNamePlaceholder')}
                    value={form.nombres}
                    onChange={handleChange('nombres')}
                    onBlur={handleBlur('nombres')}
                    className={inputCls(errors.nombres)}
                  />
                  {errors.nombres && <p className="text-xs text-action/95">{errors.nombres}</p>}
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="apellidos" className="text-[12px] font-semibold uppercase tracking-[0.08em] text-dark/80">
                    {t('register.lastNameLabel')} <span className="text-action">*</span>
                  </label>
                  <input
                    id="apellidos"
                    placeholder={t('register.lastNamePlaceholder')}
                    value={form.apellidos}
                    onChange={handleChange('apellidos')}
                    onBlur={handleBlur('apellidos')}
                    className={inputCls(errors.apellidos)}
                  />
                  {errors.apellidos && <p className="text-xs text-action/95">{errors.apellidos}</p>}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-[12px] font-semibold uppercase tracking-[0.08em] text-dark/80">
                  {t('register.emailLabel')} <span className="text-action">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder={t('register.emailPlaceholder')}
                  value={form.email}
                  onChange={handleChange('email')}
                  onBlur={handleBlur('email')}
                  autoComplete="email"
                  className={inputCls(errors.email)}
                />
                {errors.email && <p className="text-xs text-action/95">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label htmlFor="cargo" className="text-[12px] font-semibold uppercase tracking-[0.08em] text-dark/80">
                    {t('register.cargoLabel')}
                  </label>
                  <input
                    id="cargo"
                    placeholder={t('register.cargoPlaceholder')}
                    value={form.cargo}
                    onChange={handleChange('cargo')}
                    className={inputCls(false)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="institucion" className="text-[12px] font-semibold uppercase tracking-[0.08em] text-dark/80">
                    {t('register.institucionLabel')}
                  </label>
                  <input
                    id="institucion"
                    placeholder={t('register.institucionPlaceholder')}
                    value={form.institucion}
                    onChange={handleChange('institucion')}
                    className={inputCls(false)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-md bg-dark py-3 text-[16px] font-bold text-surface transition-[transform,background-color] duration-200 active:scale-[0.985] hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? t('register.submitting') : t('register.submit')}
              </button>

              <p className="text-center text-[13px] text-dark/85">
                {t('register.hasAccount')}{' '}
                <Link to="/login" className="font-bold text-primary hover:text-primary/80">
                  {t('register.loginLink')}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
