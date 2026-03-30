import { describe, it, expect } from 'vitest'
import { cargoSchema, cargoSearchSchema } from './cargo-schema.js'

describe('cargoSchema', () => {
  const validCargo = {
    route_id: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Electrodomésticos',
    weight_kg: 15000,
    type: 'general',
  }

  describe('campos obligatorios', () => {
    it('debería aceptar carga con mínimos', () => {
      const result = cargoSchema.safeParse(validCargo)
      expect(result.success).toBe(true)
    })

    it('debería requerir route_id', () => {
      const result = cargoSchema.safeParse({ ...validCargo, route_id: '' })
      expect(result.success).toBe(false)
    })

    it('debería requerir descripción', () => {
      const result = cargoSchema.safeParse({ ...validCargo, description: '' })
      expect(result.success).toBe(false)
    })

    it('debería requerir peso', () => {
      const result = cargoSchema.safeParse({ ...validCargo, weight_kg: null })
      expect(result.success).toBe(false)
    })

    it('debería rechazar peso negativo', () => {
      const result = cargoSchema.safeParse({ ...validCargo, weight_kg: -100 })
      expect(result.success).toBe(false)
    })
  })

  describe('type', () => {
    it('debería aceptar general', () => {
      const result = cargoSchema.safeParse({ ...validCargo, type: 'general' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar refrigerated', () => {
      const result = cargoSchema.safeParse({ ...validCargo, type: 'refrigerated' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar dangerous', () => {
      const result = cargoSchema.safeParse({ ...validCargo, type: 'dangerous' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar special', () => {
      const result = cargoSchema.safeParse({ ...validCargo, type: 'special' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar tipo inválido', () => {
      const result = cargoSchema.safeParse({ ...validCargo, type: 'unknown' })
      expect(result.success).toBe(false)
    })

    it('debería usar general por defecto', () => {
      const { type, ...rest } = validCargo
      const result = cargoSchema.safeParse(rest)
      expect(result.success).toBe(true)
      expect(result.data.type).toBe('general')
    })
  })

  describe('ADR', () => {
    it('debería aceptar clase ADR válida', () => {
      const result = cargoSchema.safeParse({
        ...validCargo,
        type: 'dangerous',
        adr_class: '3',
        un_number: '1203',
        packing_group: 'II',
      })
      expect(result.success).toBe(true)
    })

    it('debería aceptar todas las clases ADR', () => {
      const classes = [
        '1',
        '2',
        '3',
        '4.1',
        '4.2',
        '4.3',
        '5.1',
        '5.2',
        '6.1',
        '6.2',
        '7',
        '8',
        '9',
      ]
      for (const cls of classes) {
        const result = cargoSchema.safeParse({
          ...validCargo,
          type: 'dangerous',
          adr_class: cls,
          un_number: '1203',
        })
        expect(result.success).toBe(true)
      }
    })

    it('debería rechazar clase ADR inválida', () => {
      const result = cargoSchema.safeParse({ ...validCargo, type: 'dangerous', adr_class: '99' })
      expect(result.success).toBe(false)
    })

    it('debería validar formato de número ONU (4 dígitos)', () => {
      const result = cargoSchema.safeParse({
        ...validCargo,
        type: 'dangerous',
        adr_class: '3',
        un_number: '123',
      })
      expect(result.success).toBe(false)
    })

    it('debería aceptar número ONU válido', () => {
      const result = cargoSchema.safeParse({
        ...validCargo,
        type: 'dangerous',
        adr_class: '3',
        un_number: '1203',
      })
      expect(result.success).toBe(true)
    })

    it('debería aceptar packing group I/II/III', () => {
      for (const pg of ['I', 'II', 'III']) {
        const result = cargoSchema.safeParse({
          ...validCargo,
          type: 'dangerous',
          adr_class: '3',
          un_number: '1203',
          packing_group: pg,
        })
        expect(result.success).toBe(true)
      }
    })
  })

  describe('campos opcionales', () => {
    it('debería aceptar carga completa', () => {
      const result = cargoSchema.safeParse({
        ...validCargo,
        volume_m3: 45,
        sender_name: 'Transportes García SL',
        receiver_name: 'Distribuciones Norte',
        loading_place: 'Madrid',
        unloading_place: 'Bilbao',
        observations: 'Entrega antes del viernes',
      })
      expect(result.success).toBe(true)
    })

    it('debería aceptar refrigerada con temperatura', () => {
      const result = cargoSchema.safeParse({
        ...validCargo,
        type: 'refrigerated',
        required_temp_min_c: -18,
        required_temp_max_c: -15,
      })
      expect(result.success).toBe(true)
    })
  })
})

describe('cargoSearchSchema', () => {
  it('debería aceptar objeto vacío', () => {
    const result = cargoSearchSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})
