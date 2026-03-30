import { describe, it, expect } from 'vitest'
import { maintenanceSchema, maintenanceSearchSchema } from './maintenance-schema.js'

describe('maintenanceSchema', () => {
  const validMaintenance = {
    vehicle_id: '550e8400-e29b-41d4-a716-446655440000',
    descripcion: 'Cambio de aceite y filtros',
    tipo: 'preventivo',
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

    it('debería requerir descripción', () => {
      const result = maintenanceSchema.safeParse({ ...validMaintenance, descripcion: '' })
      expect(result.success).toBe(false)
    })

    it('debería rechazar descripción corta', () => {
      const result = maintenanceSchema.safeParse({ ...validMaintenance, descripcion: 'AB' })
      expect(result.success).toBe(false)
    })
  })

  describe('tipo', () => {
    it('debería aceptar preventivo', () => {
      const result = maintenanceSchema.safeParse({ ...validMaintenance, tipo: 'preventivo' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar correctivo', () => {
      const result = maintenanceSchema.safeParse({ ...validMaintenance, tipo: 'correctivo' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar tipo inválido', () => {
      const result = maintenanceSchema.safeParse({ ...validMaintenance, tipo: 'unknown' })
      expect(result.success).toBe(false)
    })

    it('debería usar preventivo por defecto', () => {
      const result = maintenanceSchema.safeParse(validMaintenance)
      expect(result.success).toBe(true)
      expect(result.data.tipo).toBe('preventivo')
    })
  })

  describe('status', () => {
    it('debería aceptar pendiente', () => {
      const result = maintenanceSchema.safeParse({ ...validMaintenance, status: 'pendiente' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar en_curso', () => {
      const result = maintenanceSchema.safeParse({ ...validMaintenance, status: 'en_curso' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar completada', () => {
      const result = maintenanceSchema.safeParse({ ...validMaintenance, status: 'completada' })
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
        coste_total_eur: 250.5,
        coste_recambios_eur: 120.0,
      })
      expect(result.success).toBe(true)
    })

    it('debería rechazar coste negativo', () => {
      const result = maintenanceSchema.safeParse({ ...validMaintenance, coste_total_eur: -10 })
      expect(result.success).toBe(false)
    })
  })

  describe('campos completos', () => {
    it('debería aceptar mantenimiento completo', () => {
      const result = maintenanceSchema.safeParse({
        ...validMaintenance,
        status: 'completada',
        fecha_programada: '2026-04-01',
        fecha_fin: '2026-04-02',
        km_al_momento: 120000,
        diagnostico: 'Desgaste normal de filtros',
        intervencion_realizada: 'Cambio de aceite 15W40 + filtro aceite + filtro aire',
        recambios: 'Filtro aceite Mann W7309, Filtro aire C30168',
        coste_recambios_eur: 85.5,
        taller_nombre: 'Talleres Martínez',
        taller_responsable: 'Antonio López',
        inmovilizacion_horas: 4,
        coste_total_eur: 245.5,
        observations: 'Próxima revisión a 160.000 km',
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
      tipo: 'preventivo',
      status: 'pendiente',
      vehicle_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })
})
