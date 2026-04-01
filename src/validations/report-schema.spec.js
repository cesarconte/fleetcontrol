import { describe, it, expect } from 'vitest'
import { reportFilterSchema } from './report-schema.js'

describe('report-schema', () => {
  describe('reportFilterSchema', () => {
    it('debería aceptar objeto vacío (todos opcionales)', () => {
      expect(reportFilterSchema.safeParse({}).success).toBe(true)
    })

    it('debería aceptar todos los tipos de informe', () => {
      const types = [
        'dashboard',
        'flota',
        'conductores',
        'rutas',
        'combustible',
        'mantenimiento',
        'cumplimiento',
        'tacografos',
        'cargas',
        'economico',
      ]
      types.forEach(t => {
        expect(reportFilterSchema.safeParse({ report_type: t }).success).toBe(true)
      })
    })

    it('debería rechazar tipo inválido', () => {
      expect(reportFilterSchema.safeParse({ report_type: 'invalid' }).success).toBe(false)
    })

    it('debería aceptar date_from y date_to', () => {
      const result = reportFilterSchema.safeParse({
        date_from: '2026-01-01',
        date_to: '2026-03-31',
      })
      expect(result.success).toBe(true)
    })

    it('debería aceptar period predefinido', () => {
      const result = reportFilterSchema.safeParse({ period: 'este_mes' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar todos los campos combinados', () => {
      const result = reportFilterSchema.safeParse({
        report_type: 'economico',
        period: 'este_trimestre',
        date_from: '2026-01-01',
        date_to: '2026-03-31',
        vehicle_id: '550e8400-e29b-41d4-a716-446655440000',
      })
      expect(result.success).toBe(true)
    })
  })
})
