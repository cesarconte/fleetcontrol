import { describe, it, expect } from 'vitest'
import { cargoSchema, cargoSearchSchema } from './cargo-schema.js'

describe('cargoSchema', () => {
  const validCargo = {
    route_id: '550e8400-e29b-41d4-a716-446655440000',
    descripcion: 'Electrodomésticos',
    peso_kg: 15000,
    tipo: 'general',
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
      const result = cargoSchema.safeParse({ ...validCargo, descripcion: '' })
      expect(result.success).toBe(false)
    })

    it('debería requerir peso', () => {
      const result = cargoSchema.safeParse({ ...validCargo, peso_kg: null })
      expect(result.success).toBe(false)
    })

    it('debería rechazar peso negativo', () => {
      const result = cargoSchema.safeParse({ ...validCargo, peso_kg: -100 })
      expect(result.success).toBe(false)
    })
  })

  describe('tipo', () => {
    it('debería aceptar general', () => {
      const result = cargoSchema.safeParse({ ...validCargo, tipo: 'general' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar frigorifica', () => {
      const result = cargoSchema.safeParse({ ...validCargo, tipo: 'frigorifica' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar peligrosa', () => {
      const result = cargoSchema.safeParse({ ...validCargo, tipo: 'peligrosa' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar especial', () => {
      const result = cargoSchema.safeParse({ ...validCargo, tipo: 'especial' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar tipo inválido', () => {
      const result = cargoSchema.safeParse({ ...validCargo, tipo: 'unknown' })
      expect(result.success).toBe(false)
    })

    it('debería usar general por defecto', () => {
      const { tipo, ...rest } = validCargo
      const result = cargoSchema.safeParse(rest)
      expect(result.success).toBe(true)
      expect(result.data.tipo).toBe('general')
    })
  })

  describe('ADR', () => {
    it('debería aceptar clase ADR válida', () => {
      const result = cargoSchema.safeParse({
        ...validCargo,
        tipo: 'peligrosa',
        adr_clase: '3',
        adr_numero_onu: '1203',
        adr_grupo_embalaje: 'II',
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
          tipo: 'peligrosa',
          adr_clase: cls,
          adr_numero_onu: '1203',
        })
        expect(result.success).toBe(true)
      }
    })

    it('debería rechazar clase ADR inválida', () => {
      const result = cargoSchema.safeParse({ ...validCargo, tipo: 'peligrosa', adr_clase: '99' })
      expect(result.success).toBe(false)
    })

    it('debería validar formato de número ONU (4 dígitos)', () => {
      const result = cargoSchema.safeParse({
        ...validCargo,
        tipo: 'peligrosa',
        adr_clase: '3',
        adr_numero_onu: '123',
      })
      expect(result.success).toBe(false)
    })

    it('debería aceptar número ONU válido', () => {
      const result = cargoSchema.safeParse({
        ...validCargo,
        tipo: 'peligrosa',
        adr_clase: '3',
        adr_numero_onu: '1203',
      })
      expect(result.success).toBe(true)
    })

    it('debería aceptar adr_grupo_embalaje I/II/III', () => {
      for (const pg of ['I', 'II', 'III']) {
        const result = cargoSchema.safeParse({
          ...validCargo,
          tipo: 'peligrosa',
          adr_clase: '3',
          adr_numero_onu: '1203',
          adr_grupo_embalaje: pg,
        })
        expect(result.success).toBe(true)
      }
    })
  })

  describe('campos opcionales', () => {
    it('debería aceptar carga completa', () => {
      const result = cargoSchema.safeParse({
        ...validCargo,
        volumen_m3: 45,
        cmr_remitente: 'Transportes García SL',
        cmr_destinatario: 'Distribuciones Norte',
        cmr_lugar_entrega: 'Madrid',
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
