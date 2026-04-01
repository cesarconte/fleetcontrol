/**
 * FleetControl — Role Permissions
 *
 * RBAC policy for the application.
 * Maps each user_role to its permissions per resource.
 *
 * @see PRD §4.10.1 — Política de Acceso RBAC
 */

/** @param {object} obj */
function deepFreeze(obj) {
  Object.keys(obj).forEach(key => {
    const val = obj[key]
    if (val && typeof val === 'object') deepFreeze(val)
  })
  return Object.freeze(obj)
}

export const USER_ROLES = deepFreeze({
  administrador: {
    value: 'administrador',
    label: 'Administrador',
    color: 'error',
  },
  jefe_trafico: {
    value: 'jefe_trafico',
    label: 'Jefe de Tráfico',
    color: 'primary',
  },
  agente_trafico: {
    value: 'agente_trafico',
    label: 'Agente de Tráfico',
    color: 'info',
  },
  tecnico_mantenimiento: {
    value: 'tecnico_mantenimiento',
    label: 'Técnico de Mantenimiento',
    color: 'warning',
  },
  solo_lectura: {
    value: 'solo_lectura',
    label: 'Solo Lectura',
    color: 'grey',
  },
})

/** @type {string[]} */
export const USER_ROLE_VALUES = Object.freeze(Object.keys(USER_ROLES))

/**
 * Permissions per role for settings tabs.
 * Values: 'none', 'view', 'edit', 'manage'
 */
export const ROLE_PERMISSIONS = deepFreeze({
  administrador: {
    companySettings: 'edit',
    users: 'manage',
    alertThresholds: 'edit',
    integrations: 'edit',
    vehicles: 'crud',
    drivers: 'crud',
    routes: 'crud',
    cargo: 'crud',
    maintenance: 'crud',
  },
  jefe_trafico: {
    companySettings: 'view',
    users: 'none',
    alertThresholds: 'view',
    integrations: 'none',
    vehicles: 'crud',
    drivers: 'crud',
    routes: 'crud',
    cargo: 'crud',
    maintenance: 'view',
  },
  agente_trafico: {
    companySettings: 'view',
    users: 'none',
    alertThresholds: 'view',
    integrations: 'none',
    vehicles: 'view',
    drivers: 'view',
    routes: 'crud',
    cargo: 'crud',
    maintenance: 'view',
  },
  tecnico_mantenimiento: {
    companySettings: 'view',
    users: 'none',
    alertThresholds: 'view',
    integrations: 'none',
    vehicles: 'view',
    drivers: 'view',
    routes: 'view',
    cargo: 'view',
    maintenance: 'crud',
  },
  solo_lectura: {
    companySettings: 'view',
    users: 'none',
    alertThresholds: 'view',
    integrations: 'none',
    vehicles: 'view',
    drivers: 'view',
    routes: 'view',
    cargo: 'view',
    maintenance: 'view',
  },
})

export function getUserRoleLabel(value) {
  return USER_ROLES[value]?.label ?? value
}

export function getUserRoleColor(value) {
  return USER_ROLES[value]?.color ?? 'grey'
}

export function canEditCompanySettings(role) {
  return ROLE_PERMISSIONS[role]?.companySettings === 'edit'
}

export function canManageUsers(role) {
  return ROLE_PERMISSIONS[role]?.users === 'manage'
}

export function canEditAlertThresholds(role) {
  return ROLE_PERMISSIONS[role]?.alertThresholds === 'edit'
}

export function canEditIntegrations(role) {
  return ROLE_PERMISSIONS[role]?.integrations === 'edit'
}

export function canEditModule(role, module) {
  const perm = ROLE_PERMISSIONS[role]?.[module]
  return perm === 'crud' || perm === 'edit' || perm === 'manage'
}

export function hasSettingsAccess(role, tab) {
  const perm = ROLE_PERMISSIONS[role]
  if (!perm) return false
  switch (tab) {
    case 'empresa':
      return perm.companySettings !== 'none'
    case 'usuarios':
      return perm.users !== 'none'
    case 'alertas':
      return perm.alertThresholds !== 'none'
    case 'integraciones':
      return perm.integrations !== 'none'
    default:
      return false
  }
}
