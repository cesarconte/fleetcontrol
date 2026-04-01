import { describe, it, expect } from 'vitest'
import {
  ROLE_PERMISSIONS,
  USER_ROLES,
  USER_ROLE_VALUES,
  getUserRoleLabel,
  getUserRoleColor,
  canEditCompanySettings,
  canManageUsers,
  canEditAlertThresholds,
  canEditIntegrations,
  canEditModule,
  hasSettingsAccess,
} from './role-permissions.js'

describe('role-permissions', () => {
  describe('USER_ROLES', () => {
    it('debería tener 5 roles', () => {
      expect(Object.keys(USER_ROLES)).toHaveLength(5)
    })

    it('debería incluir los 5 roles del enum user_role', () => {
      expect(USER_ROLES).toHaveProperty('admin')
      expect(USER_ROLES).toHaveProperty('traffic_manager')
      expect(USER_ROLES).toHaveProperty('traffic_agent')
      expect(USER_ROLES).toHaveProperty('maintenance_tech')
      expect(USER_ROLES).toHaveProperty('read_only')
    })

    it('cada rol debería tener value, label, color', () => {
      Object.values(USER_ROLES).forEach(role => {
        expect(role).toHaveProperty('value')
        expect(role).toHaveProperty('label')
        expect(role).toHaveProperty('color')
      })
    })

    it('debería estar congelado', () => {
      expect(Object.isFrozen(USER_ROLES)).toBe(true)
    })
  })

  describe('USER_ROLE_VALUES', () => {
    it('debería contener 5 valores', () => {
      expect(USER_ROLE_VALUES).toHaveLength(5)
    })

    it('debería estar congelado', () => {
      expect(Object.isFrozen(USER_ROLE_VALUES)).toBe(true)
    })
  })

  describe('getUserRoleLabel', () => {
    it('debería retornar label para administrador', () => {
      expect(getUserRoleLabel('admin')).toBe('Administrador')
    })

    it('debería retornar label para jefe_trafico', () => {
      expect(getUserRoleLabel('traffic_manager')).toContain('Tráfico')
    })

    it('debería retornar el value para rol desconocido', () => {
      expect(getUserRoleLabel('unknown')).toBe('unknown')
    })
  })

  describe('getUserRoleColor', () => {
    it('debería retornar color Vuetify para cada rol', () => {
      Object.values(USER_ROLES).forEach(role => {
        const color = getUserRoleColor(role.value)
        expect(color).toBeDefined()
        expect(typeof color).toBe('string')
      })
    })
  })

  describe('ROLE_PERMISSIONS', () => {
    it('debería tener permisos para los 5 roles', () => {
      expect(ROLE_PERMISSIONS).toHaveProperty('admin')
      expect(ROLE_PERMISSIONS).toHaveProperty('traffic_manager')
      expect(ROLE_PERMISSIONS).toHaveProperty('traffic_agent')
      expect(ROLE_PERMISSIONS).toHaveProperty('maintenance_tech')
      expect(ROLE_PERMISSIONS).toHaveProperty('read_only')
    })

    it('cada rol debería tener permisos para companySettings, users, alertThresholds, integrations', () => {
      Object.values(ROLE_PERMISSIONS).forEach(perms => {
        expect(perms).toHaveProperty('companySettings')
        expect(perms).toHaveProperty('users')
        expect(perms).toHaveProperty('alertThresholds')
        expect(perms).toHaveProperty('integrations')
      })
    })

    it('debería estar congelado', () => {
      expect(Object.isFrozen(ROLE_PERMISSIONS)).toBe(true)
    })
  })

  describe('canEditCompanySettings', () => {
    it('administrador debería poder editar', () => {
      expect(canEditCompanySettings('admin')).toBe(true)
    })

    it('jefe_trafico NO debería poder editar', () => {
      expect(canEditCompanySettings('traffic_manager')).toBe(false)
    })

    it('solo_lectura NO debería poder editar', () => {
      expect(canEditCompanySettings('read_only')).toBe(false)
    })
  })

  describe('canManageUsers', () => {
    it('administrador debería poder gestionar usuarios', () => {
      expect(canManageUsers('admin')).toBe(true)
    })

    it('ningún otro rol debería poder gestionar usuarios', () => {
      expect(canManageUsers('traffic_manager')).toBe(false)
      expect(canManageUsers('traffic_agent')).toBe(false)
      expect(canManageUsers('maintenance_tech')).toBe(false)
      expect(canManageUsers('read_only')).toBe(false)
    })
  })

  describe('canEditAlertThresholds', () => {
    it('administrador debería poder editar umbrales', () => {
      expect(canEditAlertThresholds('admin')).toBe(true)
    })

    it('otros roles NO deberían poder editar', () => {
      expect(canEditAlertThresholds('traffic_manager')).toBe(false)
      expect(canEditAlertThresholds('read_only')).toBe(false)
    })
  })

  describe('canEditIntegrations', () => {
    it('administrador debería poder editar integraciones', () => {
      expect(canEditIntegrations('admin')).toBe(true)
    })

    it('otros roles NO deberían poder editar', () => {
      expect(canEditIntegrations('traffic_manager')).toBe(false)
    })
  })

  describe('canEditModule', () => {
    it('administrador debería poder editar todos los módulos', () => {
      expect(canEditModule('admin', 'vehicles')).toBe(true)
      expect(canEditModule('admin', 'drivers')).toBe(true)
      expect(canEditModule('admin', 'routes')).toBe(true)
      expect(canEditModule('admin', 'maintenance')).toBe(true)
    })

    it('jefe_trafico debería poder editar vehicles, drivers, routes pero no maintenance', () => {
      expect(canEditModule('traffic_manager', 'vehicles')).toBe(true)
      expect(canEditModule('traffic_manager', 'routes')).toBe(true)
      expect(canEditModule('traffic_manager', 'maintenance')).toBe(false)
    })

    it('agente_trafico debería poder editar solo routes y cargo', () => {
      expect(canEditModule('traffic_agent', 'routes')).toBe(true)
      expect(canEditModule('traffic_agent', 'cargo')).toBe(true)
      expect(canEditModule('traffic_agent', 'vehicles')).toBe(false)
      expect(canEditModule('traffic_agent', 'maintenance')).toBe(false)
    })

    it('solo_lectura no debería poder editar nada', () => {
      expect(canEditModule('read_only', 'vehicles')).toBe(false)
      expect(canEditModule('read_only', 'routes')).toBe(false)
    })
  })

  describe('hasSettingsAccess', () => {
    it('administrador debería tener acceso a todas las pestañas', () => {
      expect(hasSettingsAccess('admin', 'empresa')).toBe(true)
      expect(hasSettingsAccess('admin', 'usuarios')).toBe(true)
      expect(hasSettingsAccess('admin', 'alertas')).toBe(true)
      expect(hasSettingsAccess('admin', 'integraciones')).toBe(true)
    })

    it('jefe_trafico debería poder ver empresa y alertas pero no usuarios ni integraciones', () => {
      expect(hasSettingsAccess('traffic_manager', 'empresa')).toBe(true)
      expect(hasSettingsAccess('traffic_manager', 'alertas')).toBe(true)
      expect(hasSettingsAccess('traffic_manager', 'usuarios')).toBe(false)
      expect(hasSettingsAccess('traffic_manager', 'integraciones')).toBe(false)
    })

    it('solo_lectura solo debería poder ver empresa y alertas', () => {
      expect(hasSettingsAccess('read_only', 'empresa')).toBe(true)
      expect(hasSettingsAccess('read_only', 'alertas')).toBe(true)
      expect(hasSettingsAccess('read_only', 'usuarios')).toBe(false)
      expect(hasSettingsAccess('read_only', 'integraciones')).toBe(false)
    })
  })
})
