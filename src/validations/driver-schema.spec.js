import { describe, it, expect } from 'vitest'
import { driverSchema, driverSearchSchema } from './driver-schema.js'

describe('driverSchema', () => {
  const validDriver = {
    nombre_completo: 'Juan García López',
    nif_nie: '12345678A',
    fecha_nacimiento: '1985-03-15',
    status: 'activo',
  }

  describe('nombre_completo', () => {
    it('debería aceptar nombre válido', () => {
      const result = driverSchema.safeParse({ ...validDriver, nombre_completo: 'Juan García' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar nombre corto', () => {
      const result = driverSchema.safeParse({ ...validDriver, nombre_completo: 'J' })
      expect(result.success).toBe(false)
      expect(result.error.issues[0].message).toContain('2 caracteres')
    })

    it('debería requerir nombre', () => {
      const result = driverSchema.safeParse({ ...validDriver, nombre_completo: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('nif_nie', () => {
    it('debería aceptar NIF válido', () => {
      const result = driverSchema.safeParse({ ...validDriver, nif_nie: '12345678A' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar NIE válido con X', () => {
      const result = driverSchema.safeParse({ ...validDriver, nif_nie: 'X1234567A' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar NIE válido con Y', () => {
      const result = driverSchema.safeParse({ ...validDriver, nif_nie: 'Y1234567A' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar NIF corto', () => {
      const result = driverSchema.safeParse({ ...validDriver, nif_nie: '12345' })
      expect(result.success).toBe(false)
    })

    it('debería rechazar NIF sin letra', () => {
      const result = driverSchema.safeParse({ ...validDriver, nif_nie: '123456789' })
      expect(result.success).toBe(false)
    })

    it('debería rechazar NIF vacío', () => {
      const result = driverSchema.safeParse({ ...validDriver, nif_nie: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('fecha_nacimiento', () => {
    it('debería requerir fecha de nacimiento', () => {
      const result = driverSchema.safeParse({ ...validDriver, fecha_nacimiento: '' })
      expect(result.success).toBe(false)
    })

    it('debería aceptar fecha válida', () => {
      const result = driverSchema.safeParse({ ...validDriver, fecha_nacimiento: '1985-03-15' })
      expect(result.success).toBe(true)
    })
  })

  describe('status', () => {
    it('debería aceptar activo', () => {
      const result = driverSchema.safeParse({ ...validDriver, status: 'activo' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar baja_temporal', () => {
      const result = driverSchema.safeParse({ ...validDriver, status: 'baja_temporal' })
      expect(result.success).toBe(true)
    })

    it('debería aceptar baja_definitiva', () => {
      const result = driverSchema.safeParse({ ...validDriver, status: 'baja_definitiva' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar estado inválido', () => {
      const result = driverSchema.safeParse({ ...validDriver, status: 'unknown' })
      expect(result.success).toBe(false)
    })

    it('debería usar activo por defecto', () => {
      const result = driverSchema.safeParse(validDriver)
      expect(result.success).toBe(true)
      expect(result.data.status).toBe('activo')
    })
  })

  describe('telefono', () => {
    it('debería aceptar teléfono de 9 dígitos', () => {
      const result = driverSchema.safeParse({ ...validDriver, telefono: '612345678' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar teléfono con menos de 9 dígitos', () => {
      const result = driverSchema.safeParse({ ...validDriver, telefono: '61234' })
      expect(result.success).toBe(false)
    })

    it('debería aceptar teléfono vacío', () => {
      const result = driverSchema.safeParse({ ...validDriver, telefono: '' })
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
        nacionalidad: 'Española',
        direccion: 'Calle Mayor 1',
        ciudad: 'Madrid',
        codigo_postal: '28001',
        provincia: 'Madrid',
        telefono: '612345678',
        email: 'juan@test.com',
        fecha_incorporacion: '2020-01-15',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('carnet de conducir', () => {
    it('debería aceptar clase C válida', () => {
      const result = driverSchema.safeParse({
        ...validDriver,
        carnet_clase: 'C',
        carnet_numero: 'ES12345678',
        carnet_fecha_expedicion: '2015-06-01',
        carnet_fecha_vencimiento: '2030-06-01',
      })
      expect(result.success).toBe(true)
    })

    it('debería aceptar clase C+E', () => {
      const result = driverSchema.safeParse({
        ...validDriver,
        carnet_clase: 'C+E',
      })
      expect(result.success).toBe(true)
    })

    it('debería rechazar clase inválida', () => {
      const result = driverSchema.safeParse({
        ...validDriver,
        carnet_clase: 'Z',
      })
      expect(result.success).toBe(false)
    })

    it('debería aceptar carnet_clase vacío', () => {
      const result = driverSchema.safeParse({
        ...validDriver,
        carnet_clase: '',
      })
      expect(result.success).toBe(true)
    })

    it('debería rechazar carnet_numero demasiado largo', () => {
      const result = driverSchema.safeParse({
        ...validDriver,
        carnet_numero: 'A'.repeat(21),
      })
      expect(result.success).toBe(false)
    })
  })

  describe('CAP', () => {
    it('debería aceptar CAP válido', () => {
      const result = driverSchema.safeParse({
        ...validDriver,
        cap_numero: 'CAP-2024-001',
        cap_fecha_vencimiento: '2029-03-15',
        cap_horas_formacion: 35,
      })
      expect(result.success).toBe(true)
    })

    it('debería rechazar menos de 35 horas de formación', () => {
      const result = driverSchema.safeParse({
        ...validDriver,
        cap_horas_formacion: 20,
      })
      expect(result.success).toBe(false)
    })

    it('debería aceptar 35 horas exactas', () => {
      const result = driverSchema.safeParse({
        ...validDriver,
        cap_horas_formacion: 35,
      })
      expect(result.success).toBe(true)
    })

    it('debería aceptar CAP sin horas especificadas', () => {
      const result = driverSchema.safeParse({
        ...validDriver,
        cap_numero: 'CAP-001',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('tarjeta tacógrafo', () => {
    it('debería aceptar tarjeta válida', () => {
      const result = driverSchema.safeParse({
        ...validDriver,
        tarjeta_tacografo_numero: 'TC-2024-001',
        tarjeta_tacografo_vencimiento: '2029-03-15',
      })
      expect(result.success).toBe(true)
    })

    it('debería aceptar campos vacíos', () => {
      const result = driverSchema.safeParse({
        ...validDriver,
        tarjeta_tacografo_numero: '',
        tarjeta_tacografo_vencimiento: '',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('reconocimiento médico', () => {
    it('debería aceptar reconocimiento válido', () => {
      const result = driverSchema.safeParse({
        ...validDriver,
        reconocimiento_medico_fecha: '2025-01-15',
        reconocimiento_medico_vencimiento: '2027-01-15',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('ADR', () => {
    it('debería aceptar conductor sin ADR', () => {
      const result = driverSchema.safeParse({
        ...validDriver,
        adr_certificado: false,
      })
      expect(result.success).toBe(true)
    })

    it('debería aceptar conductor con ADR', () => {
      const result = driverSchema.safeParse({
        ...validDriver,
        adr_certificado: true,
        adr_numero: 'ADR-2025-001',
        adr_fecha_vencimiento: '2030-03-15',
      })
      expect(result.success).toBe(true)
    })

    it('debería usar false por defecto para adr_certificado', () => {
      const result = driverSchema.safeParse(validDriver)
      expect(result.success).toBe(true)
      expect(result.data.adr_certificado).toBe(false)
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
      status: 'activo',
    })
    expect(result.success).toBe(true)
  })
})
