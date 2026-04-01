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
      expect(USER_ROLES).toHaveProperty('administrador')
      expect(USER_ROLES).toHaveProperty('jefe_trafico')
      expect(USER_ROLES).toHaveProperty('agente_trafico')
      expect(USER_ROLES).toHaveProperty('tecnico_mantenimiento')
      expect(USER_ROLES).toHaveProperty('solo_lectura')
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
      expect(getUserRoleLabel('administrador')).toBe('Administrador')
    })

    it('debería retornar label para jefe_trafico', () => {
      expect(getUserRoleLabel('jefe_trafico')).toContain('Tráfico')
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
      expect(ROLE_PERMISSIONS).toHaveProperty('administrador')
      expect(ROLE_PERMISSIONS).toHaveProperty('jefe_trafico')
      expect(ROLE_PERMISSIONS).toHaveProperty('agente_trafico')
      expect(ROLE_PERMISSIONS).toHaveProperty('tecnico_mantenimiento')
      expect(ROLE_PERMISSIONS).toHaveProperty('solo_lectura')
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
      expect(canEditCompanySettings('administrador')).toBe(true)
    })

    it('jefe_trafico NO debería poder editar', () => {
      expect(canEditCompanySettings('jefe_trafico')).toBe(false)
    })

    it('solo_lectura NO debería poder editar', () => {
      expect(canEditCompanySettings('solo_lectura')).toBe(false)
    })
  })

  describe('canManageUsers', () => {
    it('administrador debería poder gestionar usuarios', () => {
      expect(canManageUsers('administrador')).toBe(true)
    })

    it('ningún otro rol debería poder gestionar usuarios', () => {
      expect(canManageUsers('jefe_trafico')).toBe(false)
      expect(canManageUsers('agente_trafico')).toBe(false)
      expect(canManageUsers('tecnico_mantenimiento')).toBe(false)
      expect(canManageUsers('solo_lectura')).toBe(false)
    })
  })

  describe('canEditAlertThresholds', () => {
    it('administrador debería poder editar umbrales', () => {
      expect(canEditAlertThresholds('administrador')).toBe(true)
    })

    it('otros roles NO deberían poder editar', () => {
      expect(canEditAlertThresholds('jefe_trafico')).toBe(false)
      expect(canEditAlertThresholds('solo_lectura')).toBe(false)
    })
  })

  describe('canEditIntegrations', () => {
    it('administrador debería poder editar integraciones', () => {
      expect(canEditIntegrations('administrador')).toBe(true)
    })

    it('otros roles NO deberían poder editar', () => {
      expect(canEditIntegrations('jefe_trafico')).toBe(false)
    })
  })

  describe('canEditModule', () => {
    it('administrador debería poder editar todos los módulos', () => {
      expect(canEditModule('administrador', 'vehicles')).toBe(true)
      expect(canEditModule('administrador', 'drivers')).toBe(true)
      expect(canEditModule('administrador', 'routes')).toBe(true)
      expect(canEditModule('administrador', 'maintenance')).toBe(true)
    })

    it('jefe_trafico debería poder editar vehicles, drivers, routes pero no maintenance', () => {
      expect(canEditModule('jefe_trafico', 'vehicles')).toBe(true)
      expect(canEditModule('jefe_trafico', 'routes')).toBe(true)
      expect(canEditModule('jefe_trafico', 'maintenance')).toBe(false)
    })

    it('agente_trafico debería poder editar solo routes y cargo', () => {
      expect(canEditModule('agente_trafico', 'routes')).toBe(true)
      expect(canEditModule('agente_trafico', 'cargo')).toBe(true)
      expect(canEditModule('agente_trafico', 'vehicles')).toBe(false)
      expect(canEditModule('agente_trafico', 'maintenance')).toBe(false)
    })

    it('solo_lectura no debería poder editar nada', () => {
      expect(canEditModule('solo_lectura', 'vehicles')).toBe(false)
      expect(canEditModule('solo_lectura', 'routes')).toBe(false)
    })
  })

  describe('hasSettingsAccess', () => {
    it('administrador debería tener acceso a todas las pestañas', () => {
      expect(hasSettingsAccess('administrador', 'empresa')).toBe(true)
      expect(hasSettingsAccess('administrador', 'usuarios')).toBe(true)
      expect(hasSettingsAccess('administrador', 'alertas')).toBe(true)
      expect(hasSettingsAccess('administrador', 'integraciones')).toBe(true)
    })

    it('jefe_trafico debería poder ver empresa y alertas pero no usuarios ni integraciones', () => {
      expect(hasSettingsAccess('jefe_trafico', 'empresa')).toBe(true)
      expect(hasSettingsAccess('jefe_trafico', 'alertas')).toBe(true)
      expect(hasSettingsAccess('jefe_trafico', 'usuarios')).toBe(false)
      expect(hasSettingsAccess('jefe_trafico', 'integraciones')).toBe(false)
    })

    it('solo_lectura solo debería poder ver empresa y alertas', () => {
      expect(hasSettingsAccess('solo_lectura', 'empresa')).toBe(true)
      expect(hasSettingsAccess('solo_lectura', 'alertas')).toBe(true)
      expect(hasSettingsAccess('solo_lectura', 'usuarios')).toBe(false)
      expect(hasSettingsAccess('solo_lectura', 'integraciones')).toBe(false)
    })
  })
})
