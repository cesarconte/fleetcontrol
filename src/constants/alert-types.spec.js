import { describe, it, expect } from 'vitest'
import {
  ALERT_TYPES,
  ALERT_SEVERITIES,
  ALERT_TYPE_VALUES,
  ALERT_SEVERITY_VALUES,
  getAlertTypeLabel,
  getAlertTypeIcon,
  getAlertTypeColor,
  getAlertSeverityLabel,
  getAlertSeverityColor,
} from './alert-types.js'

describe('alert-types', () => {
  describe('ALERT_TYPES', () => {
    it('debería tener 9 tipos de alerta según PRD §4.8', () => {
      expect(Object.keys(ALERT_TYPES)).toHaveLength(9)
    })

    it('cada tipo debería tener value, label, icon, color, severity', () => {
      Object.values(ALERT_TYPES).forEach(type => {
        expect(type).toHaveProperty('value')
        expect(type).toHaveProperty('label')
        expect(type).toHaveProperty('icon')
        expect(type).toHaveProperty('color')
        expect(type).toHaveProperty('severity')
      })
    })

    it('debería estar congelado', () => {
      expect(Object.isFrozen(ALERT_TYPES)).toBe(true)
    })

    it('debería incluir los 9 tipos del enum alert_type en BD', () => {
      const values = Object.values(ALERT_TYPES).map(t => t.value)
      expect(values).toContain('vehicle_doc_expired')
      expect(values).toContain('driver_doc_expired')
      expect(values).toContain('driving_limit')
      expect(values).toContain('maintenance_pending')
      expect(values).toContain('anomalous_consumption')
      expect(values).toContain('vehicle_stopped')
      expect(values).toContain('speeding')
      expect(values).toContain('tachograph_download')
      expect(values).toContain('driving_violation')
    })

    it('los values deberían coincidir con las claves del objeto', () => {
      Object.entries(ALERT_TYPES).forEach(([key, type]) => {
        expect(type.value).toBe(key)
      })
    })

    it('severity de cada tipo debería ser info, warning o critical', () => {
      const validSeverities = ['info', 'warning', 'critical']
      Object.values(ALERT_TYPES).forEach(type => {
        expect(validSeverities).toContain(type.severity)
      })
    })
  })

  describe('ALERT_SEVERITIES', () => {
    it('debería tener 3 niveles de severidad', () => {
      expect(Object.keys(ALERT_SEVERITIES)).toHaveLength(3)
    })

    it('debería incluir info, warning, critical', () => {
      expect(ALERT_SEVERITIES).toHaveProperty('info')
      expect(ALERT_SEVERITIES).toHaveProperty('warning')
      expect(ALERT_SEVERITIES).toHaveProperty('critical')
    })

    it('cada severidad debería tener value, label, color', () => {
      Object.values(ALERT_SEVERITIES).forEach(sev => {
        expect(sev).toHaveProperty('value')
        expect(sev).toHaveProperty('label')
        expect(sev).toHaveProperty('color')
      })
    })

    it('debería estar congelado', () => {
      expect(Object.isFrozen(ALERT_SEVERITIES)).toBe(true)
    })
  })

  describe('ALERT_TYPE_VALUES', () => {
    it('debería contener 9 valores', () => {
      expect(ALERT_TYPE_VALUES).toHaveLength(9)
    })

    it('debería estar congelado', () => {
      expect(Object.isFrozen(ALERT_TYPE_VALUES)).toBe(true)
    })

    it('los valores deberían corresponder a los values de ALERT_TYPES', () => {
      const expected = Object.values(ALERT_TYPES).map(t => t.value)
      expect(ALERT_TYPE_VALUES).toEqual(expect.arrayContaining(expected))
    })
  })

  describe('ALERT_SEVERITY_VALUES', () => {
    it('debería contener 3 valores', () => {
      expect(ALERT_SEVERITY_VALUES).toHaveLength(3)
    })

    it('debería estar congelado', () => {
      expect(Object.isFrozen(ALERT_SEVERITY_VALUES)).toBe(true)
    })
  })

  describe('getAlertTypeLabel', () => {
    it('debería retornar label para vehicle_doc_expired', () => {
      expect(getAlertTypeLabel('vehicle_doc_expired')).toContain('Documento')
    })

    it('debería retornar label para driving_limit', () => {
      expect(getAlertTypeLabel('driving_limit')).toContain('conducción')
    })

    it('debería retornar label para speeding', () => {
      expect(getAlertTypeLabel('speeding')).toContain('Velocidad')
    })

    it('debería retornar el value para tipo desconocido', () => {
      expect(getAlertTypeLabel('unknown_type')).toBe('unknown_type')
    })
  })

  describe('getAlertTypeIcon', () => {
    it('debería retornar icono mdi para vehicle_doc_expired', () => {
      expect(getAlertTypeIcon('vehicle_doc_expired')).toMatch(/^mdi-/)
    })

    it('debería retornar icono mdi para driving_limit', () => {
      expect(getAlertTypeIcon('driving_limit')).toMatch(/^mdi-/)
    })

    it('debería retornar icono por defecto para tipo desconocido', () => {
      expect(getAlertTypeIcon('unknown_type')).toBe('mdi-alert-circle-outline')
    })
  })

  describe('getAlertTypeColor', () => {
    it('debería retornar color Vuetify para vehicle_doc_expired', () => {
      expect(getAlertTypeColor('vehicle_doc_expired')).toBeDefined()
    })

    it('debería retornar color Vuetify para speeding', () => {
      expect(getAlertTypeColor('speeding')).toBeDefined()
    })
  })

  describe('getAlertSeverityLabel', () => {
    it('debería retornar label en español para info', () => {
      expect(getAlertSeverityLabel('info')).toBe('Informativa')
    })

    it('debería retornar label en español para warning', () => {
      expect(getAlertSeverityLabel('warning')).toBe('Advertencia')
    })

    it('debería retornar label en español para critical', () => {
      expect(getAlertSeverityLabel('critical')).toBe('Crítica')
    })

    it('debería retornar el value para severidad desconocida', () => {
      expect(getAlertSeverityLabel('unknown')).toBe('unknown')
    })
  })

  describe('getAlertSeverityColor', () => {
    it('debería retornar info para nivel info', () => {
      expect(getAlertSeverityColor('info')).toBe('info')
    })

    it('debería retornar warning para nivel warning', () => {
      expect(getAlertSeverityColor('warning')).toBe('warning')
    })

    it('debería retornar error para nivel critical', () => {
      expect(getAlertSeverityColor('critical')).toBe('error')
    })
  })
})
