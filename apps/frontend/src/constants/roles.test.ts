import { describe, it, expect } from 'vitest'
import { ROLES, ROLES_LIST, ROLE_PERMISSIONS } from './roles'

describe('roles constants', () => {
  it('exposes the expected role labels', () => {
    expect(ROLES).toEqual({
      ADMIN: 'Administrador',
      ANALISTA: 'Analista',
      INSPECTOR: 'Inspector',
      READONLY: 'Solo lectura',
    })
    expect(ROLES_LIST).toContain('Administrador')
    expect(ROLES_LIST).toContain('Solo lectura')
  })

  it('defines minimum permissions by role', () => {
    expect(ROLE_PERMISSIONS[ROLES.ADMIN]).toContain('manage_users')
    expect(ROLE_PERMISSIONS[ROLES.READONLY]).toEqual(['view'])
    expect(ROLE_PERMISSIONS[ROLES.INSPECTOR]).toContain('create')
  })
})
