import { describe, it, expect } from 'vitest'
import { fuelSchema, fuelSearchSchema } from './fuel-schema.js'

describe('fuelSchema', () => {
  const validFuel = {
    vehicle_id: '550e8400-e29b-41d4-a716-446655440000',
    date: '2026-03-15',
    mileage_km: 120000,
    liters: 150,
    price_per_liter: 1.45,
    fuel_type: 'diesel',
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

    it('debería requerir fecha', () => {
      const result = fuelSchema.safeParse({ ...validFuel, date: '' })
      expect(result.success).toBe(false)
    })

    it('debería requerir kilometraje', () => {
      const result = fuelSchema.safeParse({ ...validFuel, mileage_km: null })
      expect(result.success).toBe(false)
    })

    it('debería requerir litros', () => {
      const result = fuelSchema.safeParse({ ...validFuel, liters: null })
      expect(result.success).toBe(false)
    })

    it('debería requerir precio por litro', () => {
      const result = fuelSchema.safeParse({ ...validFuel, price_per_liter: null })
      expect(result.success).toBe(false)
    })
  })

  describe('valores positivos', () => {
    it('debería rechazar litros negativos', () => {
      const result = fuelSchema.safeParse({ ...validFuel, liters: -10 })
      expect(result.success).toBe(false)
    })

    it('debería rechazar precio negativo', () => {
      const result = fuelSchema.safeParse({ ...validFuel, price_per_liter: -1 })
      expect(result.success).toBe(false)
    })

    it('debería rechazar kilometraje negativo', () => {
      const result = fuelSchema.safeParse({ ...validFuel, mileage_km: -100 })
      expect(result.success).toBe(false)
    })
  })

  describe('fuel_type', () => {
    it('debería usar diesel por defecto', () => {
      const { fuel_type: _ft, ...rest } = validFuel
      const result = fuelSchema.safeParse(rest)
      expect(result.success).toBe(true)
      expect(result.data.fuel_type).toBe('diesel')
    })

    it('debería aceptar cng', () => {
      const result = fuelSchema.safeParse({ ...validFuel, fuel_type: 'cng' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar tipo inválido', () => {
      const result = fuelSchema.safeParse({ ...validFuel, fuel_type: 'kerosene' })
      expect(result.success).toBe(false)
    })
  })

  describe('campos opcionales', () => {
    it('debería aceptar total_cost_eur', () => {
      const result = fuelSchema.safeParse({ ...validFuel, total_cost_eur: 217.5 })
      expect(result.success).toBe(true)
    })

    it('debería aceptar station', () => {
      const result = fuelSchema.safeParse({ ...validFuel, station: 'Repsol A-1 km 45' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar repostaje completo', () => {
      const result = fuelSchema.safeParse({
        ...validFuel,
        total_cost_eur: 217.5,
        station: 'Repsol A-1',
        route_id: '550e8400-e29b-41d4-a716-446655440001',
        observations: 'Repostaje completo',
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
