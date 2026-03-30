import { describe, it, expect } from 'vitest'
import { routeSchema, routeSearchSchema } from './route-schema.js'

describe('routeSchema', () => {
  const validRoute = {
    fecha_salida: '2026-04-01',
    origen_municipio: 'Madrid',
    destino_municipio: 'Barcelona',
    vehicle_id: '550e8400-e29b-41d4-a716-446655440000',
    driver_id: '550e8400-e29b-41d4-a716-446655440001',
  }

  describe('campos obligatorios', () => {
    it('debería aceptar ruta válida con mínimos', () => {
      const result = routeSchema.safeParse(validRoute)
      expect(result.success).toBe(true)
    })

    it('debería requerir fecha de salida', () => {
      const result = routeSchema.safeParse({ ...validRoute, fecha_salida: '' })
      expect(result.success).toBe(false)
    })

    it('debería requerir origen', () => {
      const result = routeSchema.safeParse({ ...validRoute, origen_municipio: '' })
      expect(result.success).toBe(false)
    })

    it('debería requerir destino', () => {
      const result = routeSchema.safeParse({ ...validRoute, destino_municipio: '' })
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

  describe('peso_carga_kg', () => {
    it('debería aceptar peso válido', () => {
      const result = routeSchema.safeParse({ ...validRoute, peso_carga_kg: 15000 })
      expect(result.success).toBe(true)
    })

    it('debería rechazar peso negativo', () => {
      const result = routeSchema.safeParse({ ...validRoute, peso_carga_kg: -100 })
      expect(result.success).toBe(false)
    })

    it('debería aceptar null', () => {
      const result = routeSchema.safeParse({ ...validRoute, peso_carga_kg: null })
      expect(result.success).toBe(true)
    })
  })

  describe('status', () => {
    it('debería aceptar planificada', () => {
      const result = routeSchema.safeParse({ ...validRoute, status: 'planificada' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar en_curso', () => {
      const result = routeSchema.safeParse({ ...validRoute, status: 'en_curso' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar completada', () => {
      const result = routeSchema.safeParse({ ...validRoute, status: 'completada' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar retrasada', () => {
      const result = routeSchema.safeParse({ ...validRoute, status: 'retrasada' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar cancelada', () => {
      const result = routeSchema.safeParse({ ...validRoute, status: 'cancelada' })
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
      expect(result.data.status).toBe('planificada')
    })
  })

  describe('tipo_carga', () => {
    it('debería aceptar general', () => {
      const result = routeSchema.safeParse({ ...validRoute, tipo_carga: 'general' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar peligrosa', () => {
      const result = routeSchema.safeParse({ ...validRoute, tipo_carga: 'peligrosa' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar tipo inválido', () => {
      const result = routeSchema.safeParse({ ...validRoute, tipo_carga: 'invalid' })
      expect(result.success).toBe(false)
    })

    it('debería rechazar dangerous (nombre antiguo)', () => {
      const result = routeSchema.safeParse({ ...validRoute, tipo_carga: 'dangerous' })
      expect(result.success).toBe(false)
    })
  })

  describe('costes', () => {
    it('debería aceptar costes positivos', () => {
      const result = routeSchema.safeParse({
        ...validRoute,
        coste_combustible_eur: 150.5,
        coste_peajes_eur: 45.0,
        coste_total_eur: 195.5,
      })
      expect(result.success).toBe(true)
    })

    it('debería aceptar costes en 0', () => {
      const result = routeSchema.safeParse({ ...validRoute, coste_combustible_eur: 0 })
      expect(result.success).toBe(true)
    })

    it('debería rechazar costes negativos', () => {
      const result = routeSchema.safeParse({ ...validRoute, coste_combustible_eur: -10 })
      expect(result.success).toBe(false)
    })
  })

  describe('campos opcionales completos', () => {
    it('debería aceptar ruta con todos los campos', () => {
      const result = routeSchema.safeParse({
        ...validRoute,
        departure_time: '08:00',
        fecha_llegada_prevista: '2026-04-01',
        arrival_time: '16:00',
        origen_provincia: 'Madrid',
        destino_provincia: 'Barcelona',
        distancia_total_km: 620,
        distancia_recorrida_km: 635,
        duracion_prevista_min: 360,
        duracion_real_min: 390,
        descripcion_carga: 'Electrodomésticos',
        peso_carga_kg: 18000,
        volumen_carga_m3: 45,
        consumo_combustible_l: 120,
        coste_combustible_eur: 180,
        coste_peajes_eur: 50,
        coste_total_eur: 230,
        status: 'completada',
        retraso_minutos: 30,
        cmr_numero: 'CMR-2026-001',
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
      status: 'completada',
      driver_id: '550e8400-e29b-41d4-a716-446655440001',
      vehicle_id: '550e8400-e29b-41d4-a716-446655440000',
      date_from: '2026-03-01',
      date_to: '2026-03-31',
    })
    expect(result.success).toBe(true)
  })
})
