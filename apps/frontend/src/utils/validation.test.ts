import { describe, expect, it } from 'vitest'
import {
  validateCode,
  validateEmail,
  validateLoginPassword,
  validateName,
  validateRegisterPassword,
} from './validation'

describe('validation helpers', () => {
  it('validates email format and required state', () => {
    expect(validateEmail('')).toBe('El correo electrónico es requerido')
    expect(validateEmail('not-an-email')).toBe('Ingrese un correo electrónico válido')
    expect(validateEmail('user@biotrack.com')).toBeNull()
  })

  it('validates login password as required', () => {
    expect(validateLoginPassword('')).toBe('La contraseña es requerida')
    expect(validateLoginPassword('abc123')).toBeNull()
  })

  it('validates register password complexity and user data exclusion', () => {
    expect(validateRegisterPassword('')).toBe('La contraseña es requerida')
    expect(validateRegisterPassword('short')).toBe('Mínimo 10 caracteres')
    expect(validateRegisterPassword('alllowercase123!')).toBe('Debe incluir al menos una mayúscula')
    expect(validateRegisterPassword('ALLUPPERCASE123!')).toBe('Debe incluir al menos una minúscula')
    expect(validateRegisterPassword('NoNumbersHere!')).toBe('Debe incluir al menos un número')
    expect(validateRegisterPassword('NoSpecialChar123')).toBe('Debe incluir al menos un carácter especial (@$!%*?&)')
    expect(validateRegisterPassword('JaneDoe123!', 'Jane', 'Doe', 'jane@biotrack.com')).toBe('La contraseña no puede contener tu nombre o correo')
    expect(validateRegisterPassword('SecurePass123!')).toBeNull()
  })

  it('validates names', () => {
    expect(validateName('', 'Nombres')).toBe('Nombres es requerido')
    expect(validateName('Jo', 'Nombres')).toBe('Nombres debe tener al menos 3 caracteres')
    expect(validateName('John123', 'Nombres')).toBe('Nombres solo puede contener letras')
    expect(validateName('John', 'Nombres')).toBeNull()
  })

  it('validates verification code as required', () => {
    expect(validateCode('')).toBe('El código es requerido')
    expect(validateCode('123456')).toBeNull()
  })
})