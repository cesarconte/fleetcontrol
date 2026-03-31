import { describe, it, expect } from 'vitest'
import { vehicleDocumentSchema, vehicleDocumentUpdateSchema } from './vehicle-document-schema.js'

const validDoc = {
  vehicle_id: '550e8400-e29b-41d4-a716-446655440000',
  doc_type: 'itv',
  alert_days_before: 30,
}

describe('vehicleDocumentSchema', () => {
  describe('campos obligatorios', () => {
    it('debería aceptar documento con mínimos', () => {
      const result = vehicleDocumentSchema.safeParse(validDoc)
      expect(result.success).toBe(true)
    })

    it('debería requerir vehicle_id', () => {
      const result = vehicleDocumentSchema.safeParse({ ...validDoc, vehicle_id: '' })
      expect(result.success).toBe(false)
    })

    it('debería requerir doc_type', () => {
      const result = vehicleDocumentSchema.safeParse({ ...validDoc, doc_type: undefined })
      expect(result.success).toBe(false)
    })
  })

  describe('doc_type', () => {
    it('debería aceptar tipos válidos', () => {
      for (const tipo of ['itv', 'seguro_rc', 'tarjeta_transporte', 'calibracion_tacografo']) {
        const result = vehicleDocumentSchema.safeParse({ ...validDoc, doc_type: tipo })
        expect(result.success).toBe(true)
      }
    })

    it('debería rechazar tipo inválido', () => {
      const result = vehicleDocumentSchema.safeParse({ ...validDoc, doc_type: 'invalido' })
      expect(result.success).toBe(false)
    })
  })

  describe('alert_days_before', () => {
    it('debería aceptar valor válido', () => {
      const result = vehicleDocumentSchema.safeParse({ ...validDoc, alert_days_before: 15 })
      expect(result.success).toBe(true)
    })

    it('debería rechazar 0', () => {
      const result = vehicleDocumentSchema.safeParse({ ...validDoc, alert_days_before: 0 })
      expect(result.success).toBe(false)
    })

    it('debería rechazar más de 365', () => {
      const result = vehicleDocumentSchema.safeParse({ ...validDoc, alert_days_before: 366 })
      expect(result.success).toBe(false)
    })
  })

  describe('campos opcionales', () => {
    it('debería aceptar reference_number vacío', () => {
      const result = vehicleDocumentSchema.safeParse({ ...validDoc, reference_number: '' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar fechas vacías', () => {
      const result = vehicleDocumentSchema.safeParse({
        ...validDoc,
        issue_date: '',
        expiry_date: '',
      })
      expect(result.success).toBe(true)
    })

    it('debería aceptar documento completo', () => {
      const result = vehicleDocumentSchema.safeParse({
        ...validDoc,
        reference_number: 'ITV-2026-001',
        issue_date: '2026-01-15',
        expiry_date: '2027-01-15',
        alert_days_before: 30,
        notes: 'Primera inspección',
      })
      expect(result.success).toBe(true)
    })
  })
})

describe('vehicleDocumentUpdateSchema', () => {
  it('debería aceptar actualización parcial', () => {
    const result = vehicleDocumentUpdateSchema.safeParse({ notes: 'Actualizado' })
    expect(result.success).toBe(true)
  })

  it('debería aceptar objeto vacío', () => {
    const result = vehicleDocumentUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})
