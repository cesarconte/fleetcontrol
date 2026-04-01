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
  admin: {
    value: 'admin',
    label: 'Administrador',
    color: 'error',
  },
  traffic_manager: {
    value: 'traffic_manager',
    label: 'Jefe de Tráfico',
    color: 'primary',
  },
  traffic_agent: {
    value: 'traffic_agent',
    label: 'Agente de Tráfico',
    color: 'info',
  },
  maintenance_tech: {
    value: 'maintenance_tech',
    label: 'Técnico de Mantenimiento',
    color: 'warning',
  },
  read_only: {
    value: 'read_only',
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
  admin: {
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
  traffic_manager: {
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
  traffic_agent: {
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
  maintenance_tech: {
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
  read_only: {
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
