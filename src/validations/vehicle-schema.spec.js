import { describe, it, expect } from 'vitest'
import { vehicleSchema, vehicleSearchSchema } from './vehicle-schema.js'

describe('vehicleSchema', () => {
  const validVehicle = {
    plate: '1234ABC',
    brand: 'Mercedes',
    model: 'Actros',
    vehicle_type: 'tractor',
    fuel_type: 'diesel',
    dgt_badge: 'none',
  }

  describe('plate', () => {
    it('debería aceptar matrícula española válida', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, plate: '1234ABC' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar matrícula corta', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, plate: '12A' })
      expect(result.success).toBe(false)
      expect(result.error.issues[0].message).toContain('mínimo')
    })

    it('debería rechazar matrícula sin números', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, plate: 'ABCDEFG' })
      expect(result.success).toBe(false)
    })

    it('debería rechazar matrícula vacía', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, plate: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('brand y model', () => {
    it('debería requerir marca', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, brand: '' })
      expect(result.success).toBe(false)
    })

    it('debería requerir modelo', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, model: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('vehicle_type', () => {
    it('debería aceptar tractor', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, vehicle_type: 'tractor' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar tipo inválido', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, vehicle_type: 'spaceship' })
      expect(result.success).toBe(false)
    })
  })

  describe('dgt_badge', () => {
    it('debería aceptar zero', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, dgt_badge: 'zero' })
      expect(result.success).toBe(true)
    })

    it('debería usar none por defecto', () => {
      const result = vehicleSchema.safeParse(validVehicle)
      expect(result.success).toBe(true)
      expect(result.data.dgt_badge).toBe('none')
    })
  })

  describe('gross_weight_kg', () => {
    it('debería aceptar peso válido', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, gross_weight_kg: 40000 })
      expect(result.success).toBe(true)
    })

    it('debería rechazar peso mayor a 44000', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, gross_weight_kg: 50000 })
      expect(result.success).toBe(false)
      expect(result.error.issues[0].message).toContain('44.000')
    })

    it('debería rechazar peso negativo', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, gross_weight_kg: -100 })
      expect(result.success).toBe(false)
    })

    it('debería aceptar null', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, gross_weight_kg: null })
      expect(result.success).toBe(true)
    })
  })

  describe('dimensiones', () => {
    it('debería rechazar ancho mayor a 2.60', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, width_m: 3.0 })
      expect(result.success).toBe(false)
      expect(result.error.issues[0].message).toContain('2,60')
    })

    it('debería rechazar altura mayor a 4.00', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, height_m: 5.0 })
      expect(result.success).toBe(false)
      expect(result.error.issues[0].message).toContain('4,00')
    })

    it('debería rechazar largo mayor a 16.50', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, length_m: 18.0 })
      expect(result.success).toBe(false)
      expect(result.error.issues[0].message).toContain('16,50')
    })
  })

  describe('vin', () => {
    it('debería aceptar VIN de 17 caracteres', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, vin: 'WDB9634031L123456' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar VIN con longitud incorrecta', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, vin: 'SHORT' })
      expect(result.success).toBe(false)
    })

    it('debería aceptar VIN vacío', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, vin: '' })
      expect(result.success).toBe(true)
    })
  })
})

describe('vehicleSearchSchema', () => {
  it('debería aceptar objeto vacío', () => {
    const result = vehicleSearchSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('debería aceptar filtros', () => {
    const result = vehicleSearchSchema.safeParse({
      search: '1234',
      status: 'active',
      vehicle_type: 'tractor',
      dgt_badge: 'eco',
    })
    expect(result.success).toBe(true)
  })
})
