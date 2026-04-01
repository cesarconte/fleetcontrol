import { describe, it, expect } from 'vitest'
import { driverSchema, driverSearchSchema } from './driver-schema.js'

describe('driverSchema', () => {
  const validDriver = {
    full_name: 'Juan García López',
    national_id: '12345678A',
    birth_date: '1985-03-15',
    status: 'active',
  }

  describe('full_name', () => {
    it('debería aceptar nombre válido', () => {
      const result = driverSchema.safeParse({ ...validDriver, full_name: 'Juan García' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar nombre corto', () => {
      const result = driverSchema.safeParse({ ...validDriver, full_name: 'J' })
      expect(result.success).toBe(false)
      expect(result.error.issues[0].message).toContain('2 caracteres')
    })

    it('debería requerir nombre', () => {
      const result = driverSchema.safeParse({ ...validDriver, full_name: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('national_id', () => {
    it('debería aceptar NIF válido', () => {
      const result = driverSchema.safeParse({ ...validDriver, national_id: '12345678A' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar NIE válido con X', () => {
      const result = driverSchema.safeParse({ ...validDriver, national_id: 'X1234567A' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar NIE válido con Y', () => {
      const result = driverSchema.safeParse({ ...validDriver, national_id: 'Y1234567A' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar NIF corto', () => {
      const result = driverSchema.safeParse({ ...validDriver, national_id: '12345' })
      expect(result.success).toBe(false)
    })

    it('debería rechazar NIF sin letra', () => {
      const result = driverSchema.safeParse({ ...validDriver, national_id: '123456789' })
      expect(result.success).toBe(false)
    })

    it('debería rechazar NIF vacío', () => {
      const result = driverSchema.safeParse({ ...validDriver, national_id: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('birth_date', () => {
    it('debería requerir fecha de nacimiento', () => {
      const result = driverSchema.safeParse({ ...validDriver, birth_date: '' })
      expect(result.success).toBe(false)
    })

    it('debería aceptar fecha válida', () => {
      const result = driverSchema.safeParse({ ...validDriver, birth_date: '1985-03-15' })
      expect(result.success).toBe(true)
    })
  })

  describe('status', () => {
    it('debería aceptar active', () => {
      const result = driverSchema.safeParse({ ...validDriver, status: 'active' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar temporary_leave', () => {
      const result = driverSchema.safeParse({ ...validDriver, status: 'temporary_leave' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar permanently_off', () => {
      const result = driverSchema.safeParse({ ...validDriver, status: 'permanently_off' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar estado inválido', () => {
      const result = driverSchema.safeParse({ ...validDriver, status: 'unknown' })
      expect(result.success).toBe(false)
    })

    it('debería usar activo por defecto', () => {
      const result = driverSchema.safeParse(validDriver)
      expect(result.success).toBe(true)
      expect(result.data.status).toBe('active')
    })
  })

  describe('phone', () => {
    it('debería aceptar teléfono de 9 dígitos', () => {
      const result = driverSchema.safeParse({ ...validDriver, phone: '612345678' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar teléfono con menos de 9 dígitos', () => {
      const result = driverSchema.safeParse({ ...validDriver, phone: '61234' })
      expect(result.success).toBe(false)
    })

    it('debería aceptar teléfono vacío', () => {
      const result = driverSchema.safeParse({ ...validDriver, phone: '' })
      expect(result.success).toBe(true)
    })
  })

  describe('email', () => {
    it('debería aceptar email válido', () => {
      const result = driverSchema.safeParse({ ...validDriver, email: 'juan@test.com' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar email inválido', () => {
      const result = driverSchema.safeParse({ ...validDriver, email: 'no-es-email' })
      expect(result.success).toBe(false)
    })

    it('debería aceptar email vacío', () => {
      const result = driverSchema.safeParse({ ...validDriver, email: '' })
      expect(result.success).toBe(true)
    })
  })

  describe('campos opcionales', () => {
    it('debería aceptar conductor solo con campos obligatorios', () => {
      const result = driverSchema.safeParse(validDriver)
      expect(result.success).toBe(true)
    })

    it('debería aceptar conductor con todos los campos', () => {
      const result = driverSchema.safeParse({
        ...validDriver,
        nationality: 'Española',
        address: 'Calle Mayor 1',
        phone: '612345678',
        email: 'juan@test.com',
        join_date: '2020-01-15',
      })
      expect(result.success).toBe(true)
    })
  })
})

describe('driverSearchSchema', () => {
  it('debería aceptar objeto vacío', () => {
    const result = driverSearchSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('debería aceptar filtros', () => {
    const result = driverSearchSchema.safeParse({
      search: 'Juan',
      status: 'active',
    })
    expect(result.success).toBe(true)
  })
})
