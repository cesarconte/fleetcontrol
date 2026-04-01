import { describe, it, expect } from 'vitest'
import { alertDismissSchema, alertFilterSchema } from './alert-schema.js'

describe('alert-schema', () => {
  describe('alertDismissSchema', () => {
    const validDismiss = {
      justification: 'Alerta duplicada, ya gestionada',
    }

    it('debería aceptar una justificación válida', () => {
      const result = alertDismissSchema.safeParse(validDismiss)
      expect(result.success).toBe(true)
    })

    it('debería rechazar justificación vacía', () => {
      const result = alertDismissSchema.safeParse({ justification: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('justification')
      }
    })

    it('debería rechazar justificación ausente', () => {
      const result = alertDismissSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('debería rechazar justificación mayor a 500 caracteres', () => {
      const result = alertDismissSchema.safeParse({ justification: 'a'.repeat(501) })
      expect(result.success).toBe(false)
    })

    it('debería aceptar justificación de 500 caracteres justo', () => {
      const result = alertDismissSchema.safeParse({ justification: 'a'.repeat(500) })
      expect(result.success).toBe(true)
    })

    it('debería aceptar justificación de 1 carácter', () => {
      const result = alertDismissSchema.safeParse({ justification: 'x' })
      expect(result.success).toBe(true)
    })
  })

  describe('alertFilterSchema', () => {
    it('debería aceptar objeto vacío (todos los filtros son opcionales)', () => {
      const result = alertFilterSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('debería aceptar filtro por alert_type válido', () => {
      const result = alertFilterSchema.safeParse({ alert_type: 'vehicle_doc_expired' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar alert_type inválido', () => {
      const result = alertFilterSchema.safeParse({ alert_type: 'invalid_type' })
      expect(result.success).toBe(false)
    })

    it('debería aceptar filtro por severity válido', () => {
      const result = alertFilterSchema.safeParse({ severity: 'critical' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar severity inválido', () => {
      const result = alertFilterSchema.safeParse({ severity: 'urgent' })
      expect(result.success).toBe(false)
    })

    it('debería aceptar filtro por is_read boolean', () => {
      const result = alertFilterSchema.safeParse({ is_read: true })
      expect(result.success).toBe(true)
    })

    it('debería aceptar filtro por is_dismissed boolean', () => {
      const result = alertFilterSchema.safeParse({ is_dismissed: false })
      expect(result.success).toBe(true)
    })

    it('debería aceptar filtro por vehicle_id UUID', () => {
      const result = alertFilterSchema.safeParse({
        vehicle_id: '550e8400-e29b-41d4-a716-446655440000',
      })
      expect(result.success).toBe(true)
    })

    it('debería rechazar vehicle_id no UUID', () => {
      const result = alertFilterSchema.safeParse({ vehicle_id: 'not-a-uuid' })
      expect(result.success).toBe(false)
    })

    it('debería aceptar filtro por driver_id UUID', () => {
      const result = alertFilterSchema.safeParse({
        driver_id: '550e8400-e29b-41d4-a716-446655440000',
      })
      expect(result.success).toBe(true)
    })

    it('debería aceptar filtro por date_from string', () => {
      const result = alertFilterSchema.safeParse({ date_from: '2026-03-01' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar filtro por date_to string', () => {
      const result = alertFilterSchema.safeParse({ date_to: '2026-03-31' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar todos los filtros combinados', () => {
      const result = alertFilterSchema.safeParse({
        alert_type: 'driving_limit',
        severity: 'critical',
        is_read: false,
        is_dismissed: false,
        vehicle_id: '550e8400-e29b-41d4-a716-446655440000',
        driver_id: '550e8400-e29b-41d4-a716-446655440001',
        date_from: '2026-01-01',
        date_to: '2026-12-31',
      })
      expect(result.success).toBe(true)
    })
  })
})
