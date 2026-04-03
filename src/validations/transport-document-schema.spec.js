import { describe, it, expect } from 'vitest'
import {
  generateDocumentSchema,
  documentTemplateSchema,
  cartaPorteNacionalSchema,
  cmrSchema,
  albaranSchema,
  hojaRutaSchema,
  facturaSchema,
  podSchema,
} from './transport-document-schema.js'

describe('transport-document-schema', () => {
  describe('generateDocumentSchema', () => {
    it('debería aceptar datos válidos con tipo CMR', () => {
      const result = generateDocumentSchema.safeParse({
        document_type: 'cmr',
        route_id: '550e8400-e29b-41d4-a716-446655440000',
      })
      expect(result.success).toBe(true)
    })

    it('debería aceptar datos válidos con carta_porte_nacional', () => {
      const result = generateDocumentSchema.safeParse({
        document_type: 'carta_porte_nacional',
        route_id: '550e8400-e29b-41d4-a716-446655440000',
      })
      expect(result.success).toBe(true)
    })

    it('debería aceptar datos válidos con cargo_id opcional', () => {
      const result = generateDocumentSchema.safeParse({
        document_type: 'albaran',
        route_id: '550e8400-e29b-41d4-a716-446655440000',
        cargo_id: '550e8400-e29b-41d4-a716-446655440001',
      })
      expect(result.success).toBe(true)
    })

    it('debería rechazar tipo de documento inválido', () => {
      const result = generateDocumentSchema.safeParse({
        document_type: 'invalid_type',
        route_id: '550e8400-e29b-41d4-a716-446655440000',
      })
      expect(result.success).toBe(false)
    })

    it('debería rechazar route_id inválido (no UUID)', () => {
      const result = generateDocumentSchema.safeParse({
        document_type: 'cmr',
        route_id: 'not-a-uuid',
      })
      expect(result.success).toBe(false)
    })

    it('debería rechazar route_id faltante', () => {
      const result = generateDocumentSchema.safeParse({
        document_type: 'cmr',
      })
      expect(result.success).toBe(false)
    })

    it('debería rechazar document_type faltante', () => {
      const result = generateDocumentSchema.safeParse({
        route_id: '550e8400-e29b-41d4-a716-446655440000',
      })
      expect(result.success).toBe(false)
    })

    it('debería aceptar los 7 tipos de documento válidos', () => {
      const validTypes = [
        'carta_porte_nacional',
        'cmr',
        'albaran',
        'hoja_ruta',
        'factura',
        'pod',
        'adr',
      ]
      validTypes.forEach(type => {
        const result = generateDocumentSchema.safeParse({
          document_type: type,
          route_id: '550e8400-e29b-41d4-a716-446655440000',
        })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('documentTemplateSchema', () => {
    it('debería aceptar template válido', () => {
      const result = documentTemplateSchema.safeParse({
        document_type: 'cmr',
        name: 'Carta de Porte CMR',
        description: 'Plantilla estándar CMR',
        field_config: { layout: 'cmr_standard' },
        is_active: true,
      })
      expect(result.success).toBe(true)
    })

    it('debería rechazar nombre vacío', () => {
      const result = documentTemplateSchema.safeParse({
        document_type: 'cmr',
        name: '',
      })
      expect(result.success).toBe(false)
    })

    it('debería rechazar tipo de documento inválido', () => {
      const result = documentTemplateSchema.safeParse({
        document_type: 'invalid',
        name: 'Test',
      })
      expect(result.success).toBe(false)
    })

    it('debería rechazar nombre mayor a 200 caracteres', () => {
      const result = documentTemplateSchema.safeParse({
        document_type: 'cmr',
        name: 'A'.repeat(201),
      })
      expect(result.success).toBe(false)
    })

    it('debería aceptar description vacía como opcional', () => {
      const result = documentTemplateSchema.safeParse({
        document_type: 'cmr',
        name: 'CMR',
        description: '',
      })
      expect(result.success).toBe(true)
    })

    it('debería usar is_active true por defecto', () => {
      const result = documentTemplateSchema.safeParse({
        document_type: 'cmr',
        name: 'CMR',
      })
      expect(result.success).toBe(true)
      expect(result.data.is_active).toBe(true)
    })
  })

  describe('cartaPorteNacionalSchema', () => {
    const validNacional = {
      shipper_name: 'Transportes Iberia S.L.',
      shipper_nif: 'B12345678',
      shipper_address: 'Av. Constitución 10',
      carrier_name: 'Transportes Iberia S.L.',
      carrier_nif: 'B12345678',
      consignee_name: 'Distribuciones BCN S.L.',
      consignee_address: 'Polígono Industrial, Barcelona',
      issue_place: 'Madrid',
      issue_date: '2026-04-15',
      loading_address: 'Calle de Alcalá 1, Madrid',
      delivery_address: 'Av. Diagonal 100, Barcelona',
      goods_nature: 'Productos alimentarios',
      gross_weight_kg: 15000,
      packaging_type: 'Palets EUR',
      freight_price: 1200,
      payment_terms: '30 días',
    }

    it('debería aceptar datos completos válidos', () => {
      const result = cartaPorteNacionalSchema.safeParse(validNacional)
      expect(result.success).toBe(true)
    })

    it('debería rechazar shipper_name vacío', () => {
      const result = cartaPorteNacionalSchema.safeParse({ ...validNacional, shipper_name: '' })
      expect(result.success).toBe(false)
    })

    it('debería rechazar shipper_nif vacío', () => {
      const result = cartaPorteNacionalSchema.safeParse({ ...validNacional, shipper_nif: '' })
      expect(result.success).toBe(false)
    })

    it('debería rechazar gross_weight_kg negativo', () => {
      const result = cartaPorteNacionalSchema.safeParse({ ...validNacional, gross_weight_kg: -100 })
      expect(result.success).toBe(false)
    })

    it('debería rechazar freight_price negativo', () => {
      const result = cartaPorteNacionalSchema.safeParse({ ...validNacional, freight_price: -50 })
      expect(result.success).toBe(false)
    })
  })

  describe('cmrSchema', () => {
    const validCmr = {
      issue_place: 'Madrid',
      issue_date: '2026-04-15',
      shipper_name: 'Transportes Iberia S.L.',
      shipper_address: 'Av. Constitución 10',
      carrier_name: 'Transportes Iberia S.L.',
      carrier_address: 'Av. Constitución 10',
      consignee_name: 'Distribuciones BCN S.L.',
      consignee_address: 'Polígono Industrial, Barcelona',
      pickup_place: 'Madrid',
      pickup_date: '2026-04-15',
      delivery_place: 'Barcelona',
      goods_nature: 'Productos alimentarios',
      packaging_type: 'Palets EUR',
      gross_weight_kg: 15000,
      freight_charges: 1200,
      payment_terms: '30 días',
    }

    it('debería aceptar datos CMR completos válidos', () => {
      const result = cmrSchema.safeParse(validCmr)
      expect(result.success).toBe(true)
    })

    it('debería rechazar issue_place vacío (CMR art. 5a)', () => {
      const result = cmrSchema.safeParse({ ...validCmr, issue_place: '' })
      expect(result.success).toBe(false)
    })

    it('debería rechazar shipper_name vacío (CMR art. 5b)', () => {
      const result = cmrSchema.safeParse({ ...validCmr, shipper_name: '' })
      expect(result.success).toBe(false)
    })

    it('debería rechazar gross_weight_kg negativo (CMR art. 5h)', () => {
      const result = cmrSchema.safeParse({ ...validCmr, gross_weight_kg: -100 })
      expect(result.success).toBe(false)
    })
  })

  describe('albaranSchema', () => {
    it('debería aceptar albarán válido', () => {
      const result = albaranSchema.safeParse({
        sender_name: 'Test S.L.',
        sender_address: 'Calle Test 1',
        recipient_name: 'Destinatario S.A.',
        recipient_address: 'Av. Destino 10',
        delivery_date: '2026-04-15',
        items_description: 'Mercancía diversa',
      })
      expect(result.success).toBe(true)
    })

    it('debería rechazar sender_name vacío', () => {
      const result = albaranSchema.safeParse({
        sender_name: '',
        sender_address: 'Calle Test 1',
        recipient_name: 'Destinatario S.A.',
        recipient_address: 'Av. Destino 10',
        delivery_date: '2026-04-15',
        items_description: 'Mercancía diversa',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('hojaRutaSchema', () => {
    it('debería aceptar hoja de ruta válida', () => {
      const result = hojaRutaSchema.safeParse({
        vehicle_plate: '1234-ABC',
        driver_name: 'Juan García',
        driver_license: 'B12345678',
        route_origin: 'Madrid',
        route_destination: 'Barcelona',
        departure_date: '2026-04-15',
        cargo_description: 'Mercancía',
      })
      expect(result.success).toBe(true)
    })

    it('debería rechazar vehicle_plate vacío', () => {
      const result = hojaRutaSchema.safeParse({
        vehicle_plate: '',
        driver_name: 'Juan García',
        driver_license: 'B12345678',
        route_origin: 'Madrid',
        route_destination: 'Barcelona',
        departure_date: '2026-04-15',
        cargo_description: 'Mercancía',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('facturaSchema', () => {
    it('debería aceptar factura válida', () => {
      const result = facturaSchema.safeParse({
        invoice_number: 'FAC-2026-001',
        invoice_date: '2026-04-15',
        sender_name: 'Test S.L.',
        sender_tax_id: 'B12345678',
        recipient_name: 'Cliente S.A.',
        recipient_tax_id: 'A87654321',
        service_amount: 1000,
        iva_rate: 21,
        total_amount: 1210,
      })
      expect(result.success).toBe(true)
    })

    it('debería rechazar invoice_number vacío', () => {
      const result = facturaSchema.safeParse({
        invoice_number: '',
        invoice_date: '2026-04-15',
        sender_name: 'Test S.L.',
        sender_tax_id: 'B12345678',
        recipient_name: 'Cliente S.A.',
        recipient_tax_id: 'A87654321',
        service_amount: 1000,
        iva_rate: 21,
        total_amount: 1210,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('podSchema', () => {
    it('debería aceptar POD válido', () => {
      const result = podSchema.safeParse({
        recipient_name: 'Destinatario S.L.',
        delivery_date: '2026-04-15',
        cargo_description: 'Mercancía entregada',
      })
      expect(result.success).toBe(true)
    })

    it('debería rechazar recipient_name vacío', () => {
      const result = podSchema.safeParse({
        recipient_name: '',
        delivery_date: '2026-04-15',
        cargo_description: 'Mercancía entregada',
      })
      expect(result.success).toBe(false)
    })
  })
})
