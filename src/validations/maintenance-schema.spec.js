import { describe, it, expect } from 'vitest'
import { maintenanceSchema, maintenanceSearchSchema } from './maintenance-schema.js'

describe('maintenanceSchema', () => {
  const validMaintenance = {
    vehicle_id: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Cambio de aceite y filtros',
    maintenance_type: 'preventive',
  }

  describe('campos obligatorios', () => {
    it('debería aceptar mantenimiento con mínimos', () => {
      const result = maintenanceSchema.safeParse(validMaintenance)
      expect(result.success).toBe(true)
    })

    it('debería requerir vehicle_id', () => {
      const result = maintenanceSchema.safeParse({ ...validMaintenance, vehicle_id: '' })
      expect(result.success).toBe(false)
    })

    it('debería requerir description', () => {
      const result = maintenanceSchema.safeParse({ ...validMaintenance, description: '' })
      expect(result.success).toBe(false)
    })

    it('debería rechazar description corta', () => {
      const result = maintenanceSchema.safeParse({ ...validMaintenance, description: 'AB' })
      expect(result.success).toBe(false)
    })
  })

  describe('maintenance_type', () => {
    it('debería aceptar preventive', () => {
      const result = maintenanceSchema.safeParse({
        ...validMaintenance,
        maintenance_type: 'preventive',
      })
      expect(result.success).toBe(true)
    })

    it('debería aceptar corrective', () => {
      const result = maintenanceSchema.safeParse({
        ...validMaintenance,
        maintenance_type: 'corrective',
      })
      expect(result.success).toBe(true)
    })

    it('debería rechazar maintenance_type inválido', () => {
      const result = maintenanceSchema.safeParse({
        ...validMaintenance,
        maintenance_type: 'unknown',
      })
      expect(result.success).toBe(false)
    })

    it('debería usar preventivo por defecto', () => {
      const result = maintenanceSchema.safeParse(validMaintenance)
      expect(result.success).toBe(true)
      expect(result.data.maintenance_type).toBe('preventive')
    })
  })

  describe('status', () => {
    it('debería aceptar pending', () => {
      const result = maintenanceSchema.safeParse({ ...validMaintenance, status: 'pending' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar in_progress', () => {
      const result = maintenanceSchema.safeParse({ ...validMaintenance, status: 'in_progress' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar completed', () => {
      const result = maintenanceSchema.safeParse({ ...validMaintenance, status: 'completed' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar estado inválido', () => {
      const result = maintenanceSchema.safeParse({ ...validMaintenance, status: 'unknown' })
      expect(result.success).toBe(false)
    })
  })

  describe('costes', () => {
    it('debería aceptar coste positivo', () => {
      const result = maintenanceSchema.safeParse({
        ...validMaintenance,
        cost_eur: 250.5,
      })
      expect(result.success).toBe(true)
    })

    it('debería rechazar coste negativo', () => {
      const result = maintenanceSchema.safeParse({ ...validMaintenance, cost_eur: -10 })
      expect(result.success).toBe(false)
    })
  })

  describe('campos completos', () => {
    it('debería aceptar mantenimiento completo', () => {
      const result = maintenanceSchema.safeParse({
        ...validMaintenance,
        status: 'completed',
        scheduled_date: '2026-04-01',
        actual_date: '2026-04-02',
        scheduled_km: 120000,
        diagnosis: 'Desgaste normal de filtros',
        intervention: 'Cambio de aceite 15W40 + filtro aceite + filtro aire',
        parts_used: 'Filtro aceite Mann W7309, Filtro aire C30168',
        workshop_name: 'Talleres Martínez',
        responsible_name: 'Antonio López',
        downtime_hours: 4,
        cost_eur: 245.5,
      })
      expect(result.success).toBe(true)
    })
  })
})

describe('maintenanceSearchSchema', () => {
  it('debería aceptar objeto vacío', () => {
    const result = maintenanceSearchSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('debería aceptar filtros', () => {
    const result = maintenanceSearchSchema.safeParse({
      search: 'aceite',
      maintenance_type: 'preventive',
      status: 'pending',
      vehicle_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })
})
