import { describe, it, expect } from 'vitest'
import {
  TRANSPORT_DOCUMENT_TYPES,
  TRANSPORT_DOCUMENT_TYPE_VALUES,
  getTransportDocumentTypeLabel,
  getTransportDocumentTypeFields,
  getActiveTransportDocumentTypes,
  CMR_FIELD_MAPPING,
} from './transport-document-types.js'

describe('transport-document-types', () => {
  describe('TRANSPORT_DOCUMENT_TYPES', () => {
    it('debería estar congelado (inmutable)', () => {
      expect(() => {
        TRANSPORT_DOCUMENT_TYPES.CMR.value = 'modified'
      }).toThrow()
    })

    it('debería contener exactamente 6 tipos de documento', () => {
      const types = Object.keys(TRANSPORT_DOCUMENT_TYPES)
      expect(types).toHaveLength(6)
    })

    it('debería contener CMR', () => {
      expect(TRANSPORT_DOCUMENT_TYPES.CMR).toBeDefined()
      expect(TRANSPORT_DOCUMENT_TYPES.CMR.value).toBe('cmr')
      expect(TRANSPORT_DOCUMENT_TYPES.CMR.label).toContain('CMR')
      expect(TRANSPORT_DOCUMENT_TYPES.CMR.baseLegal).toContain('CMR')
    })

    it('debería contener Albarán', () => {
      expect(TRANSPORT_DOCUMENT_TYPES.ALBARAN).toBeDefined()
      expect(TRANSPORT_DOCUMENT_TYPES.ALBARAN.value).toBe('albaran')
      expect(TRANSPORT_DOCUMENT_TYPES.ALBARAN.label).toContain('Albarán')
    })

    it('debería contener Hoja de Ruta', () => {
      expect(TRANSPORT_DOCUMENT_TYPES.HOJA_RUTA).toBeDefined()
      expect(TRANSPORT_DOCUMENT_TYPES.HOJA_RUTA.value).toBe('hoja_ruta')
      expect(TRANSPORT_DOCUMENT_TYPES.HOJA_RUTA.label).toContain('Hoja de Ruta')
    })

    it('debería contener Factura', () => {
      expect(TRANSPORT_DOCUMENT_TYPES.FACTURA).toBeDefined()
      expect(TRANSPORT_DOCUMENT_TYPES.FACTURA.value).toBe('factura')
      expect(TRANSPORT_DOCUMENT_TYPES.FACTURA.baseLegal).toContain('RD 1619/2012')
    })

    it('debería contener POD', () => {
      expect(TRANSPORT_DOCUMENT_TYPES.POD).toBeDefined()
      expect(TRANSPORT_DOCUMENT_TYPES.POD.value).toBe('pod')
      expect(TRANSPORT_DOCUMENT_TYPES.POD.label).toContain('Certificado de Entrega')
    })

    it('debería contener ADR', () => {
      expect(TRANSPORT_DOCUMENT_TYPES.ADR).toBeDefined()
      expect(TRANSPORT_DOCUMENT_TYPES.ADR.value).toBe('adr')
      expect(TRANSPORT_DOCUMENT_TYPES.ADR.baseLegal).toContain('ADR')
    })

    it('debería tener icono Material Design en cada tipo', () => {
      Object.values(TRANSPORT_DOCUMENT_TYPES).forEach(type => {
        expect(type.icon).toMatch(/^mdi-/)
      })
    })

    it('debería tener campo fields con al menos 3 campos por tipo', () => {
      Object.values(TRANSPORT_DOCUMENT_TYPES).forEach(type => {
        expect(Array.isArray(type.fields)).toBe(true)
        expect(type.fields.length).toBeGreaterThanOrEqual(3)
      })
    })
  })

  describe('TRANSPORT_DOCUMENT_TYPE_VALUES', () => {
    it('debería ser un array congelado', () => {
      expect(() => {
        TRANSPORT_DOCUMENT_TYPE_VALUES.push('new')
      }).toThrow()
    })

    it('debería contener los 6 valores de tipo', () => {
      expect(TRANSPORT_DOCUMENT_TYPE_VALUES).toEqual(
        expect.arrayContaining(['cmr', 'albaran', 'hoja_ruta', 'factura', 'pod', 'adr']),
      )
      expect(TRANSPORT_DOCUMENT_TYPE_VALUES).toHaveLength(6)
    })
  })

  describe('getTransportDocumentTypeLabel', () => {
    it('debería devolver la etiqueta para un tipo válido', () => {
      expect(getTransportDocumentTypeLabel('cmr')).toContain('CMR')
    })

    it('debería devolver el valor si el tipo no existe', () => {
      expect(getTransportDocumentTypeLabel('unknown')).toBe('unknown')
    })

    it('debería devolver el valor para null/undefined', () => {
      expect(getTransportDocumentTypeLabel(null)).toBe(null)
    })
  })

  describe('getTransportDocumentTypeFields', () => {
    it('debería devolver campos para CMR', () => {
      const fields = getTransportDocumentTypeFields('cmr')
      expect(fields.length).toBeGreaterThan(0)
    })

    it('debería devolver array vacío para tipo desconocido', () => {
      expect(getTransportDocumentTypeFields('unknown')).toEqual([])
    })
  })

  describe('getActiveTransportDocumentTypes', () => {
    it('debería devolver tipos activos como array de objetos {value, label}', () => {
      const active = getActiveTransportDocumentTypes()
      expect(active.length).toBe(6)
      active.forEach(t => {
        expect(t).toHaveProperty('value')
        expect(t).toHaveProperty('label')
      })
    })
  })

  describe('CMR_FIELD_MAPPING', () => {
    it('debería mapear campos CMR a fuentes de datos', () => {
      expect(CMR_FIELD_MAPPING).toBeDefined()
      expect(typeof CMR_FIELD_MAPPING).toBe('object')
    })

    it('debería tener campo sender que mapea a company_settings', () => {
      expect(CMR_FIELD_MAPPING.sender).toBeDefined()
      expect(CMR_FIELD_MAPPING.sender.source).toBe('company_settings')
    })

    it('debería tener campo recipient que mapea a cargo_records', () => {
      expect(CMR_FIELD_MAPPING.recipient).toBeDefined()
      expect(CMR_FIELD_MAPPING.recipient.source).toBe('cargo_records')
    })

    it('debería tener campo vehicle que mapea a vehicles', () => {
      expect(CMR_FIELD_MAPPING.vehicle).toBeDefined()
      expect(CMR_FIELD_MAPPING.vehicle.source).toBe('vehicles')
    })

    it('debería tener campo driver que mapea a drivers', () => {
      expect(CMR_FIELD_MAPPING.driver).toBeDefined()
      expect(CMR_FIELD_MAPPING.driver.source).toBe('drivers')
    })
  })
})
