export const ROLES = {
  ADMIN:       'Administrador',
  ANALISTA:    'Analista',
  INSPECTOR:   'Inspector',
  READONLY:    'Solo lectura',
}

export const ROLES_LIST = Object.values(ROLES)

// Permissions per role (for future auth layer)
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ['view', 'create', 'edit', 'delete', 'change_status', 'manage_users'],
  [ROLES.ANALISTA]: ['view', 'create', 'edit', 'change_status'],
  [ROLES.INSPECTOR]: ['view', 'create', 'edit'],
  [ROLES.READONLY]: ['view'],
}
