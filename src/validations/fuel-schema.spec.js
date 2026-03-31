import { describe, it, expect } from 'vitest'
import { fuelSchema, fuelSearchSchema } from './fuel-schema.js'

describe('fuelSchema', () => {
  const validFuel = {
    vehicle_id: '550e8400-e29b-41d4-a716-446655440000',
    refuel_date: '2026-03-15',
    odometer_km: 120000,
    quantity: 150,
    unit_price: 1.45,
  }

  describe('campos obligatorios', () => {
    it('debería aceptar repostaje con mínimos', () => {
      const result = fuelSchema.safeParse(validFuel)
      expect(result.success).toBe(true)
    })

    it('debería requerir vehicle_id', () => {
      const result = fuelSchema.safeParse({ ...validFuel, vehicle_id: '' })
      expect(result.success).toBe(false)
    })

    it('debería requerir refuel_date', () => {
      const result = fuelSchema.safeParse({ ...validFuel, refuel_date: '' })
      expect(result.success).toBe(false)
    })

    it('debería requerir kilometraje', () => {
      const result = fuelSchema.safeParse({ ...validFuel, odometer_km: null })
      expect(result.success).toBe(false)
    })

    it('debería requerir litros', () => {
      const result = fuelSchema.safeParse({ ...validFuel, quantity: null })
      expect(result.success).toBe(false)
    })

    it('debería requerir precio por litro', () => {
      const result = fuelSchema.safeParse({ ...validFuel, unit_price: null })
      expect(result.success).toBe(false)
    })
  })

  describe('valores positivos', () => {
    it('debería rechazar litros negativos', () => {
      const result = fuelSchema.safeParse({ ...validFuel, quantity: -10 })
      expect(result.success).toBe(false)
    })

    it('debería rechazar precio negativo', () => {
      const result = fuelSchema.safeParse({ ...validFuel, unit_price: -1 })
      expect(result.success).toBe(false)
    })

    it('debería rechazar kilometraje negativo', () => {
      const result = fuelSchema.safeParse({ ...validFuel, odometer_km: -100 })
      expect(result.success).toBe(false)
    })
  })

  describe('campos opcionales', () => {
    it('debería aceptar total_eur', () => {
      const result = fuelSchema.safeParse({ ...validFuel, total_eur: 217.5 })
      expect(result.success).toBe(true)
    })

    it('debería aceptar station_name', () => {
      const result = fuelSchema.safeParse({ ...validFuel, station_name: 'Repsol A-1 km 45' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar repostaje completo', () => {
      const result = fuelSchema.safeParse({
        ...validFuel,
        total_eur: 217.5,
        station_name: 'Repsol A-1',
        route_id: '550e8400-e29b-41d4-a716-446655440001',
      })
      expect(result.success).toBe(true)
    })
  })
})

describe('fuelSearchSchema', () => {
  it('debería aceptar objeto vacío', () => {
    const result = fuelSearchSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})
