import { describe, it, expect } from 'vitest'
import { vehicleSchema, vehicleSearchSchema } from './vehicle-schema.js'

describe('vehicleSchema', () => {
  const validVehicle = {
    plate: '1234ABC',
    brand: 'Mercedes',
    model: 'Actros',
    eu_category: 'N3',
    body_type: 'curtain',
    fuel_type: 'diesel',
    dgt_badge: 'sin_etiqueta',
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
    it('debería requerir brand', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, brand: '' })
      expect(result.success).toBe(false)
    })

    it('debería requerir model', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, model: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('eu_category', () => {
    it('debería aceptar N3', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, eu_category: 'N3' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar N1', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, eu_category: 'N1' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar O4', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, eu_category: 'O4' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar categoría inválida', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, eu_category: 'X9' })
      expect(result.success).toBe(false)
    })
  })

  describe('body_type', () => {
    it('debería aceptar curtain (lona)', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, body_type: 'curtain' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar tanker (cisterna)', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, body_type: 'tanker' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar refrigerated (frigorífico)', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, body_type: 'refrigerated' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar carrocería inválida', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, body_type: 'spaceship' })
      expect(result.success).toBe(false)
    })
  })

  describe('dgt_badge', () => {
    it('debería aceptar 0', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, dgt_badge: '0' })
      expect(result.success).toBe(true)
    })

    it('debería usar sin_etiqueta por defecto', () => {
      const result = vehicleSchema.safeParse(validVehicle)
      expect(result.success).toBe(true)
      expect(result.data.dgt_badge).toBe('sin_etiqueta')
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

  it('debería aceptar filtros con nuevos campos', () => {
    const result = vehicleSearchSchema.safeParse({
      search: '1234',
      status: 'activo',
      eu_category: 'N3',
      body_type: 'curtain',
      dgt_badge: 'eco',
    })
    expect(result.success).toBe(true)
  })
})
