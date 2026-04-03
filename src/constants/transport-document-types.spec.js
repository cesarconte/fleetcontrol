import { describe, it, expect } from 'vitest'
import {
  TRANSPORT_DOCUMENT_TYPES,
  TRANSPORT_DOCUMENT_TYPE_VALUES,
  getTransportDocumentTypeLabel,
  getTransportDocumentTypeFields,
  getActiveTransportDocumentTypes,
  getCopiesRequired,
  getCartaPorteNacionalSections,
  CMR_FIELD_MAPPING,
} from './transport-document-types.js'

describe('transport-document-types', () => {
  describe('TRANSPORT_DOCUMENT_TYPES', () => {
    it('debería estar congelado (inmutable)', () => {
      expect(() => {
        TRANSPORT_DOCUMENT_TYPES.CMR.value = 'modified'
      }).toThrow()
    })

    it('debería contener exactamente 7 tipos de documento', () => {
      const types = Object.keys(TRANSPORT_DOCUMENT_TYPES)
      expect(types).toHaveLength(7)
    })

    it('debería contener Carta de Porte Nacional', () => {
      expect(TRANSPORT_DOCUMENT_TYPES.CARTA_PORTE_NACIONAL).toBeDefined()
      expect(TRANSPORT_DOCUMENT_TYPES.CARTA_PORTE_NACIONAL.value).toBe('carta_porte_nacional')
      expect(TRANSPORT_DOCUMENT_TYPES.CARTA_PORTE_NACIONAL.label).toContain(
        'Carta de Porte Nacional',
      )
      expect(TRANSPORT_DOCUMENT_TYPES.CARTA_PORTE_NACIONAL.baseLegal).toContain('Ley 15/2009')
    })

    it('Carta de Porte Nacional debería tener 10 secciones', () => {
      const sections = TRANSPORT_DOCUMENT_TYPES.CARTA_PORTE_NACIONAL.sections
      expect(Object.keys(sections)).toHaveLength(10)
    })

    it('Carta de Porte Nacional debería tener 40+ campos', () => {
      const fields = TRANSPORT_DOCUMENT_TYPES.CARTA_PORTE_NACIONAL.fields
      expect(fields.length).toBeGreaterThanOrEqual(40)
    })

    it('Carta de Porte Nacional debería requerir 3 copias', () => {
      expect(TRANSPORT_DOCUMENT_TYPES.CARTA_PORTE_NACIONAL.copiesRequired).toBe(3)
    })

    it('debería contener CMR', () => {
      expect(TRANSPORT_DOCUMENT_TYPES.CMR).toBeDefined()
      expect(TRANSPORT_DOCUMENT_TYPES.CMR.value).toBe('cmr')
      expect(TRANSPORT_DOCUMENT_TYPES.CMR.label).toContain('CMR')
    })

    it('CMR debería tener 25+ campos', () => {
      expect(TRANSPORT_DOCUMENT_TYPES.CMR.fields.length).toBeGreaterThanOrEqual(25)
    })

    it('debería contener Albarán', () => {
      expect(TRANSPORT_DOCUMENT_TYPES.ALBARAN).toBeDefined()
      expect(TRANSPORT_DOCUMENT_TYPES.ALBARAN.value).toBe('albaran')
    })

    it('debería contener Hoja de Ruta', () => {
      expect(TRANSPORT_DOCUMENT_TYPES.HOJA_RUTA).toBeDefined()
      expect(TRANSPORT_DOCUMENT_TYPES.HOJA_RUTA.value).toBe('hoja_ruta')
    })

    it('debería contener Factura', () => {
      expect(TRANSPORT_DOCUMENT_TYPES.FACTURA).toBeDefined()
      expect(TRANSPORT_DOCUMENT_TYPES.FACTURA.value).toBe('factura')
    })

    it('debería contener POD', () => {
      expect(TRANSPORT_DOCUMENT_TYPES.POD).toBeDefined()
      expect(TRANSPORT_DOCUMENT_TYPES.POD.value).toBe('pod')
    })

    it('debería contener ADR', () => {
      expect(TRANSPORT_DOCUMENT_TYPES.ADR).toBeDefined()
      expect(TRANSPORT_DOCUMENT_TYPES.ADR.value).toBe('adr')
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

    it('debería contener los 7 valores de tipo', () => {
      expect(TRANSPORT_DOCUMENT_TYPE_VALUES).toEqual(
        expect.arrayContaining([
          'carta_porte_nacional',
          'cmr',
          'albaran',
          'hoja_ruta',
          'factura',
          'pod',
          'adr',
        ]),
      )
      expect(TRANSPORT_DOCUMENT_TYPE_VALUES).toHaveLength(7)
    })
  })

  describe('getTransportDocumentTypeLabel', () => {
    it('debería devolver la etiqueta para Carta de Porte Nacional', () => {
      expect(getTransportDocumentTypeLabel('carta_porte_nacional')).toContain(
        'Carta de Porte Nacional',
      )
    })

    it('debería devolver la etiqueta para CMR', () => {
      expect(getTransportDocumentTypeLabel('cmr')).toContain('CMR')
    })

    it('debería devolver el valor si el tipo no existe', () => {
      expect(getTransportDocumentTypeLabel('unknown')).toBe('unknown')
    })
  })

  describe('getTransportDocumentTypeFields', () => {
    it('debería devolver campos para Carta de Porte Nacional', () => {
      const fields = getTransportDocumentTypeFields('carta_porte_nacional')
      expect(fields.length).toBeGreaterThanOrEqual(40)
    })

    it('debería devolver campos para CMR', () => {
      const fields = getTransportDocumentTypeFields('cmr')
      expect(fields.length).toBeGreaterThanOrEqual(25)
    })

    it('debería devolver array vacío para tipo desconocido', () => {
      expect(getTransportDocumentTypeFields('unknown')).toEqual([])
    })
  })

  describe('getActiveTransportDocumentTypes', () => {
    it('debería devolver 7 tipos como array de objetos {value, label}', () => {
      const active = getActiveTransportDocumentTypes()
      expect(active.length).toBe(7)
      active.forEach(t => {
        expect(t).toHaveProperty('value')
        expect(t).toHaveProperty('label')
      })
    })
  })

  describe('getCopiesRequired', () => {
    it('debería devolver 3 copias para Carta de Porte Nacional', () => {
      expect(getCopiesRequired('carta_porte_nacional')).toBe(3)
    })

    it('debería devolver 3 copias para CMR', () => {
      expect(getCopiesRequired('cmr')).toBe(3)
    })

    it('debería devolver 1 para tipos sin copias definidas', () => {
      expect(getCopiesRequired('albaran')).toBe(1)
    })
  })

  describe('getCartaPorteNacionalSections', () => {
    it('debería devolver las 10 secciones obligatorias', () => {
      const sections = getCartaPorteNacionalSections()
      expect(Object.keys(sections)).toHaveLength(10)
    })

    it('debería incluir sección de identificación', () => {
      const sections = getCartaPorteNacionalSections()
      expect(sections.identificacion).toBeDefined()
    })

    it('debería incluir sección de firmas', () => {
      const sections = getCartaPorteNacionalSections()
      expect(sections.firmas).toBeDefined()
    })
  })

  describe('CMR_FIELD_MAPPING', () => {
    it('debería mapear campos CMR a fuentes de datos', () => {
      expect(CMR_FIELD_MAPPING).toBeDefined()
      expect(typeof CMR_FIELD_MAPPING).toBe('object')
    })

    it('debería tener campo sender que mapea a company_settings', () => {
      expect(CMR_FIELD_MAPPING.sender.source).toBe('company_settings')
    })

    it('debería tener campo vehicle que mapea a vehicles', () => {
      expect(CMR_FIELD_MAPPING.vehicle.source).toBe('vehicles')
    })

    it('debería tener campo driver que mapea a drivers', () => {
      expect(CMR_FIELD_MAPPING.driver.source).toBe('drivers')
    })
  })
})
