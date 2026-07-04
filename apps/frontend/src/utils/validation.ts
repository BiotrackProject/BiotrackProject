const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'\-]+$/
const SPECIAL_CHAR_REGEX = /[@$!%*?&]/

export function validateEmail(value) {
  if (!value?.trim()) return 'El correo electrónico es requerido'
  if (!EMAIL_REGEX.test(value.trim())) return 'Ingrese un correo electrónico válido'
  return null
}

export function validateLoginPassword(value) {
  if (!value) return 'La contraseña es requerida'
  return null
}

export function validateRegisterPassword(value, firstName = '', lastName = '', email = '') {
  if (!value) return 'La contraseña es requerida'
  if (value.length < 10) return 'Mínimo 10 caracteres'
  if (!/[A-Z]/.test(value)) return 'Debe incluir al menos una mayúscula'
  if (!/[a-z]/.test(value)) return 'Debe incluir al menos una minúscula'
  if (!/\d/.test(value)) return 'Debe incluir al menos un número'
  if (!SPECIAL_CHAR_REGEX.test(value)) return 'Debe incluir al menos un carácter especial (@$!%*?&)'

  const parts = [firstName, lastName, email.split('@')[0]]
    .map(p => p?.trim().toLowerCase())
    .filter(p => p && p.length >= 3)

  for (const part of parts) {
    if (value.toLowerCase().includes(part)) {
      return 'La contraseña no puede contener tu nombre o correo'
    }
  }
  return null
}

export function validateName(value, label) {
  if (!value?.trim()) return `${label} es requerido`
  if (value.trim().length < 3) return `${label} debe tener al menos 3 caracteres`
  if (!NAME_REGEX.test(value.trim())) return `${label} solo puede contener letras`
  return null
}

export function validateCode(value) {
  if (!value?.trim()) return 'El código es requerido'
  return null
}

const E164_REGEX = /^\+[1-9]\d{7,14}$/

/**
 * Normaliza un teléfono a formato E.164 (+<código país><número>), que es el
 * que exige el backend (E164_REGEX). Devuelve `{ valor: null }` si está vacío,
 * o `{ valor: null, error }` si no se puede normalizar a un formato válido.
 *
 * @param {string} raw  Valor crudo del input.
 * @returns {{ valor: string | null, error?: string }}
 */
export function normalizarTelefono(raw) {
  const trimmed = (raw ?? '').trim()
  if (!trimmed) return { valor: null }

  // Conserva el + inicial y elimina cualquier otro caracter no numérico.
  const tienePlus = trimmed.startsWith('+')
  const digitos = trimmed.replace(/\D/g, '')

  // Número local de 10 dígitos sin + (RD/NANP) → asume código de país +1
  const e164 = !tienePlus && digitos.length === 10 ? `+1${digitos}` : `+${digitos}`

  if (!E164_REGEX.test(e164)) {
    return { valor: null, error: 'Teléfono inválido. Usa formato internacional, ej. +18090000000' }
  }
  return { valor: e164 }
}
