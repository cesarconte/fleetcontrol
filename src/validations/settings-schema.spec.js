import { describe, it, expect } from 'vitest'
import {
  companySettingsSchema,
  alertThresholdsSchema,
  integrationsSchema,
  emailIntegrationsSchema,
  mapsIntegrationsSchema,
  fuelCardIntegrationsSchema,
  accountingIntegrationsSchema,
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
      const { email, ...rest } = valid // eslint-disable-line no-unused-vars
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
      alert_driving_hours: 9,
      alert_tachograph_days: 28,
      alert_speed_limit: 90,
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

    it('debería aceptar umbral de conducción válido', () => {
      expect(alertThresholdsSchema.safeParse({ ...valid, alert_driving_hours: 9 }).success).toBe(
        true,
      )
    })

    it('debería rechazar umbral de conducción mayor a 24', () => {
      expect(alertThresholdsSchema.safeParse({ ...valid, alert_driving_hours: 25 }).success).toBe(
        false,
      )
    })

    it('debería aceptar umbral de tacógrafo válido', () => {
      expect(alertThresholdsSchema.safeParse({ ...valid, alert_tachograph_days: 28 }).success).toBe(
        true,
      )
    })

    it('debería rechazar umbral de tacógrafo mayor a 90', () => {
      expect(
        alertThresholdsSchema.safeParse({ ...valid, alert_tachograph_days: 100 }).success,
      ).toBe(false)
    })

    it('debería aceptar umbral de velocidad válido', () => {
      expect(alertThresholdsSchema.safeParse({ ...valid, alert_speed_limit: 90 }).success).toBe(
        true,
      )
    })

    it('debería rechazar umbral de velocidad mayor a 200', () => {
      expect(alertThresholdsSchema.safeParse({ ...valid, alert_speed_limit: 250 }).success).toBe(
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
      role: 'traffic_agent',
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
      const roles = ['admin', 'traffic_manager', 'traffic_agent', 'maintenance_tech', 'read_only']
      roles.forEach(role => {
        expect(userCreateSchema.safeParse({ ...valid, role }).success).toBe(true)
      })
    })
  })

  describe('integrationsSchema', () => {
    it('debería aceptar formulario vacío (campos opcionales)', () => {
      expect(integrationsSchema.safeParse({}).success).toBe(true)
    })

    it('debería aceptar proveedor GPS válido', () => {
      expect(integrationsSchema.safeParse({ gps_provider: 'webfleet' }).success).toBe(true)
    })

    it('debería aceptar cadena vacía como proveedor', () => {
      expect(integrationsSchema.safeParse({ gps_provider: '' }).success).toBe(true)
    })

    it('debería rechazar proveedor GPS inválido', () => {
      expect(integrationsSchema.safeParse({ gps_provider: 'invalid_provider' }).success).toBe(false)
    })

    it('debería aceptar API key y secret como strings', () => {
      const result = integrationsSchema.safeParse({
        gps_provider: 'geotab',
        gps_api_key: 'my-api-key',
        gps_api_secret: 'my-secret',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('emailIntegrationsSchema', () => {
    it('debería aceptar formulario vacío', () => {
      expect(emailIntegrationsSchema.safeParse({}).success).toBe(true)
    })

    it('debería aceptar proveedor email válido', () => {
      expect(emailIntegrationsSchema.safeParse({ email_provider: 'brevo' }).success).toBe(true)
    })

    it('debería rechazar proveedor email inválido', () => {
      expect(emailIntegrationsSchema.safeParse({ email_provider: 'invalid' }).success).toBe(false)
    })

    it('debería rechazar sender_email inválido', () => {
      expect(emailIntegrationsSchema.safeParse({ email_sender_email: 'not-email' }).success).toBe(
        false,
      )
    })
  })

  describe('mapsIntegrationsSchema', () => {
    it('debería aceptar formulario vacío', () => {
      expect(mapsIntegrationsSchema.safeParse({}).success).toBe(true)
    })

    it('debería aceptar proveedor maps válido', () => {
      expect(mapsIntegrationsSchema.safeParse({ maps_provider: 'google_maps' }).success).toBe(true)
    })

    it('debería rechazar proveedor maps inválido', () => {
      expect(mapsIntegrationsSchema.safeParse({ maps_provider: 'mapbox' }).success).toBe(false)
    })
  })

  describe('fuelCardIntegrationsSchema', () => {
    it('debería aceptar formulario vacío', () => {
      expect(fuelCardIntegrationsSchema.safeParse({}).success).toBe(true)
    })

    it('debería aceptar proveedor válido', () => {
      expect(fuelCardIntegrationsSchema.safeParse({ fuel_card_provider: 'dkv' }).success).toBe(true)
    })

    it('debería rechazar proveedor inválido', () => {
      expect(fuelCardIntegrationsSchema.safeParse({ fuel_card_provider: 'shell' }).success).toBe(
        false,
      )
    })
  })

  describe('accountingIntegrationsSchema', () => {
    it('debería aceptar formulario vacío', () => {
      expect(accountingIntegrationsSchema.safeParse({}).success).toBe(true)
    })

    it('debería aceptar proveedor válido', () => {
      expect(accountingIntegrationsSchema.safeParse({ accounting_provider: 'sage' }).success).toBe(
        true,
      )
    })

    it('debería rechazar proveedor inválido', () => {
      expect(
        accountingIntegrationsSchema.safeParse({ accounting_provider: 'quickbooks' }).success,
      ).toBe(false)
    })
  })
})
