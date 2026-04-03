import { describe, it, expect } from 'vitest'
import { generateDocumentSchema, documentTemplateSchema } from './transport-document-schema.js'

describe('transport-document-schema', () => {
  describe('generateDocumentSchema', () => {
    it('debería aceptar datos válidos con tipo CMR', () => {
      const result = generateDocumentSchema.safeParse({
        document_type: 'cmr',
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

    it('debería aceptar los 6 tipos de documento válidos', () => {
      const validTypes = ['cmr', 'albaran', 'hoja_ruta', 'factura', 'pod', 'adr']
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
})
