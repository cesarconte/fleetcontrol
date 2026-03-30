import { describe, it, expect } from 'vitest'
import {
  DRIVER_DOCUMENT_TYPES,
  DRIVER_DOCUMENT_TYPE_VALUES,
  getDriverDocumentTypeLabel,
  CLASES_CARNET,
} from './driver-document-types.js'

describe('DRIVER_DOCUMENT_TYPES', () => {
  it('debería estar congelado', () => {
    expect(Object.isFrozen(DRIVER_DOCUMENT_TYPES)).toBe(true)
  })

  it('debería tener 7 tipos de documento', () => {
    expect(Object.keys(DRIVER_DOCUMENT_TYPES)).toHaveLength(7)
  })

  it('cada tipo debería tener value y label', () => {
    for (const tipo of Object.values(DRIVER_DOCUMENT_TYPES)) {
      expect(tipo).toHaveProperty('value')
      expect(tipo).toHaveProperty('label')
      expect(typeof tipo.value).toBe('string')
      expect(typeof tipo.label).toBe('string')
    }
  })
})

describe('DRIVER_DOCUMENT_TYPE_VALUES', () => {
  it('debería ser un array de strings', () => {
    expect(Array.isArray(DRIVER_DOCUMENT_TYPE_VALUES)).toBe(true)
    DRIVER_DOCUMENT_TYPE_VALUES.forEach(v => expect(typeof v).toBe('string'))
  })

  it('debería estar congelado', () => {
    expect(Object.isFrozen(DRIVER_DOCUMENT_TYPE_VALUES)).toBe(true)
  })

  it('debería contener todos los values de DRIVER_DOCUMENT_TYPES', () => {
    const expected = Object.values(DRIVER_DOCUMENT_TYPES).map(t => t.value)
    expect(DRIVER_DOCUMENT_TYPE_VALUES).toEqual(expect.arrayContaining(expected))
  })
})

describe('getDriverDocumentTypeLabel', () => {
  it('debería retornar el label para un value válido', () => {
    expect(getDriverDocumentTypeLabel('carnet_conducir')).toBe('Carnet de conducir')
    expect(getDriverDocumentTypeLabel('cap')).toBe('CAP — Certificado de Aptitud Profesional')
  })

  it('debería retornar el propio value si no existe', () => {
    expect(getDriverDocumentTypeLabel('desconocido')).toBe('desconocido')
  })
})

describe('CLASES_CARNET', () => {
  it('debería estar congelado', () => {
    expect(Object.isFrozen(CLASES_CARNET)).toBe(true)
  })

  it('debería incluir las clases principales de transporte', () => {
    expect(CLASES_CARNET).toContain('B')
    expect(CLASES_CARNET).toContain('C')
    expect(CLASES_CARNET).toContain('C+E')
    expect(CLASES_CARNET).toContain('D')
    expect(CLASES_CARNET).toContain('D+E')
  })

  it('debería tener 9 clases', () => {
    expect(CLASES_CARNET).toHaveLength(9)
  })
})
