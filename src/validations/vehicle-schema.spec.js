import { describe, it, expect } from 'vitest'
import { vehicleSchema, vehicleSearchSchema } from './vehicle-schema.js'

describe('vehicleSchema', () => {
  const validVehicle = {
    matricula: '1234ABC',
    marca: 'Mercedes',
    modelo: 'Actros',
    categoria_ue: 'N3',
    tipo_carroceria: 'lona',
    tipo_combustible: 'diesel',
    distintivo_ambiental: 'sin_etiqueta',
  }

  describe('matricula', () => {
    it('debería aceptar matrícula española válida', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, matricula: '1234ABC' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar matrícula corta', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, matricula: '12A' })
      expect(result.success).toBe(false)
      expect(result.error.issues[0].message).toContain('mínimo')
    })

    it('debería rechazar matrícula sin números', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, matricula: 'ABCDEFG' })
      expect(result.success).toBe(false)
    })

    it('debería rechazar matrícula vacía', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, matricula: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('marca y modelo', () => {
    it('debería requerir marca', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, marca: '' })
      expect(result.success).toBe(false)
    })

    it('debería requerir modelo', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, modelo: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('categoria_ue', () => {
    it('debería aceptar N3', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, categoria_ue: 'N3' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar N1', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, categoria_ue: 'N1' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar O4', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, categoria_ue: 'O4' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar categoría inválida', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, categoria_ue: 'X9' })
      expect(result.success).toBe(false)
    })
  })

  describe('tipo_carroceria', () => {
    it('debería aceptar lona', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, tipo_carroceria: 'lona' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar cisterna', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, tipo_carroceria: 'cisterna' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar frigorifico', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, tipo_carroceria: 'frigorifico' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar carrocería inválida', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, tipo_carroceria: 'spaceship' })
      expect(result.success).toBe(false)
    })
  })

  describe('distintivo_ambiental', () => {
    it('debería aceptar 0', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, distintivo_ambiental: '0' })
      expect(result.success).toBe(true)
    })

    it('debería usar sin_etiqueta por defecto', () => {
      const result = vehicleSchema.safeParse(validVehicle)
      expect(result.success).toBe(true)
      expect(result.data.distintivo_ambiental).toBe('sin_etiqueta')
    })
  })

  describe('mma_kg', () => {
    it('debería aceptar peso válido', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, mma_kg: 40000 })
      expect(result.success).toBe(true)
    })

    it('debería rechazar peso mayor a 44000', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, mma_kg: 50000 })
      expect(result.success).toBe(false)
      expect(result.error.issues[0].message).toContain('44.000')
    })

    it('debería rechazar peso negativo', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, mma_kg: -100 })
      expect(result.success).toBe(false)
    })

    it('debería aceptar null', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, mma_kg: null })
      expect(result.success).toBe(true)
    })
  })

  describe('dimensiones', () => {
    it('debería rechazar ancho mayor a 2.60', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, anchura_max_m: 3.0 })
      expect(result.success).toBe(false)
      expect(result.error.issues[0].message).toContain('2,60')
    })

    it('debería rechazar altura mayor a 4.00', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, altura_max_m: 5.0 })
      expect(result.success).toBe(false)
      expect(result.error.issues[0].message).toContain('4,00')
    })

    it('debería rechazar largo mayor a 16.50', () => {
      const result = vehicleSchema.safeParse({ ...validVehicle, longitud_total_m: 18.0 })
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
      categoria_ue: 'N3',
      tipo_carroceria: 'lona',
      distintivo_ambiental: 'eco',
    })
    expect(result.success).toBe(true)
  })
})
