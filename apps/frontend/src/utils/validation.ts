import i18n from '../i18n'

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'\-]+$/
const SPECIAL_CHAR_REGEX = /[@$!%*?&]/

export function validateEmail(value) {
  if (!value?.trim()) return i18n.t('validation.emailRequired')
  if (!EMAIL_REGEX.test(value.trim())) return i18n.t('validation.emailInvalid')
  return null
}

export function validateLoginPassword(value) {
  if (!value) return i18n.t('validation.passwordRequired')
  return null
}

export function validateRegisterPassword(value, firstName = '', lastName = '', email = '') {
  if (!value) return i18n.t('validation.passwordRequired')
  if (value.length < 10) return i18n.t('validation.passwordMin')
  if (!/[A-Z]/.test(value)) return i18n.t('validation.passwordUppercase')
  if (!/[a-z]/.test(value)) return i18n.t('validation.passwordLowercase')
  if (!/\d/.test(value)) return i18n.t('validation.passwordNumber')
  if (!SPECIAL_CHAR_REGEX.test(value)) return i18n.t('validation.passwordSpecial')

  const parts = [firstName, lastName, email.split('@')[0]]
    .map(p => p?.trim().toLowerCase())
    .filter(p => p && p.length >= 3)

  for (const part of parts) {
    if (value.toLowerCase().includes(part)) {
      return i18n.t('validation.passwordPersonal')
    }
  }
  return null
}

export function validateName(value, label) {
  if (!value?.trim()) return i18n.t('validation.nameRequired', { label })
  if (value.trim().length < 3) return i18n.t('validation.nameMin', { label })
  if (!NAME_REGEX.test(value.trim())) return i18n.t('validation.nameLetters', { label })
  return null
}

export function validateCode(value) {
  if (!value?.trim()) return i18n.t('validation.codeRequired')
  return null
}

const E164_REGEX = /^\+[1-9]\d{7,14}$/

export function normalizarTelefono(raw) {
  const trimmed = (raw ?? '').trim()
  if (!trimmed) return { valor: null }

  const tienePlus = trimmed.startsWith('+')
  const digitos = trimmed.replace(/\D/g, '')

  const e164 = !tienePlus && digitos.length === 10 ? `+1${digitos}` : `+${digitos}`

  if (!E164_REGEX.test(e164)) {
    return { valor: null, error: i18n.t('validation.phoneInvalid') }
  }
  return { valor: e164 }
}
