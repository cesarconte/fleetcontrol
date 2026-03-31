import { describe, it, expect } from 'vitest'
import {
  VEHICLE_DOCUMENT_TYPES,
  VEHICLE_DOCUMENT_TYPE_VALUES,
  getVehicleDocumentTypeLabel,
  getRequiredVehicleDocumentTypes,
  isDocumentRequiredForSubcategory,
} from './vehicle-document-types.js'

describe('vehicle-document-types', () => {
  describe('VEHICLE_DOCUMENT_TYPES', () => {
    it('debería tener 8 tipos de documento', () => {
      expect(Object.keys(VEHICLE_DOCUMENT_TYPES)).toHaveLength(8)
    })

    it('cada tipo debería tener value, label, required, periodicity, baseLegal', () => {
      Object.values(VEHICLE_DOCUMENT_TYPES).forEach(type => {
        expect(type).toHaveProperty('value')
        expect(type).toHaveProperty('label')
        expect(type).toHaveProperty('required')
        expect(type).toHaveProperty('periodicity')
        expect(type).toHaveProperty('baseLegal')
      })
    })

    it('debería estar congelado', () => {
      expect(Object.isFrozen(VEHICLE_DOCUMENT_TYPES)).toBe(true)
    })

    it('debería incluir ITV, seguro_rc, tarjeta_transporte, calibracion_tacografo, permiso_circulacion', () => {
      const values = Object.values(VEHICLE_DOCUMENT_TYPES).map(t => t.value)
      expect(values).toContain('itv')
      expect(values).toContain('seguro_rc')
      expect(values).toContain('tarjeta_transporte')
      expect(values).toContain('calibracion_tacografo')
      expect(values).toContain('permiso_circulacion')
    })

    it('debería incluir certificado_adr_vehiculo, autorizacion_transporte_especial, revision_limitador_velocidad', () => {
      const values = Object.values(VEHICLE_DOCUMENT_TYPES).map(t => t.value)
      expect(values).toContain('certificado_adr_vehiculo')
      expect(values).toContain('autorizacion_transporte_especial')
      expect(values).toContain('revision_limitador_velocidad')
    })

    it('5 tipos deberían ser obligatorios (required: true)', () => {
      const required = Object.values(VEHICLE_DOCUMENT_TYPES).filter(t => t.required)
      expect(required).toHaveLength(5)
    })

    it('3 tipos deberían ser opcionales (required: false)', () => {
      const optional = Object.values(VEHICLE_DOCUMENT_TYPES).filter(t => !t.required)
      expect(optional).toHaveLength(3)
    })
  })

  describe('VEHICLE_DOCUMENT_TYPE_VALUES', () => {
    it('debería contener 8 valores', () => {
      expect(VEHICLE_DOCUMENT_TYPE_VALUES).toHaveLength(8)
    })

    it('debería estar congelado', () => {
      expect(Object.isFrozen(VEHICLE_DOCUMENT_TYPE_VALUES)).toBe(true)
    })
  })

  describe('getVehicleDocumentTypeLabel', () => {
    it('debería retornar label para itv', () => {
      expect(getVehicleDocumentTypeLabel('itv')).toContain('ITV')
    })

    it('debería retornar label para seguro_rc', () => {
      expect(getVehicleDocumentTypeLabel('seguro_rc')).toContain('Responsabilidad Civil')
    })

    it('debería retornar label para certificado_adr_vehiculo', () => {
      expect(getVehicleDocumentTypeLabel('certificado_adr_vehiculo')).toContain('ADR')
    })

    it('debería retornar el valor para tipo desconocido', () => {
      expect(getVehicleDocumentTypeLabel('unknown_type')).toBe('unknown_type')
    })
  })

  describe('getRequiredVehicleDocumentTypes', () => {
    it('debería retornar solo los 5 tipos obligatorios', () => {
      const required = getRequiredVehicleDocumentTypes()
      expect(required).toHaveLength(5)
      required.forEach(t => {
        expect(t).toHaveProperty('value')
        expect(t).toHaveProperty('label')
      })
    })

    it('no debería incluir certificado_adr_vehiculo', () => {
      const required = getRequiredVehicleDocumentTypes()
      expect(required.some(t => t.value === 'certificado_adr_vehiculo')).toBe(false)
    })
  })

  describe('isDocumentRequiredForSubcategory', () => {
    it('itv debería ser requerido para cualquier subcategoría', () => {
      expect(isDocumentRequiredForSubcategory('itv', 'gen-paletizada')).toBe(true)
      expect(isDocumentRequiredForSubcategory('itv', 'adr-clase-3')).toBe(true)
    })

    it('certificado_adr_vehiculo debería ser requerido para subcategorías ADR', () => {
      expect(isDocumentRequiredForSubcategory('certificado_adr_vehiculo', 'adr-clase-3')).toBe(true)
      expect(isDocumentRequiredForSubcategory('certificado_adr_vehiculo', 'adr-clase-1')).toBe(true)
    })

    it('certificado_adr_vehiculo NO debería ser requerido para subcategorías no ADR', () => {
      expect(isDocumentRequiredForSubcategory('certificado_adr_vehiculo', 'gen-paletizada')).toBe(
        false,
      )
      expect(isDocumentRequiredForSubcategory('certificado_adr_vehiculo', 'atp-congelados')).toBe(
        false,
      )
    })

    it('autorizacion_transporte_especial debería ser opcional siempre', () => {
      expect(
        isDocumentRequiredForSubcategory('autorizacion_transporte_especial', 'gen-paletizada'),
      ).toBe(false)
    })
  })
})
