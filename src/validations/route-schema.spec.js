import { describe, it, expect } from 'vitest'
import { routeSchema, routeSearchSchema } from './route-schema.js'

describe('routeSchema', () => {
  const validRoute = {
    departure_date: '2026-04-01',
    origin_city: 'Madrid',
    destination_city: 'Barcelona',
    vehicle_id: '550e8400-e29b-41d4-a716-446655440000',
    driver_id: '550e8400-e29b-41d4-a716-446655440001',
  }

  describe('campos obligatorios', () => {
    it('debería aceptar ruta válida con mínimos', () => {
      const result = routeSchema.safeParse(validRoute)
      expect(result.success).toBe(true)
    })

    it('debería requerir fecha de salida', () => {
      const result = routeSchema.safeParse({ ...validRoute, departure_date: '' })
      expect(result.success).toBe(false)
    })

    it('debería requerir origen', () => {
      const result = routeSchema.safeParse({ ...validRoute, origin_city: '' })
      expect(result.success).toBe(false)
    })

    it('debería requerir destino', () => {
      const result = routeSchema.safeParse({ ...validRoute, destination_city: '' })
      expect(result.success).toBe(false)
    })

    it('debería requerir vehicle_id', () => {
      const result = routeSchema.safeParse({ ...validRoute, vehicle_id: '' })
      expect(result.success).toBe(false)
    })

    it('debería requerir driver_id', () => {
      const result = routeSchema.safeParse({ ...validRoute, driver_id: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('vehicle_id y driver_id', () => {
    it('debería rechazar UUID inválido para vehículo', () => {
      const result = routeSchema.safeParse({ ...validRoute, vehicle_id: 'no-uuid' })
      expect(result.success).toBe(false)
    })

    it('debería rechazar UUID inválido para conductor', () => {
      const result = routeSchema.safeParse({ ...validRoute, driver_id: 'no-uuid' })
      expect(result.success).toBe(false)
    })
  })

  describe('cargo_weight_kg', () => {
    it('debería aceptar peso válido', () => {
      const result = routeSchema.safeParse({ ...validRoute, cargo_weight_kg: 15000 })
      expect(result.success).toBe(true)
    })

    it('debería rechazar peso negativo', () => {
      const result = routeSchema.safeParse({ ...validRoute, cargo_weight_kg: -100 })
      expect(result.success).toBe(false)
    })

    it('debería aceptar null', () => {
      const result = routeSchema.safeParse({ ...validRoute, cargo_weight_kg: null })
      expect(result.success).toBe(true)
    })
  })

  describe('status', () => {
    it('debería aceptar planned', () => {
      const result = routeSchema.safeParse({ ...validRoute, status: 'planned' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar in_progress', () => {
      const result = routeSchema.safeParse({ ...validRoute, status: 'in_progress' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar completed', () => {
      const result = routeSchema.safeParse({ ...validRoute, status: 'completed' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar delayed', () => {
      const result = routeSchema.safeParse({ ...validRoute, status: 'delayed' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar cancelled', () => {
      const result = routeSchema.safeParse({ ...validRoute, status: 'cancelled' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar estado inválido', () => {
      const result = routeSchema.safeParse({ ...validRoute, status: 'unknown' })
      expect(result.success).toBe(false)
    })

    it('debería rechazar incident (no existe en DB)', () => {
      const result = routeSchema.safeParse({ ...validRoute, status: 'incident' })
      expect(result.success).toBe(false)
    })

    it('debería usar planificada por defecto', () => {
      const result = routeSchema.safeParse(validRoute)
      expect(result.success).toBe(true)
      expect(result.data.status).toBe('planned')
    })
  })

  describe('costes', () => {
    it('debería aceptar costes positivos', () => {
      const result = routeSchema.safeParse({
        ...validRoute,
        fuel_cost_eur: 150.5,
        toll_cost_eur: 45.0,
        total_cost_eur: 195.5,
      })
      expect(result.success).toBe(true)
    })

    it('debería aceptar costes en 0', () => {
      const result = routeSchema.safeParse({ ...validRoute, fuel_cost_eur: 0 })
      expect(result.success).toBe(true)
    })

    it('debería rechazar costes negativos', () => {
      const result = routeSchema.safeParse({ ...validRoute, fuel_cost_eur: -10 })
      expect(result.success).toBe(false)
    })
  })

  describe('campos opcionales completos', () => {
    it('debería aceptar ruta con todos los campos', () => {
      const result = routeSchema.safeParse({
        ...validRoute,
        departure_time: '08:00',
        planned_arrival: '2026-04-01',
        arrival_time: '16:00',
        origin_province: 'Madrid',
        destination_province: 'Barcelona',
        planned_distance_km: 620,
        actual_distance_km: 635,
        planned_duration_min: 360,
        actual_duration_min: 390,
        cargo_description: 'Electrodomésticos',
        cargo_weight_kg: 18000,
        cargo_volume_m3: 45,
        fuel_consumed_liters: 120,
        fuel_cost_eur: 180,
        toll_cost_eur: 50,
        total_cost_eur: 230,
        status: 'completed',
        delay_minutes: 30,
        linked_document_ref: 'CMR-2026-001',
      })
      expect(result.success).toBe(true)
    })
  })
})

describe('routeSearchSchema', () => {
  it('debería aceptar objeto vacío', () => {
    const result = routeSearchSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('debería aceptar todos los filtros', () => {
    const result = routeSearchSchema.safeParse({
      search: 'Madrid',
      origin_city: 'Madrid',
      destination_city: 'Barcelona',
      status: 'completed',
      driver_id: '550e8400-e29b-41d4-a716-446655440001',
      vehicle_id: '550e8400-e29b-41d4-a716-446655440000',
      date_from: '2026-03-01',
      date_to: '2026-03-31',
    })
    expect(result.success).toBe(true)
  })
})
