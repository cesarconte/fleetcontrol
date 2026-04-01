import { describe, it, expect } from 'vitest'
import {
  companySettingsSchema,
  alertThresholdsSchema,
  userProfileSchema,
  userCreateSchema,
} from './settings-schema.js'

describe('settings-schema', () => {
  describe('companySettingsSchema', () => {
    const valid = {
      company_name: 'Transportes Ejemplo S.L.',
      cif: 'B12345678',
      address: 'Calle Mayor 1',
      city: 'Madrid',
      postal_code: '28001',
      province: 'Madrid',
      country: 'España',
      email: 'info@ejemplo.com',
      phone: '+34911234567',
    }

    it('debería aceptar datos válidos de empresa', () => {
      expect(companySettingsSchema.safeParse(valid).success).toBe(true)
    })

    it('debería rechazar nombre vacío', () => {
      expect(companySettingsSchema.safeParse({ ...valid, company_name: '' }).success).toBe(false)
    })

    it('debería rechazar CIF vacío', () => {
      expect(companySettingsSchema.safeParse({ ...valid, cif: '' }).success).toBe(false)
    })

    it('debería aceptar email opcional', () => {
      const { email, ...rest } = valid
      expect(companySettingsSchema.safeParse(rest).success).toBe(true)
    })

    it('debería rechazar email inválido', () => {
      expect(companySettingsSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(
        false,
      )
    })
  })

  describe('alertThresholdsSchema', () => {
    const valid = {
      alert_days_vehicle_doc: 30,
      alert_days_driver_doc: 30,
      alert_days_maintenance_km: 5000,
      alert_days_maintenance_days: 30,
      alert_critical_doc_days: 7,
      fuel_anomaly_percent: 20,
    }

    it('debería aceptar umbrales válidos', () => {
      expect(alertThresholdsSchema.safeParse(valid).success).toBe(true)
    })

    it('debería rechazar días de alerta negativos', () => {
      expect(
        alertThresholdsSchema.safeParse({ ...valid, alert_days_vehicle_doc: -1 }).success,
      ).toBe(false)
    })

    it('debería rechazar días de alerta mayores a 365', () => {
      expect(
        alertThresholdsSchema.safeParse({ ...valid, alert_days_vehicle_doc: 400 }).success,
      ).toBe(false)
    })

    it('debería rechazar km de mantenimiento negativos', () => {
      expect(
        alertThresholdsSchema.safeParse({ ...valid, alert_days_maintenance_km: -1 }).success,
      ).toBe(false)
    })

    it('debería rechazar porcentaje de anomalía mayor a 100', () => {
      expect(alertThresholdsSchema.safeParse({ ...valid, fuel_anomaly_percent: 150 }).success).toBe(
        false,
      )
    })
  })

  describe('userProfileSchema', () => {
    const valid = {
      full_name: 'Juan Pérez',
      phone: '+34612345678',
    }

    it('debería aceptar perfil válido', () => {
      expect(userProfileSchema.safeParse(valid).success).toBe(true)
    })

    it('debería rechazar nombre vacío', () => {
      expect(userProfileSchema.safeParse({ full_name: '' }).success).toBe(false)
    })
  })

  describe('userCreateSchema', () => {
    const valid = {
      email: 'user@ejemplo.com',
      full_name: 'Nuevo Usuario',
      role: 'agente_trafico',
    }

    it('debería aceptar datos válidos de usuario', () => {
      expect(userCreateSchema.safeParse(valid).success).toBe(true)
    })

    it('debería rechazar email inválido', () => {
      expect(userCreateSchema.safeParse({ ...valid, email: 'invalid' }).success).toBe(false)
    })

    it('debería rechazar rol inválido', () => {
      expect(userCreateSchema.safeParse({ ...valid, role: 'invalid_role' }).success).toBe(false)
    })

    it('debería aceptar todos los roles válidos', () => {
      const roles = [
        'administrador',
        'jefe_trafico',
        'agente_trafico',
        'tecnico_mantenimiento',
        'solo_lectura',
      ]
      roles.forEach(role => {
        expect(userCreateSchema.safeParse({ ...valid, role }).success).toBe(true)
      })
    })
  })
})
