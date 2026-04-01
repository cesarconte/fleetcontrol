import { describe, it, expect } from 'vitest'
import {
  REPORT_TYPES,
  REPORT_TYPE_VALUES,
  getReportTypeLabel,
  getReportTypeIcon,
  getReportTypeColor,
  getReportTypeDescription,
  getReportPeriodOptions,
} from './report-types.js'

describe('report-types', () => {
  describe('REPORT_TYPES', () => {
    it('debería tener 10 tipos de informe', () => {
      expect(Object.keys(REPORT_TYPES)).toHaveLength(10)
    })

    it('cada tipo debería tener value, label, icon, color, description', () => {
      Object.values(REPORT_TYPES).forEach(type => {
        expect(type).toHaveProperty('value')
        expect(type).toHaveProperty('label')
        expect(type).toHaveProperty('icon')
        expect(type).toHaveProperty('color')
        expect(type).toHaveProperty('description')
      })
    })

    it('debería estar congelado', () => {
      expect(Object.isFrozen(REPORT_TYPES)).toBe(true)
    })

    it('debería incluir los 10 tipos', () => {
      const values = Object.values(REPORT_TYPES).map(t => t.value)
      expect(values).toContain('flota')
      expect(values).toContain('conductores')
      expect(values).toContain('rutas')
      expect(values).toContain('combustible')
      expect(values).toContain('mantenimiento')
      expect(values).toContain('cumplimiento')
      expect(values).toContain('tacografos')
      expect(values).toContain('cargas')
      expect(values).toContain('economico')
      expect(values).toContain('dashboard')
    })

    it('los values deberían coincidir con las claves', () => {
      Object.entries(REPORT_TYPES).forEach(([key, type]) => {
        expect(type.value).toBe(key)
      })
    })

    it('cada icono debería empezar con mdi-', () => {
      Object.values(REPORT_TYPES).forEach(type => {
        expect(type.icon).toMatch(/^mdi-/)
      })
    })
  })

  describe('REPORT_TYPE_VALUES', () => {
    it('debería contener 10 valores', () => {
      expect(REPORT_TYPE_VALUES).toHaveLength(10)
    })

    it('debería estar congelado', () => {
      expect(Object.isFrozen(REPORT_TYPE_VALUES)).toBe(true)
    })
  })

  describe('getReportTypeLabel', () => {
    it('debería retornar label para flota', () => {
      expect(getReportTypeLabel('flota')).toBe('Informe de Flota')
    })

    it('debería retornar label para economico', () => {
      expect(getReportTypeLabel('economico')).toContain('Económico')
    })

    it('debería retornar el value para tipo desconocido', () => {
      expect(getReportTypeLabel('unknown')).toBe('unknown')
    })
  })

  describe('getReportTypeIcon', () => {
    it('debería retornar icono mdi para flota', () => {
      expect(getReportTypeIcon('flota')).toMatch(/^mdi-/)
    })

    it('debería retornar icono por defecto para desconocido', () => {
      expect(getReportTypeIcon('unknown')).toBe('mdi-file-document-outline')
    })
  })

  describe('getReportTypeColor', () => {
    it('debería retornar color Vuetify para cada tipo', () => {
      Object.values(REPORT_TYPES).forEach(type => {
        const color = getReportTypeColor(type.value)
        expect(color).toBeDefined()
        expect(typeof color).toBe('string')
      })
    })
  })

  describe('getReportTypeDescription', () => {
    it('debería retornar descripción para cada tipo', () => {
      Object.values(REPORT_TYPES).forEach(type => {
        const desc = getReportTypeDescription(type.value)
        expect(desc).toBeDefined()
        expect(typeof desc).toBe('string')
        expect(desc.length).toBeGreaterThan(0)
      })
    })
  })

  describe('getReportPeriodOptions', () => {
    it('debería retornar opciones de período predefinidas', () => {
      const options = getReportPeriodOptions()
      expect(options).toBeInstanceOf(Array)
      expect(options.length).toBeGreaterThanOrEqual(6)
    })

    it('cada opción debería tener value y label', () => {
      getReportPeriodOptions().forEach(opt => {
        expect(opt).toHaveProperty('value')
        expect(opt).toHaveProperty('label')
      })
    })

    it('debería incluir este_mes, ultimo_mes, este_ano, ultimo_ano', () => {
      const values = getReportPeriodOptions().map(o => o.value)
      expect(values).toContain('este_mes')
      expect(values).toContain('ultimo_mes')
      expect(values).toContain('este_ano')
      expect(values).toContain('ultimo_ano')
    })
  })
})
